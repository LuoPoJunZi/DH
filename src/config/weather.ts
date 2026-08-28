export const weatherConfig = {
  geocodingEndpoint: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastEndpoint: 'https://api.open-meteo.com/v1/forecast',
  sourceUrl: 'https://open-meteo.com/',
  cacheKey: 'luopo-city-weather-v1',
  cacheDurationMs: 20 * 60 * 1_000,
  timeoutMs: 4_000,
  currentFields: [
    'temperature_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'is_day',
  ],
} as const;
