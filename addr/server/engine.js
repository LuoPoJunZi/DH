// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
import { getRandomLocation } from '../data/locations.js';
import { MAX_ROUNDS, TIME_BUDGET_MS } from './settings.js';
import { getTaxFreeState, getUsStateCode } from './format.js';
import {
  hasHouseAndStreet,
  hasAdminInfo,
  needsNominatim,
  matchesCountry,
  selectPool,
} from './candidates.js';
import { createSources } from './sources.js';
function shuffle(list, random = Math.random) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function findRealAddress(country, type, options = {}) {
  const { searchPhoton, searchOverpass, fillFromNominatim } = createSources(
    options.fetcher || fetch,
    options.signal,
    options.userAgent,
  );
  const random = options.random || Math.random;
  // 免税州模式下，靠近州界的随机点可能落到隔壁州，结果必须仍在免税州内
  const stateAllowed = (parts) =>
    (!options.taxFree || Boolean(getTaxFreeState(parts.state))) &&
    (!options.stateCode || getUsStateCode(parts.state) === options.stateCode);
  const errors = [];
  const deadline = Date.now() + TIME_BUDGET_MS;
  let photonFailures = 0;

  for (
    let round = 1;
    round <= MAX_ROUNDS && Date.now() < deadline && !options.signal?.aborted;
    round++
  ) {
    const location = getRandomLocation(country, { ...options, random });
    const radiusKm = round <= 2 ? 1.5 : 3;
    let candidates = null;
    let source = '';

    // Photon 连续失败两次后，本次请求不再尝试它
    if (photonFailures < 2) {
      try {
        candidates = await searchPhoton(location, type, radiusKm, deadline);
        source = 'photon';
      } catch (error) {
        if (options.signal?.aborted) throw error;
        photonFailures++;
        errors.push(`photon: ${error.message}`);
      }
    }
    if (!candidates) {
      try {
        candidates = await searchOverpass(location, type, radiusKm, deadline, errors);
        source = 'overpass';
      } catch (error) {
        errors.push(error.message);
        continue;
      }
    }

    const usable = candidates.filter(
      (c) =>
        hasHouseAndStreet(c) &&
        matchesCountry(c, country) &&
        (!c.parts.state || stateAllowed(c.parts)),
    );
    for (const candidate of shuffle(selectPool(usable, type), random).slice(0, 3)) {
      if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (!candidate.countryCode || needsNominatim(country, candidate.parts)) {
        await fillFromNominatim(candidate, country, deadline, errors);
      }
      if (
        hasAdminInfo(candidate.parts) &&
        matchesCountry(candidate, country) &&
        stateAllowed(candidate.parts)
      ) {
        return {
          ...candidate,
          source,
          rounds: round,
          seed: location.seed,
          candidates: [
            candidate,
            ...selectPool(usable, type).filter(
              (c) =>
                c !== candidate &&
                hasAdminInfo(c.parts) &&
                matchesCountry(c, country) &&
                stateAllowed(c.parts) &&
                selectPool([c], type).length,
            ),
          ],
        };
      }
    }
    errors.push(`第 ${round} 轮（${source}）：附近没有符合条件的门牌地址`);
  }

  const error = new Error('未能找到符合条件的真实地址，请重试或换一个类型/国家');
  error.details = errors;
  throw error;
}
export { findRealAddress };
