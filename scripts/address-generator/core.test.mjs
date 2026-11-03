import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(
  new URL('../../output/playwright/address-online-unit/', import.meta.url),
);
const require = createRequire(import.meta.url);
const load = (file) => require(path.join(root, file));
const { publicCatalog, COUNTRY_SEEDS } = load('server/address/catalog.js');
const { resolveScope, normalizeOverpass, fetchMappedPool } = load('server/address/providers.js');
const { createAddressService, validateOptions } = load('server/address/service.js');
const {
  workerStates,
  getRandomState,
  getRandomLocationInState,
  formatAddress,
  normalizeWorkerAddress,
  fetchUsWorkerPool,
  getUserData,
} = load('server/address/us-worker.js');
const { isAddressRecord, googleMapsUrl, googleMapPreviewUrl } = load(
  'src/tools/other/address-generator/utils.js',
);
const { loadFavorites, saveFavorites, clearFavorites, STORAGE_KEY } = load(
  'src/tools/other/address-generator/storage.js',
);
const { serializeAddresses, csvCell } = load('src/tools/other/address-generator/export.js');
const { loadCatalog, generateAddresses } = load('src/tools/other/address-generator/api.js');
const NOW = Date.parse('2026-11-03T00:00:00Z');
const options = {
  countryCode: 'US',
  regionCode: 'AL',
  cityId: '',
  kind: 'building',
  count: 1,
  includeContact: false,
};
const scope = (overrides = {}) => resolveScope({ ...options, ...overrides }, () => 0);
function reverse(overrides = {}) {
  return {
    osm_type: 'way',
    osm_id: 12345,
    lat: '32.377716',
    lon: '-86.300568',
    address: {
      country_code: 'us',
      house_number: '10',
      road: 'Test Street',
      city: 'Fixture City',
      state: 'Fixture State',
      postcode: '00123',
    },
    ...overrides,
  };
}
function overpass(s = scope({ countryCode: 'GB', regionCode: 'ENG' }), tags = {}) {
  return {
    elements: [
      {
        type: 'node',
        id: 12345,
        lat: s.seed.latitude,
        lon: s.seed.longitude,
        tags: {
          'addr:housenumber': '10',
          'addr:street': 'Test Street',
          'addr:city': 'Fixture City',
          'addr:state': 'Fixture Region',
          'addr:postcode': '00123',
          'addr:country': s.countryCode,
          ...tags,
        },
      },
    ],
  };
}
function fakeService(extra = {}) {
  let sequence = 0;
  return createAddressService({
    now: () => NOW,
    uuid: () => 'record-' + ++sequence,
    random: () => 0,
    disableRateLimitForTests: true,
    disableEdgeCacheForTests: true,
    reverseSchedule: async () => {},
    fetcher: async (input) =>
      String(input).includes('nominatim') ? Response.json(reverse()) : Response.json(overpass()),
    ...extra,
  });
}
async function request(service, body = options, settings = {}) {
  const method = settings.method ?? 'POST';
  const response = await service.generate({
    request: new Request('https://tools.example.test/api/address/generate', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://tools.example.test',
        'CF-Connecting-IP': '192.0.2.1',
        ...settings.headers,
      },
      ...(method === 'GET' ? {} : { body: settings.raw ?? JSON.stringify(body) }),
    }),
    waitUntil: () => {},
  });
  return { response, data: await response.json() };
}
const sample = () => normalizeWorkerAddress(reverse(), scope(), () => NOW);
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}
test('owner worker data retains all 50 states and its random-coordinate formula', () => {
  assert.equal(workerStates.length, 50);
  assert.equal(
    getRandomState(() => 0),
    'AL',
  );
  assert.equal(
    getRandomState(() => 0.999),
    'WY',
  );
  const p = getRandomLocationInState('AL', () => 0);
  assert.equal(p.lat, 32.377716 - 0.05);
  assert.equal(p.lng, -86.300568 - 0.05);
  assert.equal(
    getRandomLocationInState('ZZ', () => 0),
    null,
  );
});
test('the online catalog contains query centres rather than a local address pool', () => {
  assert.equal(publicCatalog().length, 22);
  assert.equal(publicCatalog().find((item) => item.code === 'US').regions.length, 51);
  for (const country of COUNTRY_SEEDS)
    for (const city of country.cities) {
      assert.ok(Number.isFinite(city.latitude) && Number.isFinite(city.longitude));
      assert.equal('houseNumber' in city, false);
      assert.equal('street' in city, false);
    }
  assert.ok(!JSON.stringify(publicCatalog()).includes('latitude'));
});
test('US worker formatting preserves source street, city and leading-zero postcode', () => {
  const data = reverse();
  assert.equal(
    formatAddress(data.address, 'AL'),
    '10 Test Street, Fixture City, AL, 00123, United States',
  );
  assert.equal(formatAddress({ ...data.address, road: '' }, 'AL'), null);
  const result = sample();
  assert.equal(result.schemaVersion, 6);
  assert.equal(result.sourcePlaceId, 'way/12345');
  assert.equal(result.postalCode, '00123');
  assert.equal(result.verified, false);
  assert.equal(isAddressRecord(result), true);
});
test('missing address data is never replaced with a generated street or postcode', () => {
  const data = reverse();
  data.address.postcode = '';
  const record = normalizeWorkerAddress(data, scope(), () => NOW);
  assert.equal(record.postalCode, '');
  assert.equal(record.postalCodeStatus, 'missing');
  assert.ok(!record.fullAddress.includes('undefined'));
  for (const field of ['house_number', 'road', 'city']) {
    assert.equal(
      normalizeWorkerAddress(
        reverse({ address: { ...reverse().address, [field]: '' } }),
        scope(),
        () => NOW,
      ),
      null,
    );
  }
  assert.equal(
    normalizeWorkerAddress(
      reverse({ address: { ...reverse().address, country_code: 'gb' } }),
      scope(),
      () => NOW,
    ),
    null,
  );
});
test('US generation calls the owner worker reverse endpoint and retries only missing records', async () => {
  const calls = [];
  const pool = await fetchUsWorkerPool(
    scope(),
    new AbortController().signal,
    async (input) => {
      calls.push(String(input));
      return Response.json(calls.length === 1 ? {} : reverse());
    },
    () => NOW,
    1,
    () => 0,
    async () => {},
  );
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.startsWith('https://nominatim.openstreetmap.org/reverse?')));
  assert.ok(calls[0].includes('addressdetails=1'));
  assert.equal(pool.records.length, 1);
  assert.equal(pool.records[0].houseNumber, '10');
});
test('US lookup stops on throttling and returns no simulated fallback when empty', async () => {
  await assert.rejects(
    () =>
      fetchUsWorkerPool(
        scope(),
        new AbortController().signal,
        async () => new Response('', { status: 429 }),
        () => NOW,
        1,
        () => 0,
        async () => {},
      ),
    (error) => error.status === 429,
  );
  await assert.rejects(
    () =>
      fetchUsWorkerPool(
        scope(),
        new AbortController().signal,
        async () => Response.json({}),
        () => NOW,
        1,
        () => 0,
        async () => {},
      ),
    (error) => error.code === 'NO_RESULTS',
  );
});
test('US optional test profiles reuse the worker fallback independently of addresses', async () => {
  const result = await getUserData(
    'AL',
    new AbortController().signal,
    async () => new Response('', { status: 503 }),
    () => 0,
  );
  assert.equal(result.recipient, 'James Smith');
  assert.equal(result.gender, 'Unknown');
  assert.match(result.phone, /^\(205\) 200-1000$/);
});
test('international results use only real OSM object tags; missing city and region stay empty', () => {
  const s = scope({ countryCode: 'GB', regionCode: 'ENG' });
  const record = normalizeOverpass(
    overpass(s, { 'addr:city': '', 'addr:state': '', 'addr:postcode': '' }),
    s,
    () => NOW,
  ).records[0];
  assert.equal(record.city, '');
  assert.equal(record.region, '');
  assert.equal(record.postalCode, '');
  assert.equal(record.houseNumber, '10');
  assert.equal(record.contactKind, 'none');
  assert.ok(isAddressRecord(record));
});
test('international querying POSTs a bounded request to Overpass', async () => {
  let captured;
  const s = scope({ countryCode: 'GB', regionCode: 'ENG' });
  const result = await fetchMappedPool(
    s,
    new AbortController().signal,
    async (url, opts) => {
      captured = { url, opts };
      return Response.json(overpass(s));
    },
    () => NOW,
  );
  assert.equal(captured.url, 'https://overpass-api.de/api/interpreter');
  assert.equal(captured.opts.method, 'POST');
  assert.ok(captured.opts.body.includes('data='));
  assert.equal(result.records.length, 1);
});
test('Japanese address blocks come from actual tags', () => {
  const s = scope({ countryCode: 'JP', regionCode: '13', cityId: 'jp-tokyo' });
  const record = normalizeOverpass(
    overpass(s, {
      'addr:street': '',
      'addr:neighbourhood': 'テスト地区',
      'addr:block_number': '1',
      'addr:housenumber': '3',
    }),
    s,
    () => NOW,
  ).records[0];
  assert.equal(record.addressLine1, 'テスト地区 1 3');
  assert.equal(record.street, '');
  assert.ok(isAddressRecord(record));
});
test('API validation rejects mismatched selectors, unexpected keys and invalid counts', () => {
  assert.deepEqual(validateOptions(options), options);
  for (const changed of [
    { countryCode: 'ZZ' },
    { count: 0 },
    { count: 6 },
    { count: '1' },
    { unexpected: true },
  ])
    assert.throws(() => validateOptions({ ...options, ...changed }));
  assert.throws(() => scope({ countryCode: 'JP', regionCode: 'AL' }));
});
test('catalog is ready without keys, bindings or environment variables', async () => {
  const response = await fakeService().catalog({
    request: new Request('https://tools.example.test/api/address/catalog'),
    waitUntil: () => {},
  });
  const data = await response.json();
  assert.equal(data.ready, true);
  assert.equal(data.configurationMessage, '');
  assert.equal(data.countries.length, 22);
});
test('US API uses reverse data and a short cache rather than local addresses', async () => {
  let calls = 0,
    at = NOW;
  const service = fakeService({
    now: () => at,
    fetcher: async () => {
      calls++;
      return Response.json(reverse());
    },
  });
  const a = await request(service),
    b = await request(service);
  assert.equal(a.response.status, 200);
  assert.equal(a.data.cache, 'miss');
  assert.equal(b.data.cache, 'hit');
  assert.equal(calls, 1);
  at += 31000;
  assert.equal((await request(service)).response.status, 200);
  assert.equal(calls, 2);
  assert.equal(a.data.records[0].recipient, '');
  assert.equal(a.data.records[0].contactKind, 'none');
});
test('optional test contact fields never change the real address record', async () => {
  const service = fakeService({
    fetcher: async (input) =>
      String(input).includes('randomuser')
        ? Response.json({
            results: [{ name: { first: 'Example', last: 'Person' }, gender: 'female' }],
          })
        : Response.json(reverse()),
  });
  const result = await request(service, { ...options, includeContact: true });
  assert.equal(result.response.status, 200);
  assert.equal(result.data.records[0].recipient, 'Example Person');
  assert.equal(result.data.records[0].contactKind, 'test');
  assert.equal(result.data.records[0].addressLine1, '10 Test Street');
  assert.equal(result.data.records[0].verified, false);
});
test('international API errors fail with no local or synthetic address fallback', async () => {
  const body = { ...options, countryCode: 'GB', regionCode: 'ENG' };
  for (const [status, expected] of [
    [429, 429],
    [503, 503],
    [504, 503],
    [500, 502],
  ]) {
    const result = await request(
      fakeService({ fetcher: async () => new Response('', { status }) }),
      body,
    );
    assert.equal(result.response.status, expected);
    assert.equal('records' in result.data, false);
  }
  assert.equal(
    (await request(fakeService({ fetcher: async () => Response.json({ elements: [] }) }), body))
      .response.status,
    404,
  );
  assert.equal(
    (await request(fakeService({ fetcher: async () => new Response('<html>') }), body)).response
      .status,
    502,
  );
});
test('request boundaries reject cross-origin, MIME, invalid JSON and oversized input', async () => {
  assert.equal((await request(fakeService(), options, { method: 'GET' })).response.status, 405);
  assert.equal(
    (await request(fakeService(), options, { headers: { Origin: 'https://other.example' } }))
      .response.status,
    403,
  );
  assert.equal(
    (await request(fakeService(), options, { headers: { 'Content-Type': 'text/plain' } })).response
      .status,
    415,
  );
  assert.equal((await request(fakeService(), options, { raw: 'bad' })).response.status, 400);
  assert.equal(
    (await request(fakeService(), options, { raw: 'x'.repeat(5000) })).response.status,
    413,
  );
});
test('IP limit applies to cached clicks as well as fresh source requests', async () => {
  const service = fakeService({ disableRateLimitForTests: false });
  for (let index = 0; index < 6; index++)
    assert.equal((await request(service)).response.status, 200);
  assert.equal((await request(service)).response.status, 429);
});
test('Google links only form queries; no verified-address claim or Google API call is made', () => {
  const record = sample();
  const query = new URL(googleMapsUrl(record));
  assert.equal(query.hostname, 'www.google.com');
  assert.equal(query.searchParams.get('api'), '1');
  assert.equal(query.searchParams.get('query'), record.fullAddress);
  assert.equal(new URL(googleMapPreviewUrl(record)).searchParams.get('output'), 'embed');
  assert.equal(record.verified, false);
});
test('favorites round trip notes without treating old static records as online records', () => {
  const mem = storage(),
    record = { ...sample(), id: 'record-one' };
  const entry = { record, note: '地址备注', savedAt: new Date(NOW).toISOString() };
  assert.equal(saveFavorites([entry], mem), '');
  assert.deepEqual(loadFavorites(mem).entries, [entry]);
  assert.ok(saveFavorites([entry, entry], mem));
  assert.match(STORAGE_KEY, /v6/);
  assert.equal(clearFavorites(mem), '');
  assert.deepEqual(loadFavorites(mem).entries, []);
  mem.setItem(STORAGE_KEY, '{broken');
  assert.ok(loadFavorites(mem).warning);
});
test('exports preserve source, leading zero and CSV formula protection', () => {
  const entry = { record: { ...sample(), id: 'record-one' }, note: '=SUM(1,2)' };
  const json = JSON.parse(serializeAddresses([entry], 'json'));
  assert.equal(json.schemaVersion, 6);
  assert.equal(json.records[0].postalCode, '00123');
  assert.equal(json.verified, false);
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.ok(serializeAddresses([entry], 'csv').startsWith('\uFEFF'));
  assert.ok(serializeAddresses([entry], 'txt').includes('OpenStreetMap'));
  assert.throws(() => serializeAddresses([], 'json'));
});

test('requesting a new US address refreshes the online source instead of reusing the last snapshot', async () => {
  let calls = 0;
  const service = fakeService({
    fetcher: async () => {
      calls++;
      return Response.json(reverse());
    },
  });
  const first = await request(service);
  const next = await request(service, {
    ...options,
    previousSourceId: first.data.records[0].sourcePlaceId,
  });
  assert.equal(next.response.status, 200);
  assert.equal(next.data.cache, 'miss');
  assert.equal(calls, 2);
  assert.throws(() => validateOptions({ ...options, previousSourceId: 'https://other.example/' }));
});

test('US network and gateway errors are not reported as missing map addresses', async () => {
  const gateway = await request(
    fakeService({ fetcher: async () => new Response('', { status: 502 }) }),
  );
  assert.equal(gateway.response.status, 503);
  assert.equal(gateway.data.code, 'UPSTREAM_UNAVAILABLE');
  let calls = 0;
  const unavailable = await request(
    fakeService({
      fetcher: async () => {
        calls++;
        throw new Error('network');
      },
    }),
  );
  assert.equal(calls, 3);
  assert.equal(unavailable.response.status, 502);
  assert.equal(unavailable.data.code, 'UPSTREAM_NETWORK');
  assert.equal('records' in unavailable.data, false);
});

test('all upstream providers use redirect modes supported by workerd', async () => {
  const hosts = [];
  const service = fakeService({
    fetcher: async (input, init) => {
      if (init.redirect === 'error')
        throw new TypeError('Invalid redirect value: workerd supports follow or manual');
      assert.equal(init.redirect, 'manual');
      const host = new URL(input).hostname;
      hosts.push(host);
      if (host === 'randomuser.me')
        return Response.json({
          results: [{ name: { first: 'Example', last: 'Person' }, gender: 'female' }],
        });
      return Response.json(host.includes('nominatim') ? reverse() : overpass());
    },
  });
  assert.equal((await request(service, { ...options, includeContact: true })).response.status, 200);
  assert.equal(
    (await request(service, { ...options, countryCode: 'GB', regionCode: 'ENG' })).response.status,
    200,
  );
  assert.deepEqual(hosts, ['nominatim.openstreetmap.org', 'randomuser.me', 'overpass-api.de']);
});

test('redirected map responses stop without following another host or inventing results', async () => {
  for (const changed of [{}, { countryCode: 'GB', regionCode: 'ENG' }]) {
    let calls = 0;
    const result = await request(
      fakeService({
        fetcher: async () => {
          calls++;
          return new Response('', { status: 302, headers: { Location: 'https://other.example/' } });
        },
      }),
      { ...options, ...changed },
    );
    assert.equal(calls, 1);
    assert.equal(result.response.status, 503);
    assert.equal(result.data.code, 'UPSTREAM_REDIRECT');
    assert.equal('records' in result.data, false);
  }
});

test('client reports gateway HTML separately from an undeployed API', async () => {
  const original = globalThis.fetch;
  try {
    for (const status of [502, 503]) {
      globalThis.fetch = async () =>
        new Response('<html>gateway error</html>', {
          status,
          headers: { 'Content-Type': 'text/html' },
        });
      await assert.rejects(
        () => generateAddresses(options, new AbortController().signal),
        new RegExp('HTTP ' + status),
      );
      await assert.rejects(
        () => loadCatalog(new AbortController().signal),
        new RegExp('HTTP ' + status),
      );
    }
    globalThis.fetch = async () =>
      new Response('<html>SPA fallback</html>', { headers: { 'Content-Type': 'text/html' } });
    await assert.rejects(() => loadCatalog(new AbortController().signal), /暂未就绪/);
    globalThis.fetch = async () => Response.json({ error: '上游服务暂时限流' }, { status: 429 });
    await assert.rejects(
      () => generateAddresses(options, new AbortController().signal),
      /上游服务暂时限流/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('country catalog bypasses stale browser responses after deployment', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(input, '/api/address/catalog');
      assert.equal(init.cache, 'no-store');
      assert.equal(init.headers.Accept, 'application/json');
      return fakeService().catalog({
        request: new Request('https://tools.example.test/api/address/catalog'),
        waitUntil: () => {},
      });
    };
    assert.equal((await loadCatalog(new AbortController().signal)).countries.length, 22);
  } finally {
    globalThis.fetch = original;
  }
});
