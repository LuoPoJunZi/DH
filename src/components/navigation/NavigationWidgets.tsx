import { ClockWidget } from './ClockWidget';
import { MarketWidget } from './MarketWidget';
import { WeatherWidget } from './WeatherWidget';

export function NavigationWidgets() {
  return (
    <section className="navigation-widgets container container--wide" aria-label="首页信息">
      <ClockWidget />
      <WeatherWidget />
      <MarketWidget />
    </section>
  );
}
