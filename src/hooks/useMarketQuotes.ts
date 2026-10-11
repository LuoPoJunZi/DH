import { useEffect, useState } from 'react';
import { navigationWidgetsConfig } from '../config/navigationWidgets';
import type { MarketQuote } from '../types/navigation-widgets';
import { fetchExternalData } from '../utils/externalData';
import { parseCryptoQuotes, parseStockQuotes } from '../utils/navigationWidgetData';

export function useMarketQuotes() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setIsLoading(true);
      const [stocks, crypto] = await Promise.all([
        fetchExternalData(
          navigationWidgetsConfig.stockEndpoint,
          navigationWidgetsConfig.timeoutMs,
          { signal: controller.signal, encoding: 'gbk' },
        ),
        fetchExternalData(
          navigationWidgetsConfig.cryptoEndpoint,
          navigationWidgetsConfig.timeoutMs,
          { signal: controller.signal },
        ),
      ]);
      if (controller.signal.aborted) return;
      const next = [...parseStockQuotes(stocks), ...parseCryptoQuotes(crypto)];
      setQuotes(next);
      setUpdatedAt(next.length ? new Date() : null);
      setIsLoading(false);
      pending = false;
    };
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, navigationWidgetsConfig.marketRefreshMs);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refreshKey]);

  return { quotes, isLoading, updatedAt, refresh: () => setRefreshKey((value) => value + 1) };
}
