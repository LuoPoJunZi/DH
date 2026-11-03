// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
import { US_STATES, US_TAX_FREE_STATES } from '../data/locations.js';
import {
  COUNTRY_NAMES,
  ADDRESS_STYLES,
  CN_DISTRICT_PATTERN,
  HK_REGIONS,
  HK_DISTRICTS,
} from './settings.js';
function getUsStateCode(state) {
  if (!state) return null;
  const normalized = state.trim().toLowerCase();
  return (
    Object.keys(US_STATES).find(
      (code) => code.toLowerCase() === normalized || US_STATES[code].toLowerCase() === normalized,
    ) || null
  );
}

function getTaxFreeState(state) {
  const code = getUsStateCode(state);
  return code && US_TAX_FREE_STATES[code] ? { code, ...US_TAX_FREE_STATES[code] } : null;
}

function joinNonEmpty(list, separator) {
  return list
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(separator);
}

function uniqueAdmin(list) {
  const result = [];
  for (const item of list) {
    if (!item || result.some((x) => x.includes(item) || item.includes(x))) continue;
    result.push(item);
  }
  return result;
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(value || '');
}

function splitBilingual(value) {
  if (!value) return { zh: null, en: null };
  if (!hasCjk(value)) return { zh: null, en: value.trim() };
  const match = value.match(/[A-Za-z].*$/);
  if (!match) return { zh: value.trim(), en: null };
  return { zh: value.slice(0, match.index).trim() || null, en: match[0].trim() };
}

function findHkDistrict(value) {
  const { zh, en } = splitBilingual(value);
  const enKey =
    en &&
    en
      .replace(/&/g, 'and')
      .replace(/\s+District$/i, '')
      .toLowerCase();
  const zhKey = zh && zh.replace(/區$/, '');
  return (
    HK_DISTRICTS.find((d) => d.en.toLowerCase() === enKey || d.zh.replace(/區$/, '') === zhKey) ||
    null
  );
}

function findHkRegion(value) {
  const { zh, en } = splitBilingual(value);
  return (
    Object.keys(HK_REGIONS).find(
      (key) =>
        HK_REGIONS[key].en.toLowerCase() === (en || '').toLowerCase() || HK_REGIONS[key].zh === zh,
    ) || null
  );
}

function normalizeHongKong(parts, lang) {
  const street = splitBilingual(parts.street)[lang];
  if (!street) return null;
  const english = lang === 'en';
  const hints = [parts.district, parts.locality, ...(parts.hkHints || [])];
  const district = hints.map(findHkDistrict).find(Boolean);
  const regionKey = district ? district.region : hints.map(findHkRegion).find(Boolean);
  const region = regionKey ? HK_REGIONS[regionKey] : null;
  // 地区名（如 Quarry Bay）：优先 Photon 的 locality；Photon 的 district 有时是村名而不是 18 区之一，也可当作地区名；
  // 都没有时再从 Nominatim 的 suburb/town 中找。排除分区、三大区域和"香港"本身，并取第一个有该语言名称的
  const isHongKong = (v) => {
    const { zh, en } = splitBilingual(v);
    return en === 'Hong Kong' || zh === '香港';
  };
  const area = [parts.locality, parts.district, ...(parts.hkHints || [])]
    .filter((v) => v && !findHkDistrict(v) && !findHkRegion(v) && !isHongKong(v))
    .map((v) => splitBilingual(v)[lang])
    .find(Boolean);
  return {
    houseNumber: parts.houseNumber,
    street,
    locality: area || undefined,
    cityDistrict: district ? (english ? `${district.en} District` : district.zh) : undefined,
    city: english ? 'Hong Kong' : '香港',
    state: region ? (english ? region.en : region.zh) : undefined,
  };
}

function buildHongKongVersions(found) {
  const versions = {};
  for (const lang of ['en', 'zh']) {
    const parts = normalizeHongKong(found.parts, lang);
    versions[lang] = parts
      ? {
          address: formatAddress('HK', parts),
          addressParts: { ...parts, country: lang === 'en' ? 'Hong Kong' : '中國香港' },
          placeName: splitBilingual(found.placeName)[lang] || found.placeName,
        }
      : null;
  }
  return versions;
}

function normalizeParts(country, parts) {
  if (country === 'HK') {
    // 默认英文；街道只有中文名时用繁体中文
    return normalizeHongKong(parts, 'en') || normalizeHongKong(parts, 'zh');
  }
  const result = { ...parts };
  if (country === 'US') {
    // 州统一为全称，另给出缩写供地址格式化和表单填写使用
    const code = getUsStateCode(result.state);
    if (code) {
      result.state = US_STATES[code];
      result.stateCode = code;
    }
  }
  if (country === 'CN') {
    // 直辖市的数据里 city 常常其实是区：挪到"区/县"，城市改用直辖市名
    if (CN_DISTRICT_PATTERN.test(result.city || '')) {
      result.cityDistrict = result.cityDistrict || result.city;
      result.city = /市$/.test(result.state || '') ? result.state : undefined;
    }
    // Photon 有时把区放在 district 字段（其余情况下 district 是"街道"）
    if (!result.cityDistrict && CN_DISTRICT_PATTERN.test(result.district || '')) {
      result.cityDistrict = result.district;
    }
  }
  if (
    country === 'TW' &&
    /[區鄉鎮市]$/.test(result.district || '') &&
    result.district !== result.city
  ) {
    result.cityDistrict = result.district;
  }
  if (country === 'JP') {
    // 政令指定都市的区（东京 23 区本身就是 city，不重复）
    if (/[区町村]$/.test(result.district || '') && result.district !== result.city) {
      result.cityDistrict = result.district;
    }
    // Photon 有时把都道府县（如"東京都"）放在 city：挪到 state，东京特别区等作为城市
    if (/[都道府県]$/.test(result.city || '') && (!result.state || result.state === result.city)) {
      result.state = result.city;
      result.city = result.cityDistrict || undefined;
      result.cityDistrict = undefined;
    }
    // 日本地址不用街道名："番"并入门牌号（番-号），街道字段改为町丁目
    if (/^\d+$/.test(result.street || '')) {
      result.houseNumber = `${result.street}-${result.houseNumber}`;
      result.street = result.locality;
    } else if (result.locality) {
      result.street = result.locality;
    }
  }
  return result;
}

function formatAddress(country, parts) {
  const p = parts;
  const cityLike = p.city || p.district || p.county;
  const countryName = COUNTRY_NAMES[country] || country;

  switch (ADDRESS_STYLES[country]) {
    case 'cn': {
      // 中国：省/直辖市 + 市 + 区县 + 路 + 号；"街道""社区"不属于邮寄地址，邮编单独作为字段
      const district =
        p.cityDistrict || (CN_DISTRICT_PATTERN.test(p.district || '') ? p.district : null);
      const number = /\d$/.test(p.houseNumber) ? p.houseNumber + '号' : p.houseNumber;
      return uniqueAdmin([p.state, p.city, p.county, district]).join('') + p.street + number;
    }
    case 'tw': {
      // 台湾：郵遞區號 + 縣市 + 鄉鎮市區 + 路段 + 號
      const district = p.cityDistrict || (/[區鄉鎮市]$/.test(p.district || '') ? p.district : null);
      const number = /\d$/.test(p.houseNumber) ? p.houseNumber + '號' : p.houseNumber;
      return (
        (p.postcode || '') +
        uniqueAdmin([p.state, p.city, p.county, district]).join('') +
        p.street +
        number
      );
    }
    case 'jp': {
      // 日本：〒邮编 都道府县 + 市区町村 + 町丁目 + 番-号（normalizeParts 已把町丁目放进 street、番-号放进 houseNumber）
      const line =
        uniqueAdmin([p.state, p.city, p.cityDistrict]).join('') + (p.street || '') + p.houseNumber;
      return joinNonEmpty([p.postcode ? `〒${p.postcode}` : '', line], ' ');
    }
    case 'kr':
      // 韩国道路名地址：시/도 + 구/군 + 도로명 + 건물번호（동 不属于道路名地址主体，邮编单独作为字段）
      return joinNonEmpty(
        [...uniqueAdmin([p.state, p.city, p.cityDistrict || p.county]), p.street, p.houseNumber],
        ' ',
      );
    case 'hk': {
      // 香港没有邮编。英文：门牌 街道, 地区, 三大区域, Hong Kong；中文：香港 + 三大区域 + 地区 + 街道 + 号
      const locality = p.locality && !p.street.includes(p.locality) ? p.locality : null;
      if (!hasCjk(p.street)) {
        const area = locality || p.cityDistrict;
        return joinNonEmpty([`${p.houseNumber} ${p.street}`, area, p.state, 'Hong Kong'], ', ');
      }
      // 中文习惯写"大埔"而不是"大埔區"（"東區""北區"这类两字区名保留）
      const zhDistrict =
        p.cityDistrict && p.cityDistrict.length > 2
          ? p.cityDistrict.replace(/區$/, '')
          : p.cityDistrict;
      const number = /\d$/.test(p.houseNumber) ? p.houseNumber + '號' : p.houseNumber;
      // 中文习惯中港岛地址只写"香港"，不再加"香港島"
      const region = p.state === '香港島' ? '' : p.state || '';
      return '香港' + region + (locality || zhDistrict || '') + p.street + number;
    }
    case 'uk':
      return joinNonEmpty(
        [`${p.houseNumber} ${p.street}`, cityLike, p.postcode, countryName],
        ', ',
      );
    case 'fr':
      return joinNonEmpty(
        [`${p.houseNumber} ${p.street}`, joinNonEmpty([p.postcode, cityLike], ' '), countryName],
        ', ',
      );
    case 'streetFirst':
      return joinNonEmpty(
        [`${p.street} ${p.houseNumber}`, joinNonEmpty([p.postcode, cityLike], ' '), countryName],
        ', ',
      );
    case 'latin':
      return joinNonEmpty(
        [`${p.street}, ${p.houseNumber}`, joinNonEmpty([p.postcode, cityLike], ' '), countryName],
        ', ',
      );
    case 'numberFirst':
    default:
      return joinNonEmpty(
        [
          `${p.houseNumber} ${p.street}`,
          cityLike,
          joinNonEmpty([p.stateCode || p.state, p.postcode], ' '),
          countryName,
        ],
        ', ',
      );
  }
}
export { getUsStateCode, getTaxFreeState, normalizeParts, formatAddress, buildHongKongVersions };
