// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See THIRD_PARTY_NOTICES.md.
export { findRealAddress } from './server/engine.js';
export {
  normalizeParts,
  formatAddress,
  getTaxFreeState,
  buildHongKongVersions,
} from './server/format.js';
export { getRandomName, getRandomPhoneNumber, pickUsAreaCodes } from './data/profiles.js';
