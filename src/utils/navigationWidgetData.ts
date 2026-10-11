import { navigationWidgetsConfig } from '../config/navigationWidgets';
import type { CurrentWeather, DailyForecast, MarketQuote } from '../types/navigation-widgets';

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numeric(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseWeatherData(value: unknown, airQuality: unknown): CurrentWeather | null {
  const data = record(value);
  const current = record(data?.current);
  if (!current) return null;
  const temperature = numeric(current.temperature_2m);
  const apparentTemperature = numeric(current.apparent_temperature);
  const weatherCode = numeric(current.weather_code);
  const windSpeed = numeric(current.wind_speed_10m);
  const isDay = numeric(current.is_day);
  if (
    temperature === null ||
    apparentTemperature === null ||
    weatherCode === null ||
    windSpeed === null ||
    (isDay !== 0 && isDay !== 1)
  )
    return null;

  const daily = record(data?.daily);
  const dates = Array.isArray(daily?.time) ? daily.time : [];
  const minimums = Array.isArray(daily?.temperature_2m_min) ? daily.temperature_2m_min : [];
  const maximums = Array.isArray(daily?.temperature_2m_max) ? daily.temperature_2m_max : [];
  const codes = Array.isArray(daily?.weather_code) ? daily.weather_code : [];
  const forecast: DailyForecast[] = [];
  for (const [index, date] of dates.slice(0, 5).entries()) {
    const minimum = numeric(minimums[index]),
      maximum = numeric(maximums[index]);
    const code = numeric(codes[index]);
    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      minimum !== null &&
      maximum !== null &&
      minimum <= maximum &&
      code !== null
    ) {
      forecast.push({ date, minimum, maximum, weatherCode: code });
    }
  }
  const air = record(record(airQuality)?.current);
  return {
    temperature,
    apparentTemperature,
    weatherCode,
    windSpeed,
    isDay: isDay === 1,
    humidity: numeric(current.relative_humidity_2m),
    airQuality: numeric(air?.us_aqi),
    uvIndex: Array.isArray(daily?.uv_index_max) ? numeric(daily.uv_index_max[0]) : null,
    forecast,
  };
}

export function isCurrentWeather(value: unknown): value is CurrentWeather {
  const data = record(value);
  if (!data || typeof data.isDay !== 'boolean' || !Array.isArray(data.forecast)) return false;
  const numberFields = ['temperature', 'apparentTemperature', 'weatherCode', 'windSpeed'];
  return (
    numberFields.every((key) => typeof data[key] === 'number' && Number.isFinite(data[key])) &&
    ['humidity', 'airQuality', 'uvIndex'].every(
      (key) => data[key] === null || (typeof data[key] === 'number' && Number.isFinite(data[key])),
    ) &&
    data.forecast.length <= 5 &&
    data.forecast.every((item) => {
      const day = record(item);
      return (
        day &&
        typeof day.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
        ['minimum', 'maximum', 'weatherCode'].every(
          (key) => typeof day[key] === 'number' && Number.isFinite(day[key]),
        )
      );
    })
  );
}

export function parseStockQuotes(value: unknown): MarketQuote[] {
  if (typeof value !== 'string') return [];
  const quotes: MarketQuote[] = [];
  for (const match of value.matchAll(/v_([a-zA-Z0-9]+)="([^"\n]*)"/g)) {
    const item = navigationWidgetsConfig.marketItems.find((item) => item.symbol === match[1]);
    const fields = (match[2] ?? '').split('~');
    const price = numeric(fields[3]),
      changePercent = numeric(fields[32]);
    if (item && price !== null && price > 0 && changePercent !== null) {
      quotes.push({ id: item.id, price, changePercent, marketTime: fields[30] ?? '' });
    }
  }
  return quotes;
}

export function parseCryptoQuotes(value: unknown): MarketQuote[] {
  if (!Array.isArray(value)) return [];
  const quotes: MarketQuote[] = [];
  for (const item of value) {
    const data = record(item);
    const asset = navigationWidgetsConfig.marketItems.find((item) => item.symbol === data?.symbol);
    const price = numeric(data?.lastPrice),
      changePercent = numeric(data?.priceChangePercent);
    const closeTime = numeric(data?.closeTime);
    if (asset && price !== null && price > 0 && changePercent !== null) {
      quotes.push({
        id: asset.id,
        price,
        changePercent,
        marketTime:
          closeTime !== null && closeTime > 0 && closeTime < 8.64e15
            ? new Date(closeTime).toISOString()
            : '',
      });
    }
  }
  return quotes;
}
