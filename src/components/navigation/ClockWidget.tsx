import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

function lunarDate(date: Date) {
  try {
    const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      month: 'long',
      day: 'numeric',
    }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    const days = [
      '初一',
      '初二',
      '初三',
      '初四',
      '初五',
      '初六',
      '初七',
      '初八',
      '初九',
      '初十',
      '十一',
      '十二',
      '十三',
      '十四',
      '十五',
      '十六',
      '十七',
      '十八',
      '十九',
      '二十',
      '廿一',
      '廿二',
      '廿三',
      '廿四',
      '廿五',
      '廿六',
      '廿七',
      '廿八',
      '廿九',
      '三十',
    ];
    return month && days[day - 1] ? '农历' + month + days[day - 1] : '';
  } catch {
    return '';
  }
}

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const time = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const date = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const lunar = lunarDate(now);

  return (
    <article className="navigation-widget navigation-widget--clock" aria-label="时间与日期">
      <div className="navigation-widget__heading">
        <Clock3 size={15} aria-hidden="true" />
        <span>本地时间</span>
      </div>
      <div className="navigation-clock">
        <div>
          <time className="navigation-clock__time" dateTime={now.toISOString()}>
            {time}
            <small>{seconds}</small>
          </time>
          <p className="navigation-clock__date">{date}</p>
          {lunar && <p className="navigation-widget__muted">{lunar}</p>}
        </div>
        <div className="navigation-clock__day" aria-hidden="true">
          <strong>{now.getDate()}</strong>
          <span>{now.getMonth() + 1} 月</span>
        </div>
      </div>
    </article>
  );
}
