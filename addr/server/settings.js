// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
const USER_AGENT = 'AddressGenerator reference module';
const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const MAX_ROUNDS = 6;

const TIME_BUDGET_MS = 25000;

const ADDRESS_TYPES = ['residential', 'commercial', 'any'];

const RESIDENTIAL_BUILDINGS = [
  'house',
  'residential',
  'apartments',
  'detached',
  'semidetached_house',
  'terrace',
  'dormitory',
  'bungalow',
];

const COMMERCIAL_BUILDINGS = ['commercial', 'retail', 'office'];

const COMMERCIAL_AMENITIES = [
  'restaurant',
  'cafe',
  'fast_food',
  'bar',
  'pub',
  'biergarten',
  'food_court',
  'ice_cream',
  'nightclub',
  'bank',
  'bureau_de_change',
  'pharmacy',
  'clinic',
  'dentist',
  'doctors',
  'veterinary',
  'car_rental',
  'car_wash',
  'fuel',
  'cinema',
  'marketplace',
  'driving_school',
  'language_school',
  'coworking_space',
];

const COMMERCIAL_TOURISM = ['hotel', 'hostel', 'guest_house', 'motel', 'apartment'];

const IGNORED_AMENITIES = [
  'vending_machine',
  'parking',
  'parking_space',
  'parking_entrance',
  'bicycle_parking',
  'motorcycle_parking',
  'atm',
  'bench',
  'waste_basket',
  'recycling',
  'charging_station',
  'post_box',
  'telephone',
  'toilets',
  'ticket_validator',
  'drinking_water',
  'shelter',
  'bicycle_rental',
  'taxi',
];

const PHOTON_TAG_FILTERS = {
  residential: [...RESIDENTIAL_BUILDINGS.map((b) => `building:${b}`), 'place:house'],
  commercial: [
    'shop',
    'office',
    'craft',
    ...COMMERCIAL_AMENITIES.map((a) => `amenity:${a}`),
    ...COMMERCIAL_TOURISM.map((t) => `tourism:${t}`),
    ...COMMERCIAL_BUILDINGS.map((b) => `building:${b}`),
  ],
  any: [],
};

const ACCEPTED_COUNTRY_CODES = { UK: ['GB'], HK: ['HK', 'CN'] };

const NON_ADDRESS_KEYS = [
  'highway',
  'railway',
  'public_transport',
  'landuse',
  'leisure',
  'natural',
  'man_made',
  'power',
  'barrier',
  'waterway',
  'boundary',
  'historic',
];

const COUNTRY_NAMES = {
  US: 'United States',
  UK: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  CN: 'China',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  JP: 'Japan',
  IN: 'India',
  AU: 'Australia',
  BR: 'Brazil',
  CA: 'Canada',
  RU: 'Russia',
  ZA: 'South Africa',
  MX: 'Mexico',
  KR: 'South Korea',
  IT: 'Italy',
  ES: 'Spain',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  AR: 'Argentina',
  EG: 'Egypt',
  NG: 'Nigeria',
  ID: 'Indonesia',
};

const ADDRESS_STYLES = {
  CN: 'cn',
  TW: 'tw',
  JP: 'jp',
  KR: 'kr',
  US: 'numberFirst',
  CA: 'numberFirst',
  AU: 'numberFirst',
  IN: 'numberFirst',
  ZA: 'numberFirst',
  NG: 'numberFirst',
  EG: 'numberFirst',
  SA: 'numberFirst',
  HK: 'hk',
  UK: 'uk',
  FR: 'fr',
  DE: 'streetFirst',
  RU: 'streetFirst',
  TR: 'streetFirst',
  ID: 'streetFirst',
  IT: 'latin',
  ES: 'latin',
  BR: 'latin',
  MX: 'latin',
  AR: 'latin',
};

const ADMIN_ENRICH_COUNTRIES = ['CN', 'KR'];

const CN_DISTRICT_PATTERN = /[区县旗]$/;

const JP_BARE_CHOME = /^[0-9０-９一二三四五六七八九十]+丁目$/;

const HK_REGIONS = {
  HKI: { en: 'Hong Kong Island', zh: '香港島' },
  KLN: { en: 'Kowloon', zh: '九龍' },
  NT: { en: 'New Territories', zh: '新界' },
};

const HK_DISTRICTS = [
  { en: 'Central and Western', zh: '中西區', region: 'HKI' },
  { en: 'Wan Chai', zh: '灣仔區', region: 'HKI' },
  { en: 'Eastern', zh: '東區', region: 'HKI' },
  { en: 'Southern', zh: '南區', region: 'HKI' },
  { en: 'Yau Tsim Mong', zh: '油尖旺區', region: 'KLN' },
  { en: 'Sham Shui Po', zh: '深水埗區', region: 'KLN' },
  { en: 'Kowloon City', zh: '九龍城區', region: 'KLN' },
  { en: 'Wong Tai Sin', zh: '黃大仙區', region: 'KLN' },
  { en: 'Kwun Tong', zh: '觀塘區', region: 'KLN' },
  { en: 'Tsuen Wan', zh: '荃灣區', region: 'NT' },
  { en: 'Tuen Mun', zh: '屯門區', region: 'NT' },
  { en: 'Yuen Long', zh: '元朗區', region: 'NT' },
  { en: 'North', zh: '北區', region: 'NT' },
  { en: 'Tai Po', zh: '大埔區', region: 'NT' },
  { en: 'Sha Tin', zh: '沙田區', region: 'NT' },
  { en: 'Sai Kung', zh: '西貢區', region: 'NT' },
  { en: 'Kwai Tsing', zh: '葵青區', region: 'NT' },
  { en: 'Islands', zh: '離島區', region: 'NT' },
];
export {
  USER_AGENT,
  PHOTON_REVERSE_URL,
  OVERPASS_ENDPOINTS,
  NOMINATIM_REVERSE_URL,
  MAX_ROUNDS,
  TIME_BUDGET_MS,
  ADDRESS_TYPES,
  RESIDENTIAL_BUILDINGS,
  COMMERCIAL_BUILDINGS,
  COMMERCIAL_AMENITIES,
  COMMERCIAL_TOURISM,
  IGNORED_AMENITIES,
  PHOTON_TAG_FILTERS,
  ACCEPTED_COUNTRY_CODES,
  NON_ADDRESS_KEYS,
  COUNTRY_NAMES,
  ADDRESS_STYLES,
  ADMIN_ENRICH_COUNTRIES,
  CN_DISTRICT_PATTERN,
  JP_BARE_CHOME,
  HK_REGIONS,
  HK_DISTRICTS,
};

Object.assign(COUNTRY_NAMES, {
  SG: 'Singapore',
  NL: 'Netherlands',
  TH: 'Thailand',
  PH: 'Philippines',
  MY: 'Malaysia',
  VN: 'Vietnam',
});
