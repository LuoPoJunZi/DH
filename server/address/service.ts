import { publicCatalog } from './catalog';
import { fetchUsWorkerPool, getUserData, getRandomState } from './us-worker';
import { resolveScope, type OsmAddressPool, type Scope } from './providers';
import { fetchInternationalPool, fetchInternationalReverse } from './international';
import { ApiError, json, readJsonLimited, type AddressContext } from './runtime';
import {
  addressKey,
  isAddressRecord,
  isCountryCode,
  isObject,
  MAX_BATCH_SIZE,
} from '../../src/tools/other/address-generator/utils';
import type { AddressRecord, GenerateOptions } from '../../src/tools/other/address-generator/types';

const TTL_MS = 12 * 60 * 60 * 1000;
const MAX_MEMORY_KEYS = 35;
const poolTtl = (scope: Scope, pool: OsmAddressPool) =>
  scope.countryCode === 'US' || pool.strategy === 'reverse' ? 30000 : TTL_MS;
interface Dependencies {
  fetcher?: typeof fetch;
  now?: () => number;
  uuid?: () => string;
  random?: () => number;
  disableRateLimitForTests?: boolean;
  disableEdgeCacheForTests?: boolean;
  reverseSchedule?: (signal: AbortSignal) => Promise<void>;
}
export function validateOptions(value: unknown): GenerateOptions {
  const allowed = [
    'countryCode',
    'regionCode',
    'cityId',
    'kind',
    'count',
    'includeContact',
    'previousSourceId',
  ];
  if (
    !isObject(value) ||
    Object.keys(value).some((key) => !allowed.includes(key)) ||
    !isCountryCode(value.countryCode) ||
    typeof value.regionCode !== 'string' ||
    value.regionCode.length > 24 ||
    typeof value.cityId !== 'string' ||
    value.cityId.length > 80 ||
    !['residential', 'building'].includes(String(value.kind)) ||
    !Number.isInteger(value.count) ||
    (value.count as number) < 1 ||
    (value.count as number) > MAX_BATCH_SIZE ||
    typeof value.includeContact !== 'boolean' ||
    (value.previousSourceId !== undefined &&
      (typeof value.previousSourceId !== 'string' ||
        !/^(node|way|relation)\/[1-9]\d{0,17}$/.test(value.previousSourceId)))
  )
    throw new ApiError(400, '请选择有效的国家、地区和 1–5 条生成数量。', 'INVALID_OPTIONS');
  return value as unknown as GenerateOptions;
}
export function sampleRecords(
  records: readonly AddressRecord[],
  count: number,
  random: () => number = Math.random,
): AddressRecord[] {
  const shuffled = records.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const value = random();
    const j = Math.min(i, Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * (i + 1))));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const seen = new Set<string>();
  return shuffled
    .filter((r) => {
      const key = addressKey(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
}

interface EdgeCache {
  match(key: Request): Promise<Response | undefined>;
  put(key: Request, response: Response): Promise<unknown>;
}
function cloudflareCache(): EdgeCache | undefined {
  return (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default;
}
function isCachedPool(value: unknown): value is OsmAddressPool {
  return (
    isObject(value) &&
    (value.strategy === undefined || value.strategy === 'reverse') &&
    Array.isArray(value.records) &&
    value.records.length > 0 &&
    value.records.length <= 180 &&
    value.records.every(isAddressRecord) &&
    typeof value.retrievedAt === 'string' &&
    Number.isFinite(Date.parse(value.retrievedAt))
  );
}
export function createAddressService(deps: Dependencies = {}) {
  const fetcher = deps.fetcher ?? fetch,
    now = deps.now ?? Date.now;
  const uuid = deps.uuid ?? (() => crypto.randomUUID());
  const random = deps.random ?? Math.random;
  const buckets = new Map<string, { start: number; count: number }>();
  const cached = new Map<string, { expires: number; pool: OsmAddressPool }>();
  const inflight = new Map<string, Promise<OsmAddressPool>>();
  let lastUpstream = Number.NEGATIVE_INFINITY;
  function consume(key: string, limit: number) {
    if (deps.disableRateLimitForTests) return;
    const at = now();
    for (const [id, bucket] of buckets) if (at - bucket.start >= 60000) buckets.delete(id);
    const bucket = buckets.get(key) ?? { start: at, count: 0 };
    if (bucket.count >= limit || (buckets.size >= 2000 && !buckets.has(key)))
      throw new ApiError(429, '操作频繁，请一分钟后再试。', 'RATE_LIMIT');
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  async function poolFor(
    context: AddressContext,
    scope: Scope,
    count: number,
    previousSourceId?: string,
  ): Promise<{ pool: OsmAddressPool; hit: boolean }> {
    const key = scope.countryCode === 'US' ? 'us-worker-' + scope.regionCode : scope.seed.id;
    const refresh = scope.countryCode === 'US' && Boolean(previousSourceId);
    const local = cached.get(key);
    let reverseOnly = local?.pool.strategy === 'reverse' && local.expires > now();
    if (!refresh && local && local.expires > now() && !(reverseOnly && previousSourceId))
      return { pool: local.pool, hit: true };
    const edge = deps.disableEdgeCacheForTests ? undefined : cloudflareCache();
    // This is an internal cache key, not a public endpoint, never requested from the network.
    const cacheKey = new Request(
      new URL(
        `/api/address/_osm-cache/v6/${encodeURIComponent(key)}`,
        context.request.url,
      ).toString(),
    );
    if (edge && !refresh) {
      try {
        const hit = await edge.match(cacheKey);
        if (hit && hit.ok) {
          const value = await readJsonLimited(hit, 900_000);
          if (
            isCachedPool(value) &&
            Date.parse(value.retrievedAt) > now() - poolTtl(scope, value)
          ) {
            cached.set(key, {
              expires: Date.parse(value.retrievedAt) + poolTtl(scope, value),
              pool: value,
            });
            reverseOnly = value.strategy === 'reverse';
            if (!(reverseOnly && previousSourceId)) return { pool: value, hit: true };
          }
        }
      } catch {
        /* Cache failures must not cause fabricated results. */
      }
    }
    const existing = inflight.get(key);
    if (existing) return { pool: await existing, hit: true };
    if (!deps.disableRateLimitForTests && now() - lastUpstream < 3000)
      throw new ApiError(429, '公共地图服务有查询频率限制，请稍后再试。', 'UPSTREAM_THROTTLE');
    lastUpstream = now();
    const pending =
      scope.countryCode === 'US'
        ? fetchUsWorkerPool(
            scope,
            context.request.signal,
            fetcher,
            now,
            count,
            random,
            deps.reverseSchedule,
          )
        : (reverseOnly ? fetchInternationalReverse : fetchInternationalPool)(
            scope,
            context.request.signal,
            fetcher,
            now,
            count,
            random,
            deps.reverseSchedule,
          );
    inflight.set(key, pending);
    try {
      const pool = await pending;
      if (cached.size >= MAX_MEMORY_KEYS) cached.delete(cached.keys().next().value!);
      const ttl = poolTtl(scope, pool);
      cached.set(key, { expires: now() + ttl, pool });
      if (edge) {
        const response = new Response(JSON.stringify(pool), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=' + Math.floor(ttl / 1000),
          },
        });
        try {
          context.waitUntil(edge.put(cacheKey, response));
        } catch {
          /* Cache is best effort, no configuration is necessary. */
        }
      }
      return { pool, hit: false };
    } finally {
      inflight.delete(key);
    }
  }
  return {
    catalog(context: AddressContext): Promise<Response> {
      if (context.request.method !== 'GET')
        return Promise.resolve(json({ error: 'Method not allowed' }, 405, { Allow: 'GET' }));
      return Promise.resolve(
        json({
          countries: publicCatalog(),
          ready: true,
          configurationMessage: '',
          turnstileSiteKey: '',
          maxCount: MAX_BATCH_SIZE,
          source:
            '© OpenStreetMap contributors（美国复用 worker.js 在线反查；其他地区使用 Overpass）',
        }),
      );
    },
    async generate(context: AddressContext): Promise<Response> {
      try {
        const req = context.request;
        if (req.method !== 'POST')
          return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
        const origin = req.headers.get('origin');
        if (
          (origin && origin !== new URL(req.url).origin) ||
          req.headers.get('sec-fetch-site') === 'cross-site'
        )
          throw new ApiError(403, '不允许跨站请求。', 'ORIGIN_DENIED');
        if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
          throw new ApiError(415, '请使用 JSON 请求。', 'CONTENT_TYPE');
        consume(`ip:${req.headers.get('CF-Connecting-IP') ?? 'local'}`, 6);
        const options = validateOptions(await readJsonLimited(req, 4096));
        const effectiveOptions =
          options.countryCode === 'US' && !options.regionCode && !options.cityId
            ? { ...options, regionCode: getRandomState(random) }
            : options;
        const scope = resolveScope(effectiveOptions, random);
        const { pool, hit } = await poolFor(
          context,
          scope,
          options.count,
          options.previousSourceId,
        );
        const profile =
          scope.countryCode === 'US' && options.includeContact
            ? await getUserData(scope.regionCode, context.request.signal, fetcher, random)
            : null;
        const results = sampleRecords(pool.records, options.count, random).map((record) => ({
          ...record,
          id: uuid(),
          createdAt: new Date(now()).toISOString(),
          // Real address data only; no invented names, email accounts or telephone numbers.
          recipient: profile?.recipient ?? '',
          gender: profile?.gender ?? '',
          email: '',
          phone: profile?.phone ?? '',
          contactKind: profile ? 'test' : 'none',
        }));
        const warnings: string[] = [];
        if (results.length < options.count) warnings.push('地图中可用的完整门牌记录少于请求数量。');
        if (!options.cityId) warnings.push('随机范围仅限内置城市查询中心附近，并非全国全部地址。');
        return json({
          records: results,
          warnings,
          cache: hit ? 'hit' : 'miss',
          queryArea: scope.queryArea,
        });
      } catch (error) {
        const e =
          error instanceof ApiError
            ? error
            : new ApiError(500, '地址服务暂时异常，请稍后再试。', 'INTERNAL_ERROR');
        return json(
          { error: e.message, code: e.code },
          e.status,
          e.status === 429 ? { 'Retry-After': '60' } : {},
        );
      }
    },
  };
}
export const addressService = createAddressService();
