interface VisitorLocationEndpoint {
  url: `https://${string}`;
  fields: readonly string[];
}

export const visitorLocationConfig = {
  cacheKey: 'kang-visitor-city',
  timeoutMs: 3_000,
  endpoints: [
    {
      url: 'https://api.ip.sb/geoip',
      fields: ['city', 'region', 'country'],
    },
    {
      url: 'https://forge.speedtest.cn/api/location/info',
      fields: ['city', 'province'],
    },
    {
      url: 'https://ipapi.co/json/',
      fields: ['city', 'region', 'country_name'],
    },
  ] satisfies readonly VisitorLocationEndpoint[],
} as const;
