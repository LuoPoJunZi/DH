/**
 * Typed adaptation of the owner's worker.js: same state coordinates, random
 * offsets, reverse-address fields, name lists and phone area codes.
 * No Google or external address-correctness checks are performed.
 */
import workerData from './us-worker.data.json';
import type { AddressRecord } from '../../src/tools/other/address-generator/types';
import type { Scope, OsmAddressPool } from './providers';
import { ApiError, readJsonLimited, withTimeout } from './runtime';
import { isObject } from '../../src/tools/other/address-generator/utils';
import { addressSourceConfig } from './config';

type Coordinate = { lat: number; lng: number };
const stateCoordinates: Record<string, readonly Coordinate[]> = workerData.stateCoordinates;
const areaCodes: Record<string, readonly string[]> = workerData.areaCodesUS;
export const workerStates = workerData.states;
function pick<T>(values: readonly T[], random: () => number): T {
  const value = random();
  return values[
    Math.min(
      values.length - 1,
      Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * values.length)),
    )
  ]!;
}
export function getRandomState(random: () => number = Math.random): string {
  return pick(workerStates, random).abbr;
}
export function getRandomLocationInState(
  state: string,
  random: () => number = Math.random,
  fallback?: Coordinate,
): Coordinate | null {
  const coords = stateCoordinates[state] ?? (fallback ? [fallback] : []);
  if (!coords.length) return null;
  const reference = pick(coords, random);
  return {
    lat: reference.lat + (random() - 0.5) * 0.1,
    lng: reference.lng + (random() - 0.5) * 0.1,
  };
}
function field(value: unknown, max = 240): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
export function formatAddress(address: Record<string, unknown>, state: string): string | null {
  const house = field(address.house_number);
  const road = field(address.road);
  const city = field(address.city);
  if (!house || !road || !city) return null;
  return [house + ' ' + road, city, state, field(address.postcode), 'United States']
    .filter(Boolean)
    .join(', ');
}
export function getRandomName(random: () => number = Math.random): string {
  return pick(workerData.firstNames, random) + ' ' + pick(workerData.lastNames, random);
}
export function getRandomPhoneNumber(state: string, random: () => number = Math.random): string {
  const area = pick(
    areaCodes[state] ?? ['202', '212', '312', '404', '415', '503', '602', '617', '713', '818'],
    random,
  );
  const exchange = Math.floor(200 + random() * 700)
    .toString()
    .padStart(3, '0');
  const line = Math.floor(1000 + random() * 9000)
    .toString()
    .padStart(4, '0');
  return '(' + area + ') ' + exchange + '-' + line;
}
export function normalizeWorkerAddress(
  value: unknown,
  scope: Scope,
  now: () => number,
): AddressRecord | null {
  if (
    !isObject(value) ||
    !isObject(value.address) ||
    field(value.address.country_code).toLowerCase() !== 'us'
  )
    return null;
  const sourceState =
    field(value.address['ISO3166-2-lvl4']).replace(/^US-/, '') ||
    field(value.address.state_code) ||
    field(value.address.state);
  const fullAddress = formatAddress(value.address, sourceState || scope.regionCode);
  if (
    !fullAddress ||
    !['node', 'way', 'relation'].includes(String(value.osm_type)) ||
    typeof value.osm_id !== 'number' ||
    !Number.isSafeInteger(value.osm_id) ||
    value.osm_id <= 0
  )
    return null;
  const latitude = Number(value.lat),
    longitude = Number(value.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    return null;
  const address = value.address;
  const postalCode = field(address.postcode, 40);
  const retrievedAt = new Date(now()).toISOString();
  return {
    schemaVersion: 6,
    id: 'candidate',
    countryCode: 'US',
    countryName: scope.countryName,
    countryNameEn: scope.countryNameEn,
    regionCode: scope.regionCode,
    region: field(address.state),
    cityId: scope.cityId,
    city: field(address.city),
    district: field(address.suburb ?? address.county),
    addressLine1: field(address.house_number) + ' ' + field(address.road),
    addressLine2: '',
    street: field(address.road),
    houseNumber: field(address.house_number),
    postalCode,
    postalCodeStatus: postalCode ? 'source' : 'missing',
    recipient: '',
    gender: '',
    email: '',
    phone: '',
    contactKind: 'none',
    fullAddress,
    latitude,
    longitude,
    queryArea: scope.countryName + ' / ' + scope.regionName,
    source: 'OpenStreetMap',
    sourcePlaceId: String(value.osm_type) + '/' + String(value.osm_id),
    dataKind: 'mapped',
    verified: false,
    createdAt: retrievedAt,
    retrievedAt,
    warnings: postalCode ? [] : ['地图未提供邮编，未补造。'],
  };
}
let nextReverseRequest = 0;
async function waitForReverseSlot(signal: AbortSignal): Promise<void> {
  const at = Math.max(Date.now(), nextReverseRequest);
  nextReverseRequest = at + 1100;
  const delay = at - Date.now();
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (delay <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, delay);
    signal.addEventListener('abort', abort, { once: true });
  });
}
export async function fetchUsWorkerPool(
  scope: Scope,
  parent: AbortSignal,
  fetcher: typeof fetch,
  now: () => number,
  count = 1,
  random: () => number = Math.random,
  schedule: (signal: AbortSignal) => Promise<void> = waitForReverseSlot,
): Promise<OsmAddressPool> {
  const deadline = withTimeout(parent, 24000);
  const records: AddressRecord[] = [];
  const seen = new Set<string>();
  let networkFailures = 0;
  try {
    // Keep the worker's retry-until-an-address pattern, with a request deadline.
    for (let attempt = 0; attempt < 20 && records.length < count; attempt++) {
      if (deadline.signal.aborted) break;
      const location = getRandomLocationInState(scope.regionCode, random, {
        lat: scope.seed.latitude,
        lng: scope.seed.longitude,
      });
      if (!location) break;
      await schedule(deadline.signal);
      const url = new URL(addressSourceConfig.reverseEndpoint);
      url.search = new URLSearchParams({
        format: 'jsonv2',
        lat: String(location.lat),
        lon: String(location.lng),
        zoom: '18',
        addressdetails: '1',
      }).toString();
      const attemptTimeout = withTimeout(deadline.signal, 6500);
      try {
        const response = await fetcher(url, {
          headers: {
            'User-Agent': addressSourceConfig.userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: attemptTimeout.signal,
          redirect: 'error',
        });
        if (response.status === 429)
          throw new ApiError(429, '开放地图服务正限流，请稍后重试。', 'UPSTREAM_LIMIT');
        if (response.status === 403)
          throw new ApiError(503, '开放地图服务暂时拒绝访问，请稍后重试。', 'UPSTREAM_UNAVAILABLE');
        if (response.status >= 500)
          throw new ApiError(503, '美国地址地图服务暂不可用，请稍后重试。', 'UPSTREAM_UNAVAILABLE');
        if (!response.ok) continue;
        const record = normalizeWorkerAddress(await readJsonLimited(response, 100000), scope, now);
        if (record && !seen.has(record.sourcePlaceId)) {
          records.push(record);
          seen.add(record.sourcePlaceId);
        }
      } catch (error) {
        if (error instanceof ApiError && [429, 503].includes(error.status)) throw error;
        if (deadline.signal.aborted) break;
        networkFailures++;
        if (networkFailures >= 3)
          throw new ApiError(502, '无法连接美国地址地图服务，请稍后重试。', 'UPSTREAM_NETWORK');
      } finally {
        attemptTimeout.dispose();
      }
    }
    if (!records.length) {
      if (deadline.signal.aborted)
        throw new ApiError(504, '美国地址在线获取超时，请重试或更换州。', 'UPSTREAM_TIMEOUT');
      throw new ApiError(
        404,
        '本次未获取到带门牌、街道和城市的美国地址，请重试或更换州。',
        'NO_RESULTS',
      );
    }
    return { records, retrievedAt: new Date(now()).toISOString() };
  } finally {
    deadline.dispose();
  }
}
export async function getUserData(
  state: string,
  parent: AbortSignal,
  fetcher: typeof fetch,
  random: () => number = Math.random,
): Promise<{ recipient: string; gender: string; phone: string }> {
  const timeout = withTimeout(parent, 4000);
  try {
    const response = await fetcher(addressSourceConfig.profileEndpoint, {
      signal: timeout.signal,
      redirect: 'error',
    });
    if (response.ok) {
      const value = await readJsonLimited(response, 100000);
      const user: unknown =
        isObject(value) && Array.isArray(value.results) ? value.results[0] : null;
      if (isObject(user) && isObject(user.name)) {
        const name = [field(user.name.first, 80), field(user.name.last, 80)]
          .filter(Boolean)
          .join(' ');
        if (name)
          return {
            recipient: name,
            gender: field(user.gender, 20),
            phone: getRandomPhoneNumber(state, random),
          };
      }
    }
  } catch {
    /* Reuse the original worker's independent test-profile fallback. */
  } finally {
    timeout.dispose();
  }
  return {
    recipient: getRandomName(random),
    gender: 'Unknown',
    phone: getRandomPhoneNumber(state, random),
  };
}
