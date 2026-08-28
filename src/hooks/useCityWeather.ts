import { useEffect, useState } from 'react';
import { weatherConfig } from '../config/weather';

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
}

interface CachedWeather {
  city: string;
  savedAt: number;
  value: CurrentWeather;
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.temperature === 'number' &&
    typeof record.apparentTemperature === 'number' &&
    typeof record.weatherCode === 'number' &&
    typeof record.windSpeed === 'number' &&
    typeof record.isDay === 'boolean'
  );
}

function readCachedWeather(city: string) {
  try {
    const value = window.sessionStorage.getItem(weatherConfig.cacheKey);
    if (!value) return null;

    const cached = JSON.parse(value) as Partial<CachedWeather>;
    if (
      cached.city !== city ||
      typeof cached.savedAt !== 'number' ||
      Date.now() - cached.savedAt > weatherConfig.cacheDurationMs ||
      !isCurrentWeather(cached.value)
    ) {
      return null;
    }

    return cached.value;
  } catch {
    return null;
  }
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), weatherConfig.timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });
    return response.ok ? ((await response.json()) as unknown) : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function requestCityWeather(city: string) {
  const cachedWeather = readCachedWeather(city);
  if (cachedWeather) return cachedWeather;

  const geocodingQuery = new URLSearchParams({
    name: city,
    count: '1',
    language: 'zh',
    format: 'json',
  });
  const geocodingData = (await fetchJson(
    `${weatherConfig.geocodingEndpoint}?${geocodingQuery}`,
  )) as { results?: Array<{ latitude?: unknown; longitude?: unknown }> } | null;
  const location = geocodingData?.results?.[0];
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const forecastQuery = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: weatherConfig.currentFields.join(','),
    timezone: 'auto',
  });
  const forecastData = (await fetchJson(`${weatherConfig.forecastEndpoint}?${forecastQuery}`)) as {
    current?: Record<string, unknown>;
  } | null;
  const current = forecastData?.current;
  if (!current) return null;

  const weather = {
    temperature: Number(current.temperature_2m),
    apparentTemperature: Number(current.apparent_temperature),
    weatherCode: Number(current.weather_code),
    windSpeed: Number(current.wind_speed_10m),
    isDay: Number(current.is_day) === 1,
  } satisfies CurrentWeather;
  if (!isCurrentWeather(weather)) return null;

  try {
    const cached = { city, savedAt: Date.now(), value: weather } satisfies CachedWeather;
    window.sessionStorage.setItem(weatherConfig.cacheKey, JSON.stringify(cached));
  } catch {
    // Weather remains available in privacy-restricted browsing contexts.
  }

  return weather;
}

export function useCityWeather(city: string | null) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(city));

  useEffect(() => {
    let isMounted = true;

    if (!city) {
      setWeather(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    void requestCityWeather(city).then((result) => {
      if (!isMounted) return;
      setWeather(result);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [city]);

  return { weather, isLoading };
}
