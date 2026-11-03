import site from '../../src/config/site.data.json';
import {
  findRealAddress,
  getRandomName,
  getRandomPhoneNumber,
  pickUsAreaCodes,
} from '../worker.js';
import { publicCatalog } from '../data/catalog';
import {
  addressKey,
  isAddressRecord,
  isCountryCode,
  isObject,
  MAX_BATCH_SIZE,
} from '../shared/address';
import type { AddressRecord, GenerateOptions, GenerateResult } from '../shared/types';
import { resolveScope, toAddressRecord, upstreamCountry, type Scope } from './adapter';
import { ApiError, json, readJsonLimited, type AddressContext } from './runtime';
interface Dependencies {
  fetcher?: typeof fetch;
  now?: () => number;
  random?: () => number;
  uuid?: () => string;
  disableRateLimitForTests?: boolean;
  disableEdgeCacheForTests?: boolean;
}
interface Pool {
  records: AddressRecord[];
  retrievedAt: number;
}
interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<unknown>;
}
const TTL = 300000,
  MAX_KEYS = 40;
export function validateOptions(value: unknown): GenerateOptions {
  const allowed = [
    'countryCode',
    'regionCode',
    'cityId',
    'kind',
    'count',
    'includeContact',
    'previousSourceId',
    'taxFree',
  ];
  if (
    !isObject(value) ||
    Object.keys(value).some((k) => !allowed.includes(k)) ||
    !isCountryCode(value.countryCode) ||
    typeof value.regionCode !== 'string' ||
    value.regionCode.length > 24 ||
    typeof value.cityId !== 'string' ||
    value.cityId.length > 80 ||
    !['any', 'residential', 'commercial', 'building'].includes(String(value.kind)) ||
    !Number.isInteger(value.count) ||
    (value.count as number) < 1 ||
    (value.count as number) > MAX_BATCH_SIZE ||
    typeof value.includeContact !== 'boolean' ||
    (value.taxFree !== undefined && typeof value.taxFree !== 'boolean') ||
    (value.taxFree && value.countryCode !== 'US') ||
    (value.previousSourceId !== undefined &&
      (typeof value.previousSourceId !== 'string' ||
        !/^(node|way|relation)\/[1-9]\d{0,17}$/.test(value.previousSourceId)))
  )
    throw new ApiError(400, '请选择有效的国家、地区和地址类型。', 'INVALID_OPTIONS');
  return {
    ...value,
    kind: value.kind === 'building' ? 'any' : value.kind,
    taxFree: value.taxFree ?? false,
  } as unknown as GenerateOptions;
}
export function sampleRecords(
  records: readonly AddressRecord[],
  count: number,
  random: () => number = Math.random,
  previous?: string,
): AddressRecord[] {
  const candidates =
    records.length > 1 ? records.filter((r) => r.sourcePlaceId !== previous) : records.slice();
  const shuffled = candidates.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, count);
}
function isPool(value: unknown): value is Pool {
  return (
    isObject(value) &&
    Array.isArray(value.records) &&
    value.records.length > 0 &&
    value.records.length <= 50 &&
    value.records.every(isAddressRecord) &&
    typeof value.retrievedAt === 'number'
  );
}
export function createAddressService(deps: Dependencies = {}) {
  const fetcher = deps.fetcher ?? fetch,
    now = deps.now ?? Date.now,
    random = deps.random ?? Math.random,
    uuid = deps.uuid ?? (() => crypto.randomUUID());
  const memory = new Map<string, { pool: Pool; expires: number }>(),
    inflight = new Map<string, Promise<Pool>>(),
    buckets = new Map<string, { start: number; count: number }>();
  function consume(req: Request) {
    if (deps.disableRateLimitForTests) return;
    const at = now();
    for (const [id, b] of buckets) if (at - b.start > 60000) buckets.delete(id);
    const id = req.headers.get('CF-Connecting-IP') ?? 'local',
      b = buckets.get(id) ?? { start: at, count: 0 };
    if (b.count >= 30 || buckets.size > 2000)
      throw new ApiError(429, '操作过于频繁，请稍后重试。', 'RATE_LIMIT');
    b.count++;
    buckets.set(id, b);
  }
  async function poolFor(
    context: AddressContext,
    scope: Scope,
    options: GenerateOptions,
  ): Promise<{ pool: Pool; hit: boolean }> {
    const key = [scope.seed.id, options.kind, options.taxFree ? 'tax' : 'all'].join('-');
    const usable = (p: Pool) =>
      p.retrievedAt > now() - TTL &&
      !(p.records.length === 1 && p.records[0]?.sourcePlaceId === options.previousSourceId);
    const local = memory.get(key);
    if (local && local.expires > now() && usable(local.pool))
      return { pool: local.pool, hit: true };
    const edge = deps.disableEdgeCacheForTests
      ? undefined
      : (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default;
    const cacheKey = new Request(
      new URL('/api/address/_candidate-cache/v7/' + encodeURIComponent(key), context.request.url),
    );
    if (edge)
      try {
        const hit = await edge.match(cacheKey);
        if (hit?.ok) {
          const data = await readJsonLimited(hit, 700000);
          if (isPool(data) && usable(data)) {
            memory.set(key, { pool: data, expires: data.retrievedAt + TTL });
            return { pool: data, hit: true };
          }
        }
      } catch {
        /* Public cache is best effort. */
      }
    const existing = inflight.get(key);
    if (existing) return { pool: await existing, hit: true };
    const pending = (async () => {
      const found = await findRealAddress(upstreamCountry(scope.countryCode), options.kind, {
        taxFree: options.taxFree,
        stateCode:
          scope.countryCode === 'US' && options.regionCode ? options.regionCode : undefined,
        seed: { lat: scope.seed.latitude, lng: scope.seed.longitude, state: scope.seed.regionCode },
        userAgent: site.shortName + ' (' + site.url + ')',
        fetcher,
        random,
        signal: context.request.signal,
      });
      const seen = new Set<string>();
      const records: AddressRecord[] = [];
      for (const candidate of found.candidates ?? [found]) {
        const r = toAddressRecord(candidate, scope, found.source, now);
        const key = r ? addressKey(r) : '';
        if (r && !seen.has(key)) {
          seen.add(key);
          records.push(r);
        }
        if (records.length >= 50) break;
      }
      if (!records.length)
        throw new ApiError(
          503,
          '地图未返回带有效门牌和道路的地址，请更换城市或类型。',
          'NO_RESULTS',
        );
      const pool = { records, retrievedAt: now() };
      if (memory.size >= MAX_KEYS) memory.delete(memory.keys().next().value!);
      memory.set(key, { pool, expires: now() + TTL });
      if (edge)
        try {
          context.waitUntil(
            edge.put(
              cacheKey,
              new Response(JSON.stringify(pool), {
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'public, max-age=300',
                },
              }),
            ),
          );
        } catch {
          /* Cache failure does not replace online data. */
        }
      return pool;
    })();
    inflight.set(key, pending);
    try {
      return { pool: await pending, hit: false };
    } finally {
      inflight.delete(key);
    }
  }
  return {
    catalog(context: AddressContext): Promise<Response> {
      return Promise.resolve(
        context.request.method === 'GET'
          ? json({
              countries: publicCatalog(),
              ready: true,
              configurationMessage: '',
              turnstileSiteKey: '',
              maxCount: MAX_BATCH_SIZE,
              source: '© OpenStreetMap contributors · Photon / Overpass',
            })
          : json({ error: 'Method not allowed' }, 405, { Allow: 'GET' }),
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
        if (!req.headers.get('content-type')?.startsWith('application/json'))
          throw new ApiError(415, '请使用 JSON 请求。', 'CONTENT_TYPE');
        consume(req);
        const options = validateOptions(await readJsonLimited(req, 4096)),
          scope = resolveScope(options, random);
        const { pool, hit } = await poolFor(context, scope, options);
        const upstream = upstreamCountry(scope.countryCode);
        const records = sampleRecords(
          pool.records,
          options.count,
          random,
          options.previousSourceId,
        ).map((record) => {
          const recipient = options.includeContact ? getRandomName(upstream) : null;
          return {
            ...record,
            id: uuid(),
            createdAt: new Date(now()).toISOString(),
            recipient: recipient ?? '',
            gender: recipient ? (random() > 0.5 ? 'Male' : 'Female') : '',
            phone: recipient
              ? getRandomPhoneNumber(
                  upstream,
                  scope.countryCode === 'US'
                    ? pickUsAreaCodes(undefined, record.regionCode)
                    : undefined,
                )
              : '',
            contactKind: recipient ? ('test' as const) : ('none' as const),
          };
        });
        const result: GenerateResult = {
          records,
          cache: hit ? 'hit' : 'miss',
          queryArea: scope.queryArea,
          warnings: records.length < options.count ? ['地图可用门牌数量少于请求数量。'] : [],
        };
        return json(result);
      } catch (error) {
        const e =
          error instanceof ApiError
            ? error
            : new ApiError(
                503,
                '地图暂时未找到符合条件的地址，请重试或更换地区。',
                'UPSTREAM_UNAVAILABLE',
              );
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
