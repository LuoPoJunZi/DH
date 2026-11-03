// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
const countryCoordinates = {
  US: [
    { lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA', areaCodes: [415, 628] },
    { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA', areaCodes: [213, 323] },
  ],
  UK: [
    { lat: 51.5074, lng: -0.1278 },
    { lat: 53.4808, lng: -2.2426 },
  ],
  FR: [
    { lat: 48.8566, lng: 2.3522 },
    { lat: 45.764, lng: 4.8357 },
  ],
  DE: [
    { lat: 52.52, lng: 13.405 },
    { lat: 48.1351, lng: 11.582 },
  ],
  CN: [
    { lat: 39.9042, lng: 116.4074 },
    { lat: 31.2304, lng: 121.4737 },
    { lat: 23.1291, lng: 113.2644 },
    { lat: 30.6799, lng: 104.0679 },
    { lat: 30.2582, lng: 120.1646 },
  ],
  TW: [
    { lat: 25.033, lng: 121.5654 },
    { lat: 22.6273, lng: 120.3014 },
  ],
  HK: [
    { lat: 22.3193, lng: 114.1694 },
    { lat: 22.3964, lng: 114.1095 },
  ],
  JP: [
    { lat: 35.6895, lng: 139.6917 },
    { lat: 34.6937, lng: 135.5023 },
  ],
  IN: [
    { lat: 28.6139, lng: 77.209 },
    { lat: 19.076, lng: 72.8777 },
  ],
  AU: [
    { lat: -33.8688, lng: 151.2093 },
    { lat: -37.8136, lng: 144.9631 },
  ],
  BR: [
    { lat: -23.5505, lng: -46.6333, city: 'São Paulo', areaCodes: ['11'] },
    { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro', areaCodes: ['21'] },
  ],
  CA: [
    { lat: 43.65107, lng: -79.347015 },
    { lat: 45.50169, lng: -73.567253 },
  ],
  RU: [
    { lat: 55.7558, lng: 37.6173 },
    { lat: 59.9343, lng: 30.3351 },
  ],
  ZA: [
    { lat: -33.9249, lng: 18.4241 },
    { lat: -26.2041, lng: 28.0473 },
  ],
  MX: [
    { lat: 19.4326, lng: -99.1332 },
    { lat: 20.6597, lng: -103.3496 },
  ],
  KR: [
    { lat: 37.5665, lng: 126.978 },
    { lat: 35.1796, lng: 129.0756 },
  ],
  IT: [
    { lat: 41.9028, lng: 12.4964 },
    { lat: 45.4642, lng: 9.19 },
  ],
  ES: [
    { lat: 40.4168, lng: -3.7038 },
    { lat: 41.3851, lng: 2.1734 },
  ],
  TR: [
    { lat: 41.0082, lng: 28.9784 },
    { lat: 39.9334, lng: 32.8597 },
  ],
  SA: [
    { lat: 24.7136, lng: 46.6753 },
    { lat: 21.3891, lng: 39.8579 },
  ],
  AR: [
    { lat: -34.6037, lng: -58.3816 },
    { lat: -31.4201, lng: -64.1888 },
  ],
  EG: [
    { lat: 30.0444, lng: 31.2357 },
    { lat: 31.2156, lng: 29.9553 },
  ],
  NG: [
    { lat: 6.5244, lng: 3.3792 },
    { lat: 9.0579, lng: 7.4951 },
  ],
  ID: [
    { lat: -6.2088, lng: 106.8456 },
    { lat: -7.7956, lng: 110.3695 },
  ],
};

const US_STATES = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const US_TAX_FREE_STATES = {
  OR: { name: 'Oregon', note: '不征收州和地方销售税' },
  DE: { name: 'Delaware', note: '不征收州和地方销售税' },
  NH: { name: 'New Hampshire', note: '不征收州和地方销售税' },
  MT: { name: 'Montana', note: '不征收州销售税，少数度假地另收地方度假税' },
  AK: { name: 'Alaska', note: '不征收州销售税，部分城市另收地方销售税' },
};

const US_AREA_CODES = {
  CA: [
    209, 213, 279, 310, 323, 408, 415, 424, 442, 510, 530, 559, 562, 619, 626, 628, 650, 657, 661,
    669, 707, 714, 747, 760, 805, 818, 820, 831, 840, 858, 909, 916, 925, 949, 951,
  ],
  OR: [458, 503, 541, 971],
  DE: [302],
  NH: [603],
  MT: [406],
  AK: [907],
};

const US_TAX_FREE_CITIES = [
  { state: 'OR', city: 'Portland', lat: 45.5152, lng: -122.6784, areaCodes: [503, 971] },
  { state: 'OR', city: 'Salem', lat: 44.9429, lng: -123.0351, areaCodes: [503, 971] },
  { state: 'OR', city: 'Eugene', lat: 44.0521, lng: -123.0868, areaCodes: [541, 458] },
  { state: 'DE', city: 'Wilmington', lat: 39.7391, lng: -75.5398, areaCodes: [302] },
  { state: 'DE', city: 'Dover', lat: 39.1582, lng: -75.5244, areaCodes: [302] },
  { state: 'NH', city: 'Manchester', lat: 42.9956, lng: -71.4548, areaCodes: [603] },
  { state: 'NH', city: 'Nashua', lat: 42.7654, lng: -71.4676, areaCodes: [603] },
  { state: 'NH', city: 'Concord', lat: 43.2081, lng: -71.5376, areaCodes: [603] },
  { state: 'MT', city: 'Billings', lat: 45.7833, lng: -108.5007, areaCodes: [406] },
  { state: 'MT', city: 'Missoula', lat: 46.8721, lng: -113.994, areaCodes: [406] },
  { state: 'MT', city: 'Bozeman', lat: 45.677, lng: -111.0429, areaCodes: [406] },
  { state: 'AK', city: 'Anchorage', lat: 61.2181, lng: -149.9003, areaCodes: [907] },
];

function getRandomLocation(country, options = {}) {
  const coordsArray = options.seed
    ? [options.seed]
    : country === 'US' && options.taxFree
      ? US_TAX_FREE_CITIES
      : countryCoordinates[country];
  const randomCity =
    coordsArray[Math.floor((options.random || Math.random)() * coordsArray.length)];
  const lat = randomCity.lat + ((options.random || Math.random)() - 0.5) * 0.02;
  const lng = randomCity.lng + ((options.random || Math.random)() - 0.5) * 0.02;
  // seed：随机点所围绕的城市，用于匹配本地电话区号
  return { lat, lng, seed: randomCity };
}
export {
  countryCoordinates,
  US_STATES,
  US_TAX_FREE_STATES,
  US_AREA_CODES,
  US_TAX_FREE_CITIES,
  getRandomLocation,
};
