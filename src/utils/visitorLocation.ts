import { visitorLocationConfig } from '../config/widgets/visitorLocation';

export function getTimeZoneCity() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = timeZone.split('/').at(-1)?.replaceAll('_', ' ').trim();
    return city && !city.startsWith('GMT') && city !== 'UTC' ? city : null;
  } catch {
    return null;
  }
}

interface ActiveVisitorCityRequest {
  promise: Promise<string | null>;
  controller: AbortController;
  waiters: number;
}

let activeRequest: ActiveVisitorCityRequest | null = null;
let cachedResult: string | null | undefined;

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

async function requestVisitorCity(refresh: boolean, signal: AbortSignal) {
  if (signal.aborted) return null;

  try {
    const cachedCity = refresh
      ? null
      : window.sessionStorage.getItem(visitorLocationConfig.cacheKey);
    if (cachedCity) return cachedCity;
  } catch {
    // Continue without a cache in privacy-restricted browsing contexts.
  }

  for (const endpoint of visitorLocationConfig.endpoints) {
    if (signal.aborted) return null;

    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timeout = window.setTimeout(abort, visitorLocationConfig.timeoutMs);

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
      if (signal.aborted) return null;
      // Try the next endpoint after a network error or timeout.
    } finally {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
    }
  }

  return null;
}

export function getVisitorCity(refresh = false, signal?: AbortSignal): Promise<string | null> {
  if (signal?.aborted) return Promise.resolve(null);
  if (refresh) {
    cachedResult = undefined;
    activeRequest?.controller.abort();
    activeRequest = null;
  } else if (cachedResult !== undefined) {
    return Promise.resolve(cachedResult);
  }

  if (!activeRequest) {
    const controller = new AbortController();
    const request: ActiveVisitorCityRequest = {
      controller,
      waiters: 0,
      promise: requestVisitorCity(refresh, controller.signal).then((city) => {
        if (!controller.signal.aborted) cachedResult = city;
        if (activeRequest === request) activeRequest = null;
        return city;
      }),
    };
    activeRequest = request;
  }

  const request = activeRequest;
  request.waiters++;
  let detached = false;
  const detach = () => {
    if (detached) return;
    detached = true;
    signal?.removeEventListener('abort', detach);
    request.waiters--;
    if (request.waiters <= 0) {
      request.controller.abort();
      if (activeRequest === request) activeRequest = null;
    }
  };
  signal?.addEventListener('abort', detach, { once: true });

  return request.promise.finally(detach);
}
