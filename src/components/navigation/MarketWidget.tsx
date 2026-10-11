import { ChartNoAxesCombined, RefreshCw } from 'lucide-react';
import { navigationWidgetsConfig } from '../../config/navigationWidgets';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';

const priceFormat = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function MarketWidget() {
  const { quotes, isLoading, refresh } = useMarketQuotes();
  return (
    <article className="navigation-widget navigation-widget--market" aria-label="市场行情">
      <div className="navigation-widget__header">
        <div className="navigation-widget__heading">
          <ChartNoAxesCombined size={15} aria-hidden="true" />
          <span>市场行情</span>
        </div>
        <button
          className="navigation-widget__refresh"
          type="button"
          aria-label="刷新行情"
          disabled={isLoading}
          onClick={refresh}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : undefined} />
        </button>
      </div>
      <div className="navigation-market">
        {navigationWidgetsConfig.marketItems.map((item) => {
          const quote = quotes.find((quote) => quote.id === item.id);
          const direction = quote
            ? quote.changePercent > 0
              ? 'up'
              : quote.changePercent < 0
                ? 'down'
                : 'flat'
            : 'flat';
          return (
            <div
              key={item.id}
              title={
                quote
                  ? item.name + ' · ' + item.unit + ' · 市场时间 ' + quote.marketTime
                  : item.name + '暂不可用'
              }
            >
              <span>{item.name}</span>
              <strong>{quote ? priceFormat.format(quote.price) : '—'}</strong>
              <small data-direction={direction}>
                {quote
                  ? (quote.changePercent > 0 ? '+' : '') + quote.changePercent.toFixed(2) + '%'
                  : '—'}
              </small>
            </div>
          );
        })}
      </div>
      <p className="sr-only" role="status">
        {isLoading
          ? '正在获取行情…'
          : !quotes.length
            ? '行情暂不可用，请稍后刷新'
            : quotes.length < 4
              ? '部分行情暂不可用'
              : '行情已更新'}
      </p>
    </article>
  );
}
