export interface AddressParts {
  houseNumber?: string;
  street?: string;
  locality?: string;
  district?: string;
  cityDistrict?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
  postcode?: string;
  country?: string;
  hkHints?: string[];
}
export interface Candidate {
  parts: AddressParts;
  countryCode?: string;
  kind: 'residential' | 'commercial' | 'public' | 'unspecified' | 'other';
  category: string;
  placeName: string;
  lat: number;
  lng: number;
  osmUrl: string;
}
export interface FoundAddress extends Candidate {
  source: 'photon' | 'overpass';
  rounds: number;
  seed?: { state?: string; areaCodes?: number[] };
  candidates: Candidate[];
}
export interface GeneratorOptions {
  userAgent?: string;
  taxFree?: boolean;
  stateCode?: string;
  seed?: { lat: number; lng: number; state?: string; areaCodes?: number[] };
  signal?: AbortSignal;
  fetcher?: typeof fetch;
  random?: () => number;
}
export function findRealAddress(
  country: string,
  type: 'residential' | 'commercial' | 'any',
  options?: GeneratorOptions,
): Promise<FoundAddress>;
export function normalizeParts(country: string, parts: AddressParts): AddressParts | null;
export function formatAddress(country: string, parts: AddressParts): string;
export function getTaxFreeState(
  state?: string,
): { code: string; name: string; note: string } | null;
export function getRandomName(country: string): string | null;
export function getRandomPhoneNumber(country: string, areaCodes?: number[] | null): string;
export function pickUsAreaCodes(seed: FoundAddress['seed'], state?: string): number[] | null;
export function buildHongKongVersions(found: Candidate): {
  en: { address: string; addressParts: AddressParts; placeName: string } | null;
  zh: { address: string; addressParts: AddressParts; placeName: string } | null;
};
