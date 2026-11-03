// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
import {
  RESIDENTIAL_BUILDINGS,
  COMMERCIAL_BUILDINGS,
  COMMERCIAL_AMENITIES,
  COMMERCIAL_TOURISM,
  IGNORED_AMENITIES,
  NON_ADDRESS_KEYS,
  ACCEPTED_COUNTRY_CODES,
  ADMIN_ENRICH_COUNTRIES,
  JP_BARE_CHOME,
} from './settings.js';
function classifyTags(tags) {
  if (tags.amenity && IGNORED_AMENITIES.includes(tags.amenity)) return 'other';
  if (tags.shop || tags.office || tags.craft) return 'commercial';
  if (COMMERCIAL_AMENITIES.includes(tags.amenity) || COMMERCIAL_TOURISM.includes(tags.tourism))
    return 'commercial';
  if (tags.amenity || tags.tourism) return 'public';
  if (COMMERCIAL_BUILDINGS.includes(tags.building)) return 'commercial';
  if (RESIDENTIAL_BUILDINGS.includes(tags.building)) return 'residential';
  if (!tags.building && NON_ADDRESS_KEYS.some((key) => tags[key])) return 'other';
  if (!tags.building || tags.building === 'yes') return 'unspecified';
  return 'other';
}

function osmUrl(type, id) {
  return type && id ? `https://www.openstreetmap.org/${type}/${id}` : '';
}

function hasHouseAndStreet(candidate) {
  return Boolean(candidate.parts.houseNumber && candidate.parts.street);
}

function hasAdminInfo(parts) {
  return Boolean(parts.city || parts.cityDistrict || parts.district || parts.county || parts.state);
}

function needsNominatim(country, parts) {
  if (!hasAdminInfo(parts) || !parts.postcode || ADMIN_ENRICH_COUNTRIES.includes(country))
    return true;
  return country === 'JP' && (!parts.locality || JP_BARE_CHOME.test(parts.locality));
}

function matchesCountry(candidate, country) {
  if (!candidate.countryCode) return true;
  return (ACCEPTED_COUNTRY_CODES[country] || [country]).includes(
    candidate.countryCode.toUpperCase(),
  );
}

function selectPool(candidates, type) {
  const ofKind = (kind) => candidates.filter((c) => c.kind === kind);
  if (type === 'commercial') return ofKind('commercial');
  if (type === 'residential') {
    const strict = ofKind('residential');
    return strict.length ? strict : ofKind('unspecified');
  }
  return candidates.filter((c) => c.kind !== 'other');
}
export {
  classifyTags,
  osmUrl,
  hasHouseAndStreet,
  hasAdminInfo,
  needsNominatim,
  matchesCountry,
  selectPool,
};
