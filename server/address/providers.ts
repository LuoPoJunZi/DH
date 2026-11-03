/**
 * Real, already-mapped addresses only. No invented street/house-number/postcode.
 * One small bounded Overpass lookup per cache miss, shared across site visitors.
 * OpenStreetMap is community-maintained; a mapped address is not a delivery guarantee.
 */
import type { AddressRecord, GenerateOptions } from '../../src/tools/other/address-generator/types';
import { COUNTRY_SEEDS, type CitySeed } from './catalog';
import { ApiError, readJsonLimited, withTimeout } from './runtime';
import { addressSourceConfig } from './config';
import { isObject } from '../../src/tools/other/address-generator/utils';

export interface Scope {
  countryCode: GenerateOptions['countryCode'];
  countryName: string;
  countryNameEn: string;
  regionCode: string;
  regionName: string;
  cityId: string;
  cityName: string;
  queryArea: string;
  seed: CitySeed;
}

export function resolveScope(options: GenerateOptions, random: () => number = Math.random): Scope {
  const country = COUNTRY_SEEDS.find((item) => item.code === options.countryCode);
  if (!country || !country.cities.length) {
    throw new ApiError(400, '该国家暂时没有可用的查询城市。', 'UNSUPPORTED_COUNTRY');
  }
  const filtered = country.cities.filter(
    (c) =>
      (!options.regionCode || c.regionCode === options.regionCode) &&
      (!options.cityId || c.id === options.cityId),
  );
  if (!filtered.length) throw new ApiError(400, '国家、地区或城市不匹配。', 'INVALID_LOCATION');
  const value = random();
  const index = Math.min(
    filtered.length - 1,
    Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * filtered.length)),
  );
  const seed = filtered[index]!;
  return {
    countryCode: country.code,
    countryName: country.name,
    countryNameEn: country.englishName,
    regionCode: seed.regionCode,
    regionName: seed.regionName,
    cityId: seed.id,
    cityName: seed.name.split(' / ')[0]!.trim(),
    seed,
    queryArea: [country.name, seed.regionName, seed.name].filter(Boolean).join(' / '),
  };
}

/** Latitude/longitude bounding box is purposely small: avoid costly city-wide scans. */
export function overpassQuery(scope: Scope): string {
  const { latitude, longitude } = scope.seed;
  const lat = 0.015,
    lon = 0.021;
  const box = [latitude - lat, longitude - lon, latitude + lat, longitude + lon]
    .map((n) => n.toFixed(5))
    .join(',');
  if (scope.countryCode === 'JP') {
    return `[out:json][timeout:16][maxsize:33554432];\n(\n  node["addr:housenumber"]["addr:neighbourhood"](${box});\n  way["addr:housenumber"]["addr:neighbourhood"](${box});\n  node["addr:housenumber"]["addr:quarter"](${box});\n  way["addr:housenumber"]["addr:quarter"](${box});\n);\nout center 180;`;
  }
  const match = `["addr:housenumber"]["addr:street"]`;
  return `[out:json][timeout:16][maxsize:33554432];\n(\n  node${match}(${box});\n  way${match}(${box});\n);\nout center 180;`;
}

function clean(value: unknown, max = 240): string {
  return typeof value === 'string'
    ? value
        .replace(/\p{Cc}/gu, ' ')
        .trim()
        .slice(0, max)
    : '';
}
function coord(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function formatLine(country: string, tags: Record<string, unknown>): string {
  const num = clean(tags['addr:housenumber'], 40);
  if (!num) return '';
  if (country === 'JP') {
    const neighbourhood = clean(tags['addr:neighbourhood'] ?? tags['addr:quarter']);
    const block = clean(tags['addr:block_number'], 40);
    if (!neighbourhood) return '';
    return [neighbourhood, block, num].filter(Boolean).join(' ').slice(0, 500);
  }
  const street = clean(tags['addr:street']);
  if (!street) return '';
  return (
    ['DE', 'FR', 'NL', 'TR', 'ES', 'IT'].includes(country) ? `${street} ${num}` : `${num} ${street}`
  ).slice(0, 500);
}
function formatFull(
  scope: Scope,
  line: string,
  city: string,
  region: string,
  postcode: string,
): string {
  if (scope.countryCode === 'JP') {
    return [postcode ? `〒${postcode}` : '', region, city, line, scope.countryNameEn]
      .filter(Boolean)
      .join(' ')
      .slice(0, 2000);
  }
  if (['TW', 'CN', 'KR'].includes(scope.countryCode)) {
    return [scope.countryNameEn, region, city, line, postcode]
      .filter(Boolean)
      .join(' ')
      .slice(0, 2000);
  }
  if (scope.countryCode === 'SG') {
    return [line, `Singapore${postcode ? ` ${postcode}` : ''}`].join(', ');
  }
  if (scope.countryCode === 'HK') {
    return [line, city, 'Hong Kong'].filter(Boolean).join(', ');
  }
  return [line, city, region, postcode, scope.countryNameEn]
    .filter(Boolean)
    .join(', ')
    .slice(0, 2000);
}

export interface OsmAddressPool {
  records: AddressRecord[];
  retrievedAt: string;
}
export function normalizeOverpass(value: unknown, scope: Scope, now: () => number): OsmAddressPool {
  if (!isObject(value) || !Array.isArray(value.elements) || value.elements.length > 200) {
    throw new ApiError(502, '地图服务返回了不合法的地址数据。', 'UPSTREAM_INVALID');
  }
  const records: AddressRecord[] = [];
  const seen = new Set<string>();
  const retrievedAt = new Date(now()).toISOString();
  for (const element of value.elements) {
    if (
      !isObject(element) ||
      !['node', 'way'].includes(String(element.type)) ||
      typeof element.id !== 'number' ||
      !Number.isSafeInteger(element.id) ||
      element.id <= 0 ||
      !isObject(element.tags)
    )
      continue;
    const tags = element.tags;
    // If an explicit country tag disagrees, reject the record rather than relabel it.
    const actualCountry = clean(tags['addr:country']).toUpperCase();
    if (actualCountry && actualCountry !== scope.countryCode) continue;
    const houseNumber = clean(tags['addr:housenumber'], 40);
    const street = clean(tags['addr:street']);
    const line = formatLine(scope.countryCode, tags);
    if (!houseNumber || !line) continue;
    const postcode = clean(tags['addr:postcode'], 40);
    const taggedCity = clean(tags['addr:city']);
    const taggedRegion = clean(tags['addr:state'] ?? tags['addr:province']);
    const city = taggedCity;
    const region = taggedRegion;
    const lat = coord(element.lat) ?? (isObject(element.center) ? coord(element.center.lat) : null);
    const lon = coord(element.lon) ?? (isObject(element.center) ? coord(element.center.lon) : null);
    if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    // Guard odd upstream results not within our selected query box.
    if (Math.abs(lat - scope.seed.latitude) > 0.017 || Math.abs(lon - scope.seed.longitude) > 0.023)
      continue;
    const sourcePlaceId = String(element.type) + '/' + String(element.id);
    const key = [scope.countryCode, line, city, postcode].join('|').toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const warnings = [
      ...(taggedCity ? [] : ['地图没有单独标注城市，字段已留空。']),
      ...(taggedRegion ? [] : ['地图没有单独标注州省，字段已留空。']),
      ...(postcode || scope.countryCode === 'HK'
        ? []
        : ['OpenStreetMap 未提供该对象的邮政编码，未猜测或补全。']),
    ];
    records.push({
      schemaVersion: 6,
      id: 'candidate',
      countryCode: scope.countryCode,
      countryName: scope.countryName,
      countryNameEn: scope.countryNameEn,
      regionCode: scope.regionCode,
      region,
      cityId: scope.cityId,
      city,
      district: clean(tags['addr:suburb'] ?? tags['addr:district']),
      addressLine1: line,
      addressLine2: '',
      street,
      houseNumber,
      postalCode: postcode,
      postalCodeStatus: postcode ? 'source' : scope.countryCode === 'HK' ? 'not-used' : 'missing',
      recipient: '',
      gender: '',
      email: '',
      phone: '',
      contactKind: 'none',
      latitude: lat,
      longitude: lon,
      fullAddress: formatFull(scope, line, city, region, postcode),
      queryArea: scope.queryArea,
      source: 'OpenStreetMap',
      sourcePlaceId,
      dataKind: 'mapped',
      verified: false,
      createdAt: retrievedAt,
      retrievedAt,
      warnings,
    });
  }
  return { records, retrievedAt };
}

export async function fetchMappedPool(
  scope: Scope,
  signal: AbortSignal,
  fetcher: typeof fetch,
  now: () => number,
): Promise<OsmAddressPool> {
  const timeout = withTimeout(signal, 19000);
  try {
    const body = new URLSearchParams({ data: overpassQuery(scope) });
    const response = await fetcher(addressSourceConfig.overpassEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': addressSourceConfig.userAgent,
      },
      body: body.toString(),
      redirect: 'error',
      signal: timeout.signal,
    });
    if (response.status === 429)
      throw new ApiError(429, '公开地图查询服务正限流，请稍后再试。', 'UPSTREAM_LIMIT');
    if (response.status === 503 || response.status === 504)
      throw new ApiError(503, '公开地图服务当前繁忙，请稍后再试。', 'UPSTREAM_BUSY');
    if (!response.ok)
      throw new ApiError(502, '公开地图服务暂不可用，请稍后再试。', 'UPSTREAM_ERROR');
    let value: unknown;
    try {
      value = await readJsonLimited(response, 700_000);
    } catch {
      throw new ApiError(502, '地图查询服务返回了异常数据。', 'UPSTREAM_INVALID');
    }
    const pool = normalizeOverpass(value, scope, now);
    if (!pool.records.length)
      throw new ApiError(
        404,
        '该城市附近尚未查询到带真实门牌的地图地址，请更换城市。',
        'NO_RESULTS',
      );
    return pool;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timeout.signal.aborted)
      throw new ApiError(504, '地图查询超时或已取消。', 'UPSTREAM_TIMEOUT');
    throw new ApiError(502, '无法连接公开地图服务。', 'UPSTREAM_NETWORK');
  } finally {
    timeout.dispose();
  }
}
