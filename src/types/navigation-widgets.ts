export interface DailyForecast {
  date: string;
  minimum: number;
  maximum: number;
  weatherCode: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  humidity: number | null;
  airQuality: number | null;
  uvIndex: number | null;
  forecast: DailyForecast[];
}

export type MarketId = 'nasdaq' | 'shanghai' | 'btc' | 'eth';

export interface MarketQuote {
  id: MarketId;
  price: number;
  changePercent: number;
  marketTime: string;
}
