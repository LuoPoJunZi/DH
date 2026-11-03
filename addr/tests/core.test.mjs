import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url),
  root = fileURLToPath(
    new URL('../../output/playwright/address-module-unit/addr/', import.meta.url),
  );
const load = (file) => require(path.join(root, file));
const { createAddressService, validateOptions } = load('server/service.js');
const { resolveScope, toAddressRecord } = load('server/adapter.js');
const { publicCatalog } = load('data/catalog.js');
const { normalizeParts, formatAddress, buildHongKongVersions } = load('worker.js');
const { isAddressRecord, googleMapsUrl, googleMapPreviewUrl } = load('shared/address.js');
const { loadFavorites, saveFavorites, clearFavorites, STORAGE_KEY } = load('client/storage.js');
const { serializeAddresses, csvCell } = load('client/export.js');
const { loadCatalog, generateAddresses } = load('client/api.js');
const NOW = Date.parse('2026-11-03T00:00:00Z');
const options = {
  countryCode: 'US',
  regionCode: 'AL',
  cityId: '',
  kind: 'residential',
  count: 1,
  includeContact: false,
  taxFree: false,
};
function feature(id = 101, extra = {}) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-86.8104, 33.5186] },
    properties: {
      osm_type: 'W',
      osm_id: id,
      osm_key: 'building',
      osm_value: 'house',
      countrycode: 'US',
      housenumber: String(id),
      street: 'Fixture Road',
      city: 'Fixture City',
      state: 'Alabama',
      postcode: '00123',
      ...extra,
    },
  };
}
const features = () => [
  feature(101),
  feature(102),
  feature(103, { osm_key: 'shop', osm_value: 'clothes', name: 'Fixture Shop' }),
  feature(104, { osm_value: 'yes' }),
  feature(105, { housenumber: '101' }),
];
function service(extra = {}) {
  let id = 0;
  return createAddressService({
    now: () => NOW,
    random: () => 0,
    uuid: () => 'record-' + ++id,
    disableRateLimitForTests: true,
    disableEdgeCacheForTests: true,
    fetcher: async () => Response.json({ features: features() }),
    ...extra,
  });
}
async function request(s, body = options, changes = {}) {
  const req = new Request('https://tools.example.test/api/address/generate', {
    method: changes.method ?? 'POST',
    signal: changes.signal,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://tools.example.test',
      ...changes.headers,
    },
    ...((changes.method ?? 'POST') === 'POST' ? { body: changes.raw ?? JSON.stringify(body) } : {}),
  });
  const response = await s.generate({ request: req, waitUntil: () => {} });
  return { response, data: await response.json() };
}
async function sample() {
  return (await request(service())).data.records[0];
}
function memory() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}

test('catalog preserves existing destinations and includes all reference countries', () => {
  const data = publicCatalog();
  assert.equal(data.length, 30);
  assert.equal(data.find((c) => c.code === 'US').regions.length, 51);
  for (const c of ['BR', 'RU', 'SA', 'ID', 'SG', 'NL'])
    assert.ok(data.some((item) => item.code === c));
  assert.equal('latitude' in data[0].regions[0].cities[0], false);
});
test('residential filtering and source fields reach the API without invented data', async () => {
  const result = await request(service());
  assert.equal(result.response.status, 200);
  const r = result.data.records[0];
  assert.ok(isAddressRecord(r));
  assert.equal(r.provider, 'photon');
  assert.equal(r.addressType, 'residential');
  assert.equal(r.postalCode, '00123');
  assert.equal(r.verified, false);
  assert.equal(r.city, 'Fixture City');
});
test('a cached candidate pool serves another address without another public query', async () => {
  let calls = 0;
  const s = service({
    fetcher: async () => {
      calls++;
      return Response.json({ features: features() });
    },
  });
  const a = await request(s);
  const b = await request(s, { ...options, previousSourceId: a.data.records[0].sourcePlaceId });
  assert.equal(calls, 1);
  assert.equal(a.data.cache, 'miss');
  assert.equal(b.data.cache, 'hit');
  assert.notEqual(a.data.records[0].sourcePlaceId, b.data.records[0].sourcePlaceId);
  assert.notEqual(a.data.records[0].fullAddress, b.data.records[0].fullAddress);
});
test('commercial selection has its own cache and never receives a residential record', async () => {
  const s = service();
  await request(s);
  const result = await request(s, { ...options, kind: 'commercial' });
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].addressType, 'commercial');
  assert.equal(result.data.records[0].placeName, 'Fixture Shop');
});
test('all upstream fetches use a Cloudflare-supported redirect mode and house-level lookup', async () => {
  let captured;
  const result = await request(
    service({
      fetcher: async (url, init) => {
        captured = { url: new URL(url), init };
        assert.equal(init.redirect, 'manual');
        return Response.json({ features: features() });
      },
    }),
  );
  assert.equal(result.response.status, 200);
  assert.equal(captured.url.hostname, 'photon.komoot.io');
  assert.equal(captured.url.searchParams.get('layer'), 'house');
  assert.equal(captured.url.searchParams.get('limit'), '50');
  assert.ok(captured.init.headers['User-Agent'].includes('LUOPO'));
});
test('broken Photon falls back to Overpass data instead of fabricated addresses', async () => {
  const result = await request(
    service({
      fetcher: async (url) => {
        if (String(url).includes('photon')) return new Response('', { status: 503 });
        return Response.json({
          elements: [
            {
              type: 'way',
              id: 901,
              center: { lat: 33.5186, lon: -86.8104 },
              tags: {
                building: 'house',
                'addr:country': 'US',
                'addr:housenumber': '7',
                'addr:street': 'Source Street',
                'addr:city': 'Source City',
                'addr:state': 'Alabama',
                'addr:postcode': '00123',
              },
            },
          ],
        });
      },
    }),
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].provider, 'overpass');
  assert.equal(result.data.records[0].addressLine1, '7 Source Street');
});
test('empty or malformed upstream responses fail without local address fallback', async () => {
  for (const fetcher of [
    async () => Response.json({ features: [] }),
    async () => new Response('<html>gateway</html>'),
    async () => new Response('', { status: 503 }),
  ]) {
    const r = await request(service({ fetcher }));
    assert.equal(r.response.status, 503);
    assert.equal('records' in r.data, false);
  }
});
test('wrong country, missing house and non-address objects are never selected', async () => {
  for (const properties of [
    { countrycode: 'CA' },
    { housenumber: '' },
    { osm_key: 'highway', osm_value: 'bus_stop' },
  ]) {
    const r = await request(
      service({ fetcher: async () => Response.json({ features: [feature(201, properties)] }) }),
      { ...options, kind: 'any' },
    );
    assert.equal(r.response.status, 503);
    assert.equal('records' in r.data, false);
  }
});
test('missing city stays empty and carries a data warning', async () => {
  const result = await request(
    service({
      fetcher: async () => Response.json({ features: [feature(201, { city: undefined })] }),
    }),
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].city, '');
  assert.ok(result.data.records[0].warnings.some((w) => w.includes('城市')));
});
test('optional profiles never issue a third-party profile request', async () => {
  const hosts = [];
  const result = await request(
    service({
      fetcher: async (url) => {
        hosts.push(new URL(url).hostname);
        return Response.json({ features: features() });
      },
    }),
    { ...options, includeContact: true },
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].contactKind, 'test');
  assert.ok(result.data.records[0].recipient);
  assert.deepEqual(hosts, ['photon.komoot.io']);
});
test('tax-state mode rejects impossible selectors and requires returned state to match', async () => {
  assert.throws(() => resolveScope({ ...options, taxFree: true }));
  const result = await request(
    service({ fetcher: async () => Response.json({ features: [feature(201)] }) }),
    { ...options, regionCode: 'OR', taxFree: true },
  );
  assert.equal(result.response.status, 503);
});
test('tax-state metadata is based on the returned Oregon state', async () => {
  const result = await request(
    service({
      fetcher: async () =>
        Response.json({
          features: [
            {
              ...feature(201, { state: 'Oregon' }),
              geometry: { type: 'Point', coordinates: [-122.6765, 45.5231] },
            },
          ],
        }),
    }),
    { ...options, regionCode: 'OR', taxFree: true },
  );
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].taxFree.code, 'OR');
});
test('record adapter rejects invalid OSM ids, coordinates and mismatched countries', () => {
  const s = resolveScope(options, () => 0);
  const candidate = {
    parts: {
      houseNumber: '1',
      street: 'Fixture Road',
      city: 'Fixture City',
      state: 'Alabama',
      postcode: '00123',
    },
    countryCode: 'US',
    kind: 'residential',
    category: 'building=house',
    placeName: '',
    lat: 33.5186,
    lng: -86.8104,
    osmUrl: 'https://www.openstreetmap.org/way/123',
  };
  assert.ok(toAddressRecord(candidate, s, 'photon', () => NOW));
  for (const c of [
    { ...candidate, osmUrl: 'https://other.example/123' },
    { ...candidate, lat: NaN },
    { ...candidate, countryCode: 'CA' },
    { ...candidate, parts: { ...candidate.parts, houseNumber: '' } },
  ])
    assert.equal(
      toAddressRecord(c, s, 'photon', () => NOW),
      null,
    );
});
test('reference formatting handles Japanese blocks, Chinese order and British postcode', () => {
  const jp = normalizeParts('JP', {
    state: '東京都',
    city: '渋谷区',
    locality: '広尾五丁目',
    street: '2',
    houseNumber: '18',
    postcode: '150-0012',
  });
  assert.ok(formatAddress('JP', jp).includes('広尾五丁目2-18'));
  assert.equal(
    formatAddress('CN', {
      state: '四川省',
      city: '成都市',
      cityDistrict: '金牛区',
      street: '二环路',
      houseNumber: '114',
    }),
    '四川省成都市金牛区二环路114号',
  );
  assert.ok(
    formatAddress('UK', {
      street: 'Source Road',
      houseNumber: '1',
      city: 'London',
      postcode: 'SW1A 1AA',
    }).includes('SW1A 1AA'),
  );
});
test('Hong Kong language versions never invent an untranslated street', () => {
  const found = {
    parts: {
      houseNumber: '10',
      street: '彌敦道 Nathan Road',
      locality: '旺角 Mong Kok',
      district: '油尖旺區 Yau Tsim Mong',
    },
    placeName: '',
  };
  const versions = buildHongKongVersions(found);
  assert.ok(versions.en.address.includes('Nathan Road'));
  assert.ok(versions.zh.address.includes('彌敦道'));
  assert.equal(
    buildHongKongVersions({ ...found, parts: { ...found.parts, street: '彌敦道' } }).en,
    null,
  );
});
test('input and origin boundaries remain enforced', async () => {
  for (const [changes, status] of [
    [{ method: 'GET' }, 405],
    [{ headers: { Origin: 'https://other.example' } }, 403],
    [{ headers: { 'Content-Type': 'text/plain' } }, 415],
    [{ raw: 'bad json' }, 400],
    [{ raw: 'x'.repeat(5000) }, 413],
  ])
    assert.equal((await request(service(), options, changes)).response.status, status);
  for (const body of [
    { ...options, count: 0 },
    { ...options, count: 6 },
    { ...options, countryCode: 'ZZ' },
    { ...options, kind: 'unknown' },
    { ...options, countryCode: 'GB', taxFree: true },
  ])
    assert.throws(() => validateOptions(body));
  assert.equal(validateOptions({ ...options, kind: 'building' }).kind, 'any');
});
test('catalog does not need bindings or a dashboard configuration', async () => {
  const r = await service().catalog({
    request: new Request('https://tools.example.test/api/address/catalog'),
    waitUntil: () => {},
  });
  const data = await r.json();
  assert.equal(data.ready, true);
  assert.equal(data.configurationMessage, '');
});
test('old v6 favorites without new metadata still round trip with notes', async () => {
  const record = await sample();
  for (const key of ['provider', 'category', 'addressType', 'placeName']) delete record[key];
  const entry = { record, note: 'existing note', savedAt: new Date(NOW).toISOString() },
    store = memory();
  assert.equal(saveFavorites([entry], store), '');
  assert.deepEqual(loadFavorites(store).entries, [entry]);
  assert.match(STORAGE_KEY, /v6$/);
  assert.equal(clearFavorites(store), '');
});
test('export keeps leading-zero postcodes, raw source and spreadsheet formula protection', async () => {
  const entry = { record: await sample(), note: '=SUM(1,2)' };
  const value = JSON.parse(serializeAddresses([entry], 'json'));
  assert.equal(value.records[0].postalCode, '00123');
  assert.equal(value.records[0].verified, false);
  assert.ok(serializeAddresses([entry], 'csv').startsWith('\uFEFF'));
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.ok(serializeAddresses([entry], 'txt').includes('OpenStreetMap'));
});
test('Google links are queries rather than verification claims', async () => {
  const record = await sample();
  assert.equal(new URL(googleMapsUrl(record)).searchParams.get('query'), record.fullAddress);
  assert.equal(new URL(googleMapPreviewUrl(record)).searchParams.get('output'), 'embed');
  assert.equal(record.verified, false);
});
test('client distinguishes gateway HTML and bypasses stale catalog cache', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('<html>gateway</html>', { status: 502 });
    await assert.rejects(
      () => generateAddresses(options, new AbortController().signal),
      /HTTP 502/,
    );
    globalThis.fetch = async (input, init) => {
      assert.equal(init.cache, 'no-store');
      return service().catalog({
        request: new Request('https://tools.example.test/api/address/catalog'),
        waitUntil: () => {},
      });
    };
    assert.equal((await loadCatalog(new AbortController().signal)).countries.length, 30);
  } finally {
    globalThis.fetch = original;
  }
});

test(
  'cancellation stops the active source without launching fallback queries',
  { timeout: 1000 },
  async () => {
    const controller = new AbortController();
    let started;
    const ready = new Promise((resolve) => (started = resolve));
    let calls = 0,
      sourceSignal;
    const pending = request(
      service({
        fetcher: async (url, init) => {
          calls++;
          sourceSignal = init.signal;
          started();
          return new Promise((resolve, reject) =>
            init.signal.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            ),
          );
        },
      }),
      options,
      { signal: controller.signal },
    );
    await ready;
    controller.abort();
    const result = await pending;
    assert.equal(result.response.status, 503);
    assert.equal(sourceSignal.aborted, true);
    assert.equal(calls, 1);
    assert.equal('records' in result.data, false);
  },
);
