export const addressLinks = {
  googleSearch: 'https://www.google.com/maps/search/',
  googlePreview: 'https://www.google.com/maps',
  openStreetMap: 'https://www.openstreetmap.org/',
  copyright: 'https://www.openstreetmap.org/copyright',
} as const;

export const ADDRESS_DATA_SOURCES = [
  { name: 'OpenStreetMap', url: addressLinks.openStreetMap },
  { name: 'Photon', url: 'https://photon.komoot.io/' },
  { name: 'Overpass', url: 'https://overpass-api.de/' },
  { name: 'Nominatim', url: 'https://nominatim.org/' },
] as const;
