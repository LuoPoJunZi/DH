import type { MarketId } from '../types/navigation-widgets';

interface MarketItem {
  id: MarketId;
  name: string;
  symbol: string;
  unit: string;
}

export const navigationWidgetsConfig = {
  timeoutMs: 5_000,
  marketRefreshMs: 60_000,
  stockEndpoint: 'https://qt.gtimg.cn/q=usIXIC,sh000001',
  cryptoEndpoint:
    'https://data-api.binance.vision/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22%5D',
  stockSourceUrl: 'https://gu.qq.com/',
  cryptoSourceUrl: 'https://www.binance.com/zh-CN/markets',
  marketItems: [
    { id: 'nasdaq', name: '纳指', symbol: 'usIXIC', unit: '点' },
    { id: 'shanghai', name: '上证', symbol: 'sh000001', unit: '点' },
    { id: 'btc', name: 'BTC', symbol: 'BTCUSDT', unit: 'USDT' },
    { id: 'eth', name: 'ETH', symbol: 'ETHUSDT', unit: 'USDT' },
  ] satisfies readonly MarketItem[],
} as const;
