// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
import {
  USER_AGENT,
  PHOTON_REVERSE_URL,
  OVERPASS_ENDPOINTS,
  NOMINATIM_REVERSE_URL,
  PHOTON_TAG_FILTERS,
  RESIDENTIAL_BUILDINGS,
  COMMERCIAL_BUILDINGS,
  COMMERCIAL_AMENITIES,
  COMMERCIAL_TOURISM,
  CN_DISTRICT_PATTERN,
  JP_BARE_CHOME,
} from './settings.js';
import { classifyTags, osmUrl } from './candidates.js';
let nextReverse = 0;
async function reserveReverseSlot(signal) {
  const at = Math.max(Date.now(), nextReverse);
  nextReverse = at + 1100;
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const delay = at - Date.now();
  if (delay > 0)
    await new Promise((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', abort);
        resolve();
      }, delay);
      signal?.addEventListener('abort', abort, { once: true });
    });
}
export function createSources(fetcher = fetch, parent, userAgent = USER_AGENT) {
  async function fetchJson(url, options = {}, timeoutMs = 5000) {
    if (parent?.aborted) throw new DOMException('Aborted', 'AbortError');
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (parent?.aborted) abort();
    parent?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, Math.max(1, timeoutMs));
    try {
      const response = await fetcher(url, {
        ...options,
        redirect: 'manual',
        headers: { 'User-Agent': userAgent, Accept: 'application/json', ...options.headers },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Missing response body');
      const parts = [];
      let length = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.byteLength;
          if (length > 700000) {
            await reader.cancel();
            throw new Error('Map response too large');
          }
          parts.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const part of parts) {
        bytes.set(part, offset);
        offset += part.byteLength;
      }
      return JSON.parse(new TextDecoder().decode(bytes));
    } finally {
      clearTimeout(timer);
      parent?.removeEventListener('abort', abort);
    }
  }
  function budgetedTimeout(deadline, maxMs) {
    return Math.max(0, Math.min(maxMs, deadline - Date.now()));
  }

  function fromPhotonFeature(feature) {
    const p = feature.properties || {};
    const [lng, lat] = feature.geometry.coordinates;
    const osmTypes = { N: 'node', W: 'way', R: 'relation' };
    return {
      parts: {
        houseNumber: p.housenumber,
        street: p.street,
        locality: p.locality,
        district: p.district,
        city: p.city,
        county: p.county,
        state: p.state,
        postcode: p.postcode,
      },
      countryCode: p.countrycode,
      kind: classifyTags({ [p.osm_key]: p.osm_value }),
      category: `${p.osm_key}=${p.osm_value}`,
      placeName: p.name || '',
      lat,
      lng,
      osmUrl: osmUrl(osmTypes[p.osm_type], p.osm_id),
    };
  }

  function fromOverpassElement(element) {
    const t = element.tags || {};
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    const categoryKey = ['shop', 'office', 'amenity', 'tourism', 'craft', 'building'].find(
      (k) => t[k],
    );
    return {
      parts: {
        houseNumber: t['addr:housenumber'],
        // 日本地址用"番"（addr:block_number）代替街道
        street: t['addr:street'] || t['addr:block_number'] || t['addr:place'],
        locality: t['addr:neighbourhood'] || t['addr:quarter'],
        district: t['addr:district'] || t['addr:suburb'],
        city: t['addr:city'] || t['addr:town'] || t['addr:village'],
        county: t['addr:county'],
        state: t['addr:province'] || t['addr:state'],
        postcode: t['addr:postcode'],
      },
      countryCode: t['addr:country'],
      kind: classifyTags(t),
      category: categoryKey ? `${categoryKey}=${t[categoryKey]}` : 'address',
      placeName: t.name || '',
      lat,
      lng,
      osmUrl: osmUrl(element.type, element.id),
    };
  }

  async function searchPhoton(location, type, radiusKm, deadline) {
    const params = new URLSearchParams({
      lat: location.lat.toFixed(6),
      lon: location.lng.toFixed(6),
      limit: '50',
      radius: String(radiusKm),
      layer: 'house',
      // 固定返回当地名称，否则会随浏览器的 Accept-Language 变成英文等其他语言
      lang: 'default',
    });
    PHOTON_TAG_FILTERS[type].forEach((tag) => params.append('osm_tag', tag));
    const data = await fetchJson(
      `${PHOTON_REVERSE_URL}?${params}`,
      {},
      budgetedTimeout(deadline, 4500),
    );
    return (data.features || []).map(fromPhotonFeature);
  }

  function buildOverpassQuery(location, type, radiusKm) {
    const around = `(around:${Math.min(radiusKm * 1000, 1500)},${location.lat.toFixed(6)},${location.lng.toFixed(6)})`;
    const hn = '["addr:housenumber"]';
    let body;
    if (type === 'residential') {
      body = `nwr${hn}["building"~"^(${RESIDENTIAL_BUILDINGS.join('|')})$"]${around};
                node${hn}[!"building"][!"shop"][!"amenity"][!"office"][!"tourism"][!"craft"]${around};`;
    } else if (type === 'commercial') {
      body =
        ['shop', 'office', 'craft'].map((k) => `nwr${hn}["${k}"]${around};`).join('') +
        `nwr${hn}["amenity"~"^(${COMMERCIAL_AMENITIES.join('|')})$"]${around};` +
        `nwr${hn}["tourism"~"^(${COMMERCIAL_TOURISM.join('|')})$"]${around};` +
        `nwr${hn}["building"~"^(${COMMERCIAL_BUILDINGS.join('|')})$"]${around};`;
    } else {
      body = `nwr${hn}${around};`;
    }
    return `[out:json][timeout:10];(${body});out center tags 50;`;
  }

  async function searchOverpass(location, type, radiusKm, deadline, errors) {
    const query = buildOverpassQuery(location, type, radiusKm);
    for (const endpoint of OVERPASS_ENDPOINTS) {
      if (budgetedTimeout(deadline, 3500) < 2000) break;
      try {
        const data = await fetchJson(
          endpoint,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query),
          },
          budgetedTimeout(deadline, 3500),
        );
        return (data.elements || []).map(fromOverpassElement);
      } catch (error) {
        errors.push(`overpass(${new URL(endpoint).host}): ${error.message}`);
      }
    }
    throw new Error('所有 Overpass 节点均不可用');
  }

  function extractCityDistrict(country, parts, a) {
    if (country === 'CN') {
      return [a.city_district, a.district, a.county, a.city].find(
        (name) =>
          name &&
          (CN_DISTRICT_PATTERN.test(name) ||
            (/市$/.test(name) && name !== parts.city && name !== parts.state)),
      );
    }
    if (country === 'KR') {
      return a.borough || a.county || a.city_district;
    }
    return undefined;
  }

  async function fillFromNominatim(candidate, country, deadline, errors) {
    // accept-language 传一个不匹配任何语言的值，Nominatim 会回退到当地名称（与 Photon 的 lang=default 一致）
    await reserveReverseSlot(parent);
    const url = `${NOMINATIM_REVERSE_URL}?format=json&lat=${candidate.lat}&lon=${candidate.lng}&zoom=18&addressdetails=1&accept-language=default`;
    try {
      const data = await fetchJson(url, {}, budgetedTimeout(deadline, 1500));
      const a = data.address || {};
      const p = candidate.parts;
      p.cityDistrict = p.cityDistrict || extractCityDistrict(country, p, a);
      const nominatimCity = a.city || a.town || a.village || a.municipality;
      // 中国的 Nominatim city 常常其实是区，不能当作城市
      if (!(country === 'CN' && CN_DISTRICT_PATTERN.test(nominatimCity || ''))) {
        p.city = p.city || nominatimCity;
      }
      p.district = p.district || a.city_district || a.suburb;
      p.county = p.county || a.county;
      p.state = p.state || a.state || a.province;
      p.postcode = p.postcode || a.postcode;
      // 日本：町丁目缺失或只有"N丁目"时，用 Nominatim 的完整町丁目名替换
      if (country === 'JP' && (!p.locality || JP_BARE_CHOME.test(p.locality))) {
        const chome = a.neighbourhood || a.quarter;
        if (chome && !JP_BARE_CHOME.test(chome)) p.locality = chome;
      }
      p.locality = p.locality || a.neighbourhood || a.quarter;
      // 香港：三大区域在 region 或 city_district 中，分区有时在 suburb/town 中，留给 normalizeHongKong 判断
      if (country === 'HK') {
        p.hkHints = [a.city_district, a.region, a.suburb, a.town].filter(Boolean);
      }
      candidate.countryCode = candidate.countryCode || a.country_code;
    } catch (error) {
      errors.push(`nominatim: ${error.message}`);
    }
  }
  return { searchPhoton, searchOverpass, fillFromNominatim, budgetedTimeout };
}
