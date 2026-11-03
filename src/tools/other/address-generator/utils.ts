import { addressLinks } from '../../../config/address-generator';
import { COUNTRY_CODES, type AddressRecord, type CountryCode } from './types';
export const MAX_BATCH_SIZE = 5;
export const DATA_NOTICE =
  '地址来自开放地图已有门牌记录，不模拟街道、门牌或邮编；缺失字段留空。勾选附加资料时，姓名和电话是独立测试信息，与地址住户无关。';
export const ATTRIBUTION =
  '© OpenStreetMap contributors (ODbL) https://www.openstreetmap.org/copyright';
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && (COUNTRY_CODES as readonly string[]).includes(value);
}
export function addressKey(record: AddressRecord): string {
  return `${record.countryCode}|${record.fullAddress.trim().toLocaleLowerCase()}`;
}
const textFields = [
  'id',
  'countryName',
  'countryNameEn',
  'regionCode',
  'region',
  'cityId',
  'city',
  'district',
  'addressLine1',
  'addressLine2',
  'street',
  'houseNumber',
  'postalCode',
  'recipient',
  'email',
  'phone',
  'gender',
  'fullAddress',
  'queryArea',
  'sourcePlaceId',
  'createdAt',
  'retrievedAt',
] as const;
export function isAddressRecord(value: unknown): value is AddressRecord {
  if (
    !isObject(value) ||
    value.schemaVersion !== 6 ||
    value.dataKind !== 'mapped' ||
    value.verified !== false ||
    value.source !== 'OpenStreetMap' ||
    !isCountryCode(value.countryCode)
  )
    return false;
  if (
    !textFields.every(
      (field) =>
        typeof value[field] === 'string' &&
        value[field].length <= (field === 'fullAddress' ? 2000 : 500),
    )
  )
    return false;
  const record = value as unknown as AddressRecord;
  return (
    /^[a-zA-Z0-9_-]{1,80}$/.test(record.id) &&
    /^(node|way|relation)\/[1-9]\d{0,17}$/.test(record.sourcePlaceId) &&
    Boolean(record.addressLine1 && record.houseNumber && record.fullAddress) &&
    Number.isFinite(record.latitude) &&
    Math.abs(record.latitude) <= 90 &&
    Number.isFinite(record.longitude) &&
    Math.abs(record.longitude) <= 180 &&
    ['none', 'test'].includes(record.contactKind) &&
    Number.isFinite(Date.parse(record.createdAt)) &&
    Number.isFinite(Date.parse(record.retrievedAt)) &&
    ['source', 'missing', 'not-used'].includes(record.postalCodeStatus) &&
    Array.isArray(record.warnings) &&
    record.warnings.length <= 10 &&
    record.warnings.every((item) => typeof item === 'string' && item.length <= 240) &&
    (!record.email || /^[a-zA-Z0-9._-]+@example\.com$/.test(record.email))
  );
}

export function googleMapsUrl(record: AddressRecord): string {
  const url = new URL(addressLinks.googleSearch);
  url.search = new URLSearchParams({ api: '1', query: record.fullAddress }).toString();
  return url.href;
}
export function googleMapPreviewUrl(record: AddressRecord): string {
  const url = new URL(addressLinks.googlePreview);
  url.search = new URLSearchParams({ q: record.fullAddress, output: 'embed' }).toString();
  return url.href;
}
export function sourceMapUrl(record: AddressRecord): string {
  return new URL(record.sourcePlaceId, addressLinks.openStreetMap).href;
}
