import { useEffect, useState } from 'react';
import { weatherConfig } from '../config/weather';
import type { CurrentWeather } from '../types/navigation-widgets';
import { fetchExternalData } from '../utils/externalData';
import { isCurrentWeather, parseWeatherData } from '../utils/navigationWidgetData';

export type { CurrentWeather } from '../types/navigation-widgets';

function readCachedWeather(city: string) {
  try {
    const value = window.sessionStorage.getItem(weatherConfig.cacheKey);
    if (!value) return null;
    const cached: unknown = JSON.parse(value);
    if (!cached || typeof cached !== 'object') return null;
    const data = cached as Record<string, unknown>;
    if (
      data.city !== city ||
      typeof data.savedAt !== 'number' ||
      !Number.isFinite(data.savedAt) ||
      data.savedAt > Date.now() ||
      Date.now() - data.savedAt > weatherConfig.cacheDurationMs ||
      !isCurrentWeather(data.value)
    )
      return null;
    return data.value;
  } catch {
    return null;
  }
}

async function requestCityWeather(city: string, signal: AbortSignal, refresh: boolean) {
  const cached = refresh ? null : readCachedWeather(city);
  if (cached) return cached;
  const geocodingQuery = new URLSearchParams({
    name: city,
    count: '1',
    language: 'zh',
    format: 'json',
  });
  const geocodingData = await fetchExternalData(
    weatherConfig.geocodingEndpoint + '?' + geocodingQuery.toString(),
    weatherConfig.timeoutMs,
    { signal },
  );
  if (!geocodingData || typeof geocodingData !== 'object') return null;
  const results = (geocodingData as Record<string, unknown>).results;
  const first: unknown = Array.isArray(results) ? results[0] : null;
  if (!first || typeof first !== 'object') return null;
  const location = first as Record<string, unknown>;
  const { latitude, longitude } = location;
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  )
    return null;

  const coordinates = { latitude: String(latitude), longitude: String(longitude) };
  const forecastQuery = new URLSearchParams({
    ...coordinates,
    current: weatherConfig.currentFields.join(','),
    daily: weatherConfig.dailyFields.join(','),
    forecast_days: String(weatherConfig.forecastDays),
    timezone: 'auto',
  });
  const airQuery = new URLSearchParams({ ...coordinates, current: 'us_aqi' });
  const [forecast, air] = await Promise.all([
    fetchExternalData(
      weatherConfig.forecastEndpoint + '?' + forecastQuery.toString(),
      weatherConfig.timeoutMs,
      { signal },
    ),
    fetchExternalData(
      weatherConfig.airQualityEndpoint + '?' + airQuery.toString(),
      weatherConfig.timeoutMs,
      {
        signal,
      },
    ),
  ]);
  const weather = parseWeatherData(forecast, air);
  if (!weather || signal.aborted) return null;
  try {
    window.sessionStorage.setItem(
      weatherConfig.cacheKey,
      JSON.stringify({ city, savedAt: Date.now(), value: weather }),
    );
  } catch {
    // The live weather remains usable when session storage is unavailable.
  }
  return weather;
}

export function useCityWeather(city: string | null, refreshKey = 0) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(city));

  useEffect(() => {
    const controller = new AbortController();
    setWeather(null);
    setIsLoading(Boolean(city));
    if (city) {
      void requestCityWeather(city, controller.signal, refreshKey > 0).then((result) => {
        if (controller.signal.aborted) return;
        setWeather(result);
        setIsLoading(false);
      });
    }
    return () => controller.abort();
  }, [city, refreshKey]);

  return { weather, isLoading };
}
