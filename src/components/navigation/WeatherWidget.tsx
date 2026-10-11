import { MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useCityWeather } from '../../hooks/useCityWeather';
import { useVisitorCity } from '../../hooks/useVisitorCity';
import { weatherPresentation } from './weatherPresentation';

export function WeatherWidget() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { city, isLoading: isLocating } = useVisitorCity(refreshKey);
  const { weather, isLoading } = useCityWeather(city, refreshKey);
  const current = weather ? weatherPresentation(weather.weatherCode, weather.isDay) : null;
  const CurrentIcon = current?.icon;

  return (
    <article className="navigation-widget navigation-widget--weather" aria-label="当地天气">
      <div className="navigation-widget__header">
        <div className="navigation-widget__heading">
          <MapPin size={15} aria-hidden="true" />
          <span>{city ?? '当地天气'}</span>
        </div>
        <button
          className="navigation-widget__refresh"
          type="button"
          aria-label="刷新天气"
          disabled={isLoading || isLocating}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          <RefreshCw size={14} className={isLoading || isLocating ? 'spin' : undefined} />
        </button>
      </div>
      {weather && current && CurrentIcon ? (
        <div className="navigation-weather">
          <div className="navigation-weather__current">
            <div>
              <strong>{weather.temperature.toFixed(1)}°</strong>
              <CurrentIcon size={23} aria-hidden="true" />
            </div>
            <span>
              {current.label} · 体感 {Math.round(weather.apparentTemperature)}°
            </span>
          </div>
          <div className="navigation-weather__forecast" aria-label="未来五天天气">
            {weather.forecast.map((day, index) => {
              const { label, icon: Icon } = weatherPresentation(day.weatherCode);
              return (
                <div key={day.date} title={day.date + ' ' + label}>
                  <span>{index === 0 ? '今天' : day.date.slice(5).replace('-', '/')}</span>
                  <Icon size={17} aria-hidden="true" />
                  <b>{Math.round(day.maximum)}°</b>
                  <small>{Math.round(day.minimum)}°</small>
                </div>
              );
            })}
            {!weather.forecast.length && (
              <span className="navigation-widget__muted">预报暂不可用</span>
            )}
          </div>
        </div>
      ) : (
        <p className="navigation-widget__status" role="status">
          {isLoading || isLocating ? '正在获取当地天气…' : '天气暂不可用，请稍后刷新'}
        </p>
      )}
    </article>
  );
}
