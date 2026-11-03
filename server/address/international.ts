import type { AddressRecord } from '../../src/tools/other/address-generator/types';
import { isObject } from '../../src/tools/other/address-generator/utils';
import { addressSourceConfig } from './config';
import { fetchMappedPool, formatFull, type OsmAddressPool, type Scope } from './providers';
import { ApiError, readJsonLimited, withTimeout } from './runtime';
import { waitForReverseSlot } from './us-worker';

function text(value: unknown, max = 240): string {
  return typeof value === 'string'
    ? value
        .replace(/\p{Cc}/gu, ' ')
        .trim()
        .slice(0, max)
    : '';
}
export function normalizeInternationalReverse(
  value: unknown,
  scope: Scope,
  now: () => number,
): AddressRecord | null {
  if (!isObject(value) || !isObject(value.address)) return null;
  const address = value.address;
  if (text(address.country_code).toUpperCase() !== scope.countryCode) return null;
  const houseNumber = text(address.house_number, 40);
  const street = text(address.road ?? address.pedestrian ?? address.residential);
  const neighbourhood = text(address.neighbourhood ?? address.quarter ?? address.suburb);
  if (!houseNumber || (!street && !(scope.countryCode === 'JP' && neighbourhood))) return null;
  if (
    !['node', 'way', 'relation'].includes(String(value.osm_type)) ||
    typeof value.osm_id !== 'number' ||
    !Number.isSafeInteger(value.osm_id) ||
    value.osm_id <= 0
  )
    return null;
  const latitude = Number(value.lat),
    longitude = Number(value.lon);
  if (
    !value.lat ||
    !value.lon ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    Math.abs(latitude - scope.seed.latitude) > 0.017 ||
    Math.abs(longitude - scope.seed.longitude) > 0.023
  )
    return null;
  const city = text(address.city ?? address.town ?? address.village ?? address.municipality);
  const region = text(address.state ?? address.province);
  const postalCode = text(address.postcode, 40);
  const addressLine1 = street
    ? ['DE', 'FR', 'NL', 'TR', 'ES', 'IT'].includes(scope.countryCode)
      ? street + ' ' + houseNumber
      : houseNumber + ' ' + street
    : neighbourhood + ' ' + houseNumber;
  const retrievedAt = new Date(now()).toISOString();
  return {
    schemaVersion: 6,
    id: 'candidate',
    countryCode: scope.countryCode,
    countryName: scope.countryName,
    countryNameEn: scope.countryNameEn,
    regionCode: scope.regionCode,
    region,
    cityId: scope.cityId,
    city,
    district: text(address.suburb ?? address.county),
    addressLine1,
    addressLine2: '',
    street,
    houseNumber,
    postalCode,
    postalCodeStatus: postalCode ? 'source' : scope.countryCode === 'HK' ? 'not-used' : 'missing',
    recipient: '',
    gender: '',
    email: '',
    phone: '',
    contactKind: 'none',
    latitude,
    longitude,
    fullAddress: formatFull(scope, addressLine1, city, region, postalCode),
    queryArea: scope.queryArea,
    source: 'OpenStreetMap',
    sourcePlaceId: String(value.osm_type) + '/' + String(value.osm_id),
    dataKind: 'mapped',
    verified: false,
    createdAt: retrievedAt,
    retrievedAt,
    warnings: [
      ...(city ? [] : ['地图没有单独标注城市，字段已留空。']),
      ...(region ? [] : ['地图没有单独标注州省，字段已留空。']),
      ...(postalCode || scope.countryCode === 'HK' ? [] : ['地图未提供邮编，未补造。']),
    ],
  };
}
export async function fetchInternationalReverse(
  scope: Scope,
  parent: AbortSignal,
  fetcher: typeof fetch,
  now: () => number,
  count = 1,
  random: () => number = Math.random,
  schedule: (signal: AbortSignal) => Promise<void> = waitForReverseSlot,
): Promise<OsmAddressPool> {
  const deadline = withTimeout(parent, 12000);
  const records: AddressRecord[] = [];
  const seen = new Set<string>();
  try {
    for (let attempt = 0; attempt < 6 && records.length < count; attempt++) {
      if (deadline.signal.aborted) break;
      await schedule(deadline.signal);
      const url = new URL(addressSourceConfig.reverseEndpoint);
      const offset = (span: number) => {
        const value = random();
        return (Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.5)) - 0.5) * span;
      };
      url.search = new URLSearchParams({
        format: 'jsonv2',
        lat: String(scope.seed.latitude + offset(0.012)),
        lon: String(scope.seed.longitude + offset(0.016)),
        zoom: '18',
        addressdetails: '1',
      }).toString();
      const timeout = withTimeout(deadline.signal, 4500);
      try {
        const response = await fetcher(url, {
          headers: {
            'User-Agent': addressSourceConfig.userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: timeout.signal,
          redirect: 'manual',
        });
        if (response.status === 429)
          throw new ApiError(429, '开放地图服务正限流，请稍后重试。', 'UPSTREAM_LIMIT');
        if (
          response.status === 403 ||
          response.status >= 500 ||
          (response.status >= 300 && response.status < 400)
        )
          throw new ApiError(503, '开放地图反向查询暂不可用，请稍后重试。', 'UPSTREAM_UNAVAILABLE');
        if (!response.ok) continue;
        const record = normalizeInternationalReverse(
          await readJsonLimited(response, 100000),
          scope,
          now,
        );
        if (record && !seen.has(record.sourcePlaceId)) {
          records.push(record);
          seen.add(record.sourcePlaceId);
        }
      } catch (error) {
        if (error instanceof ApiError && [429, 503].includes(error.status)) throw error;
        if (parent.aborted) throw error;
      } finally {
        timeout.dispose();
      }
    }
    if (!records.length)
      throw new ApiError(404, '本次未获取到带门牌的地图地址，请更换地区或稍后重试。', 'NO_RESULTS');
    return { records, retrievedAt: new Date(now()).toISOString(), strategy: 'reverse' };
  } finally {
    deadline.dispose();
  }
}
export async function fetchInternationalPool(
  scope: Scope,
  parent: AbortSignal,
  fetcher: typeof fetch,
  now: () => number,
  count = 1,
  random: () => number = Math.random,
  schedule?: (signal: AbortSignal) => Promise<void>,
): Promise<OsmAddressPool> {
  try {
    return await fetchMappedPool(scope, parent, fetcher, now);
  } catch (error) {
    if (
      parent.aborted ||
      !(error instanceof ApiError) ||
      ![
        'UPSTREAM_NETWORK',
        'UPSTREAM_ERROR',
        'UPSTREAM_BUSY',
        'UPSTREAM_INVALID',
        'UPSTREAM_TIMEOUT',
      ].includes(error.code)
    )
      throw error;
    try {
      return await fetchInternationalReverse(scope, parent, fetcher, now, count, random, schedule);
    } catch {
      throw error;
    }
  }
}
