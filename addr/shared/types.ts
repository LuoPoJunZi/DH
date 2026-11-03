export const COUNTRY_CODES = [
  'US',
  'GB',
  'JP',
  'HK',
  'CA',
  'SG',
  'KR',
  'TW',
  'DE',
  'FR',
  'AU',
  'IN',
  'TR',
  'NG',
  'ES',
  'IT',
  'NL',
  'CN',
  'TH',
  'PH',
  'MY',
  'VN',
  'BR',
  'RU',
  'ZA',
  'MX',
  'SA',
  'AR',
  'EG',
  'ID',
] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];
export type PlaceKind = 'residential' | 'commercial' | 'any';
export interface CityOption {
  id: string;
  name: string;
}
export interface RegionOption {
  code: string;
  name: string;
  cities: CityOption[];
}
export interface CountryOption {
  code: CountryCode;
  name: string;
  englishName: string;
  regions: RegionOption[];
}
export interface AddressCatalog {
  countries: CountryOption[];
  ready: boolean;
  configurationMessage: string;
  turnstileSiteKey: string;
  maxCount: number;
  source: string;
}
export interface GenerateOptions {
  countryCode: CountryCode;
  regionCode: string;
  cityId: string;
  kind: PlaceKind;
  count: number;
  includeContact: boolean;
  taxFree?: boolean;
  previousSourceId?: string;
}
export interface AddressRecord {
  provider?: 'photon' | 'overpass';
  addressType?: 'residential' | 'commercial' | 'public' | 'unspecified';
  category?: string;
  placeName?: string;
  taxFree?: { code: string; name: string; note: string };
  localized?: { en?: string; zh?: string };
  schemaVersion: 6;
  id: string;
  countryCode: CountryCode;
  countryName: string;
  countryNameEn: string;
  regionCode: string;
  region: string;
  cityId: string;
  city: string;
  district: string;
  addressLine1: string;
  addressLine2: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  postalCodeStatus: 'source' | 'missing' | 'not-used';
  recipient: string;
  email: string;
  phone: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  gender: string;
  contactKind: 'none' | 'test';
  queryArea: string;
  source: 'OpenStreetMap';
  sourcePlaceId: string;
  dataKind: 'mapped';
  verified: false;
  createdAt: string;
  retrievedAt: string;
  warnings: string[];
}
export interface GenerateResult {
  records: AddressRecord[];
  warnings: string[];
  cache: 'hit' | 'miss';
  queryArea: string;
}
export interface SavedAddress {
  record: AddressRecord;
  note: string;
  savedAt: string;
}
export type ExportFormat = 'json' | 'csv' | 'txt';
export interface ExportEntry {
  record: AddressRecord;
  note?: string;
}
