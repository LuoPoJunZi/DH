import { useEffect, useState } from 'react';
import { visitorLocationConfig } from '../../config/visitorLocation';

interface WelcomeGreetingProps {
  siteName: string;
  className?: string;
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

export function WelcomeGreeting({ siteName, className }: WelcomeGreetingProps) {
  const [now, setNow] = useState(() => new Date());
  const [visitorCity, setVisitorCity] = useState<string | null>(() => getTimeZoneCity());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getVisitorCity().then((city) => {
      if (isMounted && city) setVisitorCity(city);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={['welcome-greeting', className].filter(Boolean).join(' ')}>
      <time className="welcome-greeting__clock" dateTime={now.toISOString()}>
        {formatDateTime(now)}
      </time>
      <h1 className="welcome-greeting__title">
        {getGreeting(now.getHours())}，
        {visitorCity ? `欢迎来自 ${visitorCity} 的朋友` : `欢迎来到 ${siteName}`}
      </h1>
    </div>
  );
}
