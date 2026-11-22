export const weatherConfig = {
  geocodingEndpoint: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastEndpoint: 'https://api.open-meteo.com/v1/forecast',
  sourceUrl: 'https://open-meteo.com/',
  cacheKey: 'luopo-city-weather-v3',
  cacheDurationMs: 20 * 60 * 1_000,
  timeoutMs: 4_000,
  currentFields: ['temperature_2m', 'apparent_temperature', 'weather_code', 'is_day'],
  dailyFields: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
  forecastDays: 5,
} as const;
