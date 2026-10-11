import { visitorLocationConfig } from '../config/visitorLocation';

export function getTimeZoneCity() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = timeZone.split('/').at(-1)?.replaceAll('_', ' ').trim();
    return city && !city.startsWith('GMT') && city !== 'UTC' ? city : null;
  } catch {
    return null;
  }
}

let visitorCityRequest: Promise<string | null> | null = null;

function readLocationField(data: unknown, fields: readonly string[]) {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().slice(0, 40);
    }
  }

  return null;
}

async function requestVisitorCity() {
  try {
    const cachedCity = window.sessionStorage.getItem(visitorLocationConfig.cacheKey);
    if (cachedCity) return cachedCity;
  } catch {
    // Continue without a cache in privacy-restricted browsing contexts.
  }

  for (const endpoint of visitorLocationConfig.endpoints) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), visitorLocationConfig.timeoutMs);

    try {
      const response = await fetch(endpoint.url, {
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) continue;

      const city = readLocationField(await response.json(), endpoint.fields);
      if (!city) continue;

      try {
        window.sessionStorage.setItem(visitorLocationConfig.cacheKey, city);
      } catch {
        // The greeting still works when sessionStorage is unavailable.
      }

      return city;
    } catch {
      // Try the next endpoint after a network error or timeout.
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return null;
}

export function getVisitorCity(refresh = false) {
  if (refresh) visitorCityRequest = null;
  visitorCityRequest ??= requestVisitorCity();
  return visitorCityRequest;
}
