import site from '../../src/config/site.data.json';

export const addressSourceConfig = {
  reverseEndpoint: 'https://nominatim.openstreetmap.org/reverse',
  overpassEndpoint: 'https://overpass-api.de/api/interpreter',
  profileEndpoint: 'https://randomuser.me/api/',
  userAgent: site.shortName + '/1.0 (' + site.url + '/)',
} as const;
