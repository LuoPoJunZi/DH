import {
  buildHongKongVersions,
  formatAddress,
  getTaxFreeState,
  normalizeParts,
  type Candidate,
  type FoundAddress,
} from '../worker.js';
import { COUNTRY_SEEDS, type CitySeed } from '../data/catalog';
import type { AddressRecord, GenerateOptions, CountryCode } from '../shared/types';
import { ApiError } from './runtime';
export interface Scope {
  countryCode: CountryCode;
  countryName: string;
  countryNameEn: string;
  seed: CitySeed;
  queryArea: string;
}
export const upstreamCountry = (code: CountryCode): string => (code === 'GB' ? 'UK' : code);
const TAX_STATES = ['OR', 'DE', 'NH', 'MT', 'AK'];
export function resolveScope(options: GenerateOptions, random: () => number = Math.random): Scope {
  const country = COUNTRY_SEEDS.find((c) => c.code === options.countryCode);
  const cities = country?.cities.filter(
    (c) =>
      (!options.regionCode || c.regionCode === options.regionCode) &&
      (!options.cityId || c.id === options.cityId) &&
      (!options.taxFree || TAX_STATES.includes(c.regionCode)),
  );
  if (!country || !cities?.length)
    throw new ApiError(400, '国家、地区、城市或免税州选项不匹配。', 'INVALID_LOCATION');
  const seed =
    cities[Math.min(cities.length - 1, Math.max(0, Math.floor(random() * cities.length)))]!;
  return {
    countryCode: country.code,
    countryName: country.name,
    countryNameEn: country.englishName,
    seed,
    queryArea: [country.name, seed.regionName, seed.name].join(' / '),
  };
}
function clean(value: unknown, max = 240): string {
  return typeof value === 'string'
    ? value
        .replace(/\p{Cc}/gu, ' ')
        .trim()
        .slice(0, max)
    : '';
}
export function toAddressRecord(
  candidate: Candidate,
  scope: Scope,
  provider: FoundAddress['source'],
  now: () => number = Date.now,
): AddressRecord | null {
  const id = new RegExp(
    '^https://www[.]openstreetmap[.]org/(node|way|relation)/([1-9][0-9]{0,17})$',
  ).exec(candidate.osmUrl ?? '');
  if (
    !id ||
    !Number.isFinite(candidate.lat) ||
    !Number.isFinite(candidate.lng) ||
    Math.abs(candidate.lat) > 90 ||
    Math.abs(candidate.lng) > 180 ||
    Math.abs(candidate.lat - scope.seed.latitude) > 0.1 ||
    Math.abs(candidate.lng - scope.seed.longitude) > 0.15 ||
    candidate.kind === 'other'
  )
    return null;
  const rawCountry = clean(candidate.countryCode).toUpperCase();
  const hk =
    scope.countryCode === 'HK' &&
    rawCountry === 'CN' &&
    /香港|hong kong/i.test(
      [candidate.parts.state, candidate.parts.city, candidate.parts.county].join(' '),
    );
  if (
    rawCountry !== scope.countryCode &&
    !(scope.countryCode === 'GB' && rawCountry === 'UK') &&
    !hk
  )
    return null;
  // Missing country/street/house fields are never filled from the selected city.
  const parts = normalizeParts(upstreamCountry(scope.countryCode), candidate.parts);
  if (!parts) return null;
  const houseNumber = clean(parts.houseNumber, 40),
    street = clean(parts.street);
  if (!houseNumber || !street) return null;
  const city = clean(parts.city),
    region = clean(parts.state),
    postalCode = clean(parts.postcode, 40);
  const fullAddress = clean(formatAddress(upstreamCountry(scope.countryCode), parts), 2000);
  if (!fullAddress || /undefined|null/.test(fullAddress)) return null;
  const date = new Date(now()).toISOString();
  const taxFree = scope.countryCode === 'US' ? getTaxFreeState(region) : null;
  const localized = scope.countryCode === 'HK' ? buildHongKongVersions(candidate) : null;
  return {
    schemaVersion: 6,
    id: 'candidate',
    countryCode: scope.countryCode,
    countryName: scope.countryName,
    countryNameEn: scope.countryNameEn,
    regionCode: clean(parts.stateCode) || scope.seed.regionCode,
    region,
    cityId: scope.seed.id,
    city,
    district: clean(parts.cityDistrict || parts.district || parts.county),
    addressLine1:
      scope.countryCode === 'JP' ? [street, houseNumber].join('') : [houseNumber, street].join(' '),
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
    fullAddress,
    latitude: candidate.lat,
    longitude: candidate.lng,
    queryArea: scope.queryArea,
    source: 'OpenStreetMap',
    sourcePlaceId: id[1] + '/' + id[2],
    dataKind: 'mapped',
    verified: false,
    createdAt: date,
    retrievedAt: date,
    provider,
    addressType: candidate.kind,
    category: clean(candidate.category),
    placeName: ['commercial', 'public'].includes(candidate.kind) ? clean(candidate.placeName) : '',
    ...(taxFree ? { taxFree } : {}),
    ...(localized
      ? {
          localized: {
            ...(localized.en ? { en: localized.en.address } : {}),
            ...(localized.zh ? { zh: localized.zh.address } : {}),
          },
        }
      : {}),
    warnings: [
      ...(city ? [] : ['地图未提供城市，字段已留空。']),
      ...(region ? [] : ['地图未提供州省，字段已留空。']),
      ...(postalCode || scope.countryCode === 'HK' ? [] : ['地图未提供邮编，未猜测或补造。']),
    ],
  };
}
