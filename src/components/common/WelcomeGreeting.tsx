import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { visitorLocationConfig } from '../../config/visitorLocation';
import { type CurrentWeather, useCityWeather } from '../../hooks/useCityWeather';

interface WelcomeGreetingProps {
  siteName: string;
  className?: string;
  children?: ReactNode;
}

interface WeatherPresentation {
  label: string;
  icon: LucideIcon;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateTime(date: Date) {
  const weekday = '日一二三四五六'[date.getDay()];
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 星期${weekday} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getGreeting(hour: number) {
  if (hour < 5) return '凌晨好';
  if (hour < 12) return '上午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function getWeatherPresentation(weather: CurrentWeather): WeatherPresentation {
  const { weatherCode, isDay } = weather;
  if (weatherCode === 0) return { label: isDay ? '晴朗' : '晴夜', icon: isDay ? Sun : Moon };
  if (weatherCode <= 2) return { label: '少云', icon: CloudSun };
  if (weatherCode === 3) return { label: '阴天', icon: Cloud };
  if (weatherCode === 45 || weatherCode === 48) return { label: '有雾', icon: CloudFog };
  if (weatherCode >= 51 && weatherCode <= 57) return { label: '毛毛雨', icon: CloudDrizzle };
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return { label: '有雨', icon: CloudRain };
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return { label: '有雪', icon: CloudSnow };
  }
  if (weatherCode >= 95) return { label: '雷雨', icon: CloudLightning };
  return { label: '多云', icon: Cloud };
}

function getTimeZoneCity() {
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

function getVisitorCity() {
  visitorCityRequest ??= requestVisitorCity();
  return visitorCityRequest;
}

export function WelcomeGreeting({ siteName, className, children }: WelcomeGreetingProps) {
  const [now, setNow] = useState(() => new Date());
  const [visitorCity, setVisitorCity] = useState<string | null>(() => getTimeZoneCity());
  const [weatherCity, setWeatherCity] = useState<string | null>(null);
  const { weather, isLoading: isWeatherLoading } = useCityWeather(weatherCity);
  const locationName = visitorCity ?? siteName;
  const weatherPresentation = weather ? getWeatherPresentation(weather) : null;
  const WeatherIcon = weatherPresentation?.icon ?? Cloud;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getVisitorCity().then((city) => {
      if (!isMounted) return;

      if (city) {
        setVisitorCity(city);
        setWeatherCity(city);
      } else {
        setWeatherCity(getTimeZoneCity());
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={['welcome-greeting', className].filter(Boolean).join(' ')}>
      <div className="welcome-greeting__composition">
        <div className="welcome-greeting__message">
          <time className="welcome-greeting__clock" dateTime={now.toISOString()}>
            {formatDateTime(now)}
          </time>
          <h1 className="welcome-greeting__title">{getGreeting(now.getHours())}，欢迎回来。</h1>
          {children}
        </div>

        <div className="welcome-greeting__location">
          <div className="welcome-greeting__location-copy">
            <span>{visitorCity ? '欢迎来自' : '欢迎来到'}</span>
            <strong>{locationName}</strong>
            <small>{visitorCity ? '的朋友' : '网站导航'}</small>
          </div>

          {weather && weatherPresentation ? (
            <div
              className="welcome-greeting__weather"
              aria-label={`${weatherPresentation.label}，${Math.round(weather.temperature)} 摄氏度，体感 ${Math.round(weather.apparentTemperature)} 摄氏度，风速 ${Math.round(weather.windSpeed)} 公里每小时`}
            >
              <span className="welcome-greeting__weather-icon">
                <WeatherIcon size={26} aria-hidden="true" />
              </span>
              <strong>{Math.round(weather.temperature)}°</strong>
              <span className="welcome-greeting__weather-detail">
                <b>{weatherPresentation.label}</b>
                <small>
                  体感 {Math.round(weather.apparentTemperature)}° · 风速{' '}
                  {Math.round(weather.windSpeed)} km/h
                </small>
              </span>
            </div>
          ) : weatherCity === null || isWeatherLoading ? (
            <span className="welcome-greeting__weather-loading">正在获取当地天气…</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
