import type { CountryCode, CountryOption } from '../../src/tools/other/address-generator/types';
export interface CitySeed {
  id: string;
  name: string;
  regionCode: string;
  regionName: string;
  countryCode: CountryCode;
  latitude: number;
  longitude: number;
}
interface CountrySeed {
  code: CountryCode;
  name: string;
  englishName: string;
  cities: CitySeed[];
}
type CityRow = readonly [string, string, string, string, number, number];
function country(
  code: CountryCode,
  name: string,
  englishName: string,
  rows: readonly CityRow[],
): CountrySeed {
  return {
    code,
    name,
    englishName,
    cities: rows.map(([regionCode, regionName, id, cityName, latitude, longitude]) => ({
      id,
      name: cityName,
      regionCode,
      regionName,
      countryCode: code,
      latitude,
      longitude,
    })),
  };
}
// Tiny city-centre lookup table for bounded online OSM searches: no house numbers or streets bundled.
// "全国随机" selects one of the listed seed cities, not every city in the country.
export const COUNTRY_SEEDS: readonly CountrySeed[] = [
  country('US', '美国', 'United States', [
    ['AL', 'Alabama', 'us-birmingham', 'Birmingham', 33.5186, -86.8104],
    ['AK', 'Alaska', 'us-anchorage', 'Anchorage', 61.2181, -149.9003],
    ['AZ', 'Arizona', 'us-phoenix', 'Phoenix', 33.4484, -112.074],
    ['AR', 'Arkansas', 'us-little-rock', 'Little Rock', 34.7465, -92.2896],
    ['CA', 'California', 'us-san-francisco', 'San Francisco', 37.7749, -122.4194],
    ['CA', 'California', 'us-los-angeles', 'Los Angeles', 34.0522, -118.2437],
    ['CO', 'Colorado', 'us-denver', 'Denver', 39.7392, -104.9903],
    ['CT', 'Connecticut', 'us-hartford', 'Hartford', 41.7658, -72.6734],
    ['DE', 'Delaware', 'us-wilmington', 'Wilmington', 39.7391, -75.5398],
    ['FL', 'Florida', 'us-orlando', 'Orlando', 28.5383, -81.3792],
    ['GA', 'Georgia', 'us-atlanta', 'Atlanta', 33.749, -84.388],
    ['HI', 'Hawaii', 'us-honolulu', 'Honolulu', 21.3069, -157.8583],
    ['ID', 'Idaho', 'us-boise', 'Boise', 43.615, -116.2023],
    ['IL', 'Illinois', 'us-chicago', 'Chicago', 41.8781, -87.6298],
    ['IN', 'Indiana', 'us-indianapolis', 'Indianapolis', 39.7684, -86.1581],
    ['IA', 'Iowa', 'us-des-moines', 'Des Moines', 41.5868, -93.625],
    ['KS', 'Kansas', 'us-wichita', 'Wichita', 37.6872, -97.3301],
    ['KY', 'Kentucky', 'us-lexington', 'Lexington', 38.0406, -84.5037],
    ['LA', 'Louisiana', 'us-new-orleans', 'New Orleans', 29.9511, -90.0715],
    ['ME', 'Maine', 'us-portland-me', 'Portland', 43.6591, -70.2568],
    ['MD', 'Maryland', 'us-baltimore', 'Baltimore', 39.2904, -76.6122],
    ['MA', 'Massachusetts', 'us-boston', 'Boston', 42.3601, -71.0589],
    ['MI', 'Michigan', 'us-detroit', 'Detroit', 42.3314, -83.0458],
    ['MN', 'Minnesota', 'us-minneapolis', 'Minneapolis', 44.9778, -93.265],
    ['MS', 'Mississippi', 'us-jackson', 'Jackson', 32.2988, -90.1848],
    ['MO', 'Missouri', 'us-st-louis', 'St. Louis', 38.627, -90.1994],
    ['MT', 'Montana', 'us-billings', 'Billings', 45.7833, -108.5007],
    ['NE', 'Nebraska', 'us-omaha', 'Omaha', 41.2565, -95.9345],
    ['NV', 'Nevada', 'us-las-vegas', 'Las Vegas', 36.1699, -115.1398],
    ['NH', 'New Hampshire', 'us-manchester', 'Manchester', 42.9956, -71.4548],
    ['NJ', 'New Jersey', 'us-newark', 'Newark', 40.7357, -74.1724],
    ['NM', 'New Mexico', 'us-albuquerque', 'Albuquerque', 35.0844, -106.6504],
    ['NY', 'New York', 'us-new-york', 'New York', 40.7128, -74.006],
    ['NC', 'North Carolina', 'us-charlotte', 'Charlotte', 35.2271, -80.8431],
    ['ND', 'North Dakota', 'us-fargo', 'Fargo', 46.8772, -96.7898],
    ['OH', 'Ohio', 'us-columbus', 'Columbus', 39.9612, -82.9988],
    ['OK', 'Oklahoma', 'us-oklahoma-city', 'Oklahoma City', 35.4676, -97.5164],
    ['OR', 'Oregon', 'us-portland', 'Portland', 45.5152, -122.6784],
    ['PA', 'Pennsylvania', 'us-philadelphia', 'Philadelphia', 39.9526, -75.1652],
    ['RI', 'Rhode Island', 'us-providence', 'Providence', 41.824, -71.4128],
    ['SC', 'South Carolina', 'us-columbia', 'Columbia', 34.0007, -81.0348],
    ['SD', 'South Dakota', 'us-sioux-falls', 'Sioux Falls', 43.5446, -96.7311],
    ['TN', 'Tennessee', 'us-nashville', 'Nashville', 36.1627, -86.7816],
    ['TX', 'Texas', 'us-austin', 'Austin', 30.2672, -97.7431],
    ['UT', 'Utah', 'us-salt-lake', 'Salt Lake City', 40.7608, -111.891],
    ['VT', 'Vermont', 'us-burlington', 'Burlington', 44.4759, -73.2121],
    ['VA', 'Virginia', 'us-richmond', 'Richmond', 37.5407, -77.436],
    ['WA', 'Washington', 'us-seattle', 'Seattle', 47.6062, -122.3321],
    ['WV', 'West Virginia', 'us-charleston', 'Charleston', 38.3498, -81.6326],
    ['WI', 'Wisconsin', 'us-milwaukee', 'Milwaukee', 43.0389, -87.9065],
    ['WY', 'Wyoming', 'us-cheyenne', 'Cheyenne', 41.14, -104.8202],
    ['DC', 'District of Columbia', 'us-washington-dc', 'Washington, D.C.', 38.9072, -77.0369],
  ]),
  country('GB', '英国', 'United Kingdom', [
    ['ENG', 'England', 'gb-london', 'London', 51.5074, -0.1278],
    ['ENG', 'England', 'gb-manchester', 'Manchester', 53.4808, -2.2426],
    ['SCT', 'Scotland', 'gb-edinburgh', 'Edinburgh', 55.9533, -3.1883],
    ['WLS', 'Wales', 'gb-cardiff', 'Cardiff', 51.4816, -3.1791],
    ['NIR', 'Northern Ireland', 'gb-belfast', 'Belfast', 54.5973, -5.9301],
  ]),
  country('JP', '日本', 'Japan', [
    ['13', '东京都', 'jp-tokyo', 'Tokyo / 东京', 35.6938, 139.7034],
    ['27', '大阪府', 'jp-osaka', 'Osaka / 大阪', 34.6937, 135.5023],
    ['26', '京都府', 'jp-kyoto', 'Kyoto / 京都', 35.0116, 135.7681],
    ['01', '北海道', 'jp-sapporo', 'Sapporo / 札幌', 43.0618, 141.3545],
    ['40', '福冈县', 'jp-fukuoka', 'Fukuoka / 福冈', 33.5902, 130.4017],
  ]),
  country('HK', '中国香港', 'Hong Kong', [
    ['HKI', '香港岛', 'hk-central', '中环 / Central', 22.2819, 114.1589],
    ['KLN', '九龙', 'hk-mong-kok', '旺角 / Mong Kok', 22.3193, 114.1694],
    ['NT', '新界', 'hk-sha-tin', '沙田 / Sha Tin', 22.3833, 114.188],
  ]),
  country('CA', '加拿大', 'Canada', [
    ['ON', 'Ontario', 'ca-toronto', 'Toronto', 43.6532, -79.3832],
    ['BC', 'British Columbia', 'ca-vancouver', 'Vancouver', 49.2827, -123.1207],
    ['QC', 'Quebec', 'ca-montreal', 'Montreal', 45.5017, -73.5673],
    ['AB', 'Alberta', 'ca-calgary', 'Calgary', 51.0447, -114.0719],
  ]),
  country('SG', '新加坡', 'Singapore', [
    ['CENTRAL', 'Central', 'sg-orchard', 'Orchard', 1.3048, 103.8318],
    ['EAST', 'East', 'sg-tampines', 'Tampines', 1.354, 103.943],
    ['WEST', 'West', 'sg-jurong', 'Jurong East', 1.3329, 103.7436],
  ]),
  country('KR', '韩国', 'South Korea', [
    ['11', 'Seoul', 'kr-seoul', 'Seoul / 首尔', 37.5665, 126.978],
    ['26', 'Busan', 'kr-busan', 'Busan / 釜山', 35.1796, 129.0756],
    ['28', 'Incheon', 'kr-incheon', 'Incheon / 仁川', 37.4563, 126.7052],
  ]),
  country('TW', '中国台湾', 'Taiwan', [
    ['TPE', '台北', 'tw-taipei', 'Taipei / 台北', 25.033, 121.5654],
    ['TXG', '台中', 'tw-taichung', 'Taichung / 台中', 24.1477, 120.6736],
    ['KHH', '高雄', 'tw-kaohsiung', 'Kaohsiung / 高雄', 22.6273, 120.3014],
  ]),
  country('DE', '德国', 'Germany', [
    ['BE', 'Berlin', 'de-berlin', 'Berlin', 52.52, 13.405],
    ['BY', 'Bavaria', 'de-munich', 'Munich', 48.1351, 11.582],
    ['HH', 'Hamburg', 'de-hamburg', 'Hamburg', 53.5511, 9.9937],
  ]),
  country('FR', '法国', 'France', [
    ['IDF', 'Ile-de-France', 'fr-paris', 'Paris', 48.8566, 2.3522],
    ['ARA', 'Auvergne-Rhone-Alpes', 'fr-lyon', 'Lyon', 45.764, 4.8357],
    ['PAC', "Provence-Alpes-Cote d'Azur", 'fr-marseille', 'Marseille', 43.2965, 5.3698],
  ]),
  country('AU', '澳大利亚', 'Australia', [
    ['NSW', 'New South Wales', 'au-sydney', 'Sydney', -33.8688, 151.2093],
    ['VIC', 'Victoria', 'au-melbourne', 'Melbourne', -37.8136, 144.9631],
    ['QLD', 'Queensland', 'au-brisbane', 'Brisbane', -27.4698, 153.0251],
    ['WA', 'Western Australia', 'au-perth', 'Perth', -31.9505, 115.8605],
  ]),
  country('IN', '印度', 'India', [
    ['DL', 'Delhi', 'in-delhi', 'New Delhi', 28.6139, 77.209],
    ['MH', 'Maharashtra', 'in-mumbai', 'Mumbai', 19.076, 72.8777],
    ['KA', 'Karnataka', 'in-bengaluru', 'Bengaluru', 12.9716, 77.5946],
  ]),
  country('TR', '土耳其', 'Turkey', [
    ['34', 'Istanbul', 'tr-istanbul', 'Istanbul', 41.0082, 28.9784],
    ['06', 'Ankara', 'tr-ankara', 'Ankara', 39.9334, 32.8597],
    ['35', 'Izmir', 'tr-izmir', 'Izmir', 38.4237, 27.1428],
  ]),
  country('NG', '尼日利亚', 'Nigeria', [['LA', 'Lagos', 'ng-lagos', 'Lagos', 6.5244, 3.3792]]),
  country('ES', '西班牙', 'Spain', [
    ['MD', 'Comunidad de Madrid', 'es-madrid', 'Madrid', 40.4168, -3.7038],
    ['CT', 'Catalonia', 'es-barcelona', 'Barcelona', 41.3874, 2.1686],
  ]),
  country('IT', '意大利', 'Italy', [
    ['RM', 'Lazio', 'it-rome', 'Rome', 41.9028, 12.4964],
    ['MI', 'Lombardy', 'it-milan', 'Milan', 45.4642, 9.19],
  ]),
  country('NL', '荷兰', 'Netherlands', [
    ['NH', 'North Holland', 'nl-amsterdam', 'Amsterdam', 52.3676, 4.9041],
    ['ZH', 'South Holland', 'nl-rotterdam', 'Rotterdam', 51.9244, 4.4777],
  ]),
  country('CN', '中国大陆', 'China', [
    ['BJ', '北京', 'cn-beijing', 'Beijing / 北京', 39.9042, 116.4074],
    ['SH', '上海', 'cn-shanghai', 'Shanghai / 上海', 31.2304, 121.4737],
  ]),
  country('TH', '泰国', 'Thailand', [
    ['BKK', 'Bangkok', 'th-bangkok', 'Bangkok', 13.7563, 100.5018],
  ]),
  country('PH', '菲律宾', 'Philippines', [
    ['NCR', 'Metro Manila', 'ph-manila', 'Manila', 14.5995, 120.9842],
  ]),
  country('MY', '马来西亚', 'Malaysia', [
    ['KUL', 'Kuala Lumpur', 'my-kl', 'Kuala Lumpur', 3.139, 101.6869],
  ]),
  country('VN', '越南', 'Vietnam', [
    ['HCM', 'Ho Chi Minh City', 'vn-hcm', 'Ho Chi Minh City', 10.8231, 106.6297],
    ['HN', 'Hanoi', 'vn-hanoi', 'Hanoi', 21.0285, 105.8542],
  ]),
];
export function publicCatalog(): CountryOption[] {
  return COUNTRY_SEEDS.map(({ code, name, englishName, cities }) => {
    const regions: CountryOption['regions'] = [];
    for (const city of cities) {
      let region = regions.find((item) => item.code === city.regionCode);
      if (!region) {
        region = { code: city.regionCode, name: city.regionName, cities: [] };
        regions.push(region);
      }
      region.cities.push({ id: city.id, name: city.name });
    }
    return { code, name, englishName, regions };
  });
}
