import { useEffect, useState } from 'react';

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

export function WelcomeGreeting({ siteName, className }: WelcomeGreetingProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const visitorCity = getTimeZoneCity();

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
