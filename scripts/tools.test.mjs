import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../output/playwright/tools-unit/src/', import.meta.url));
const load = (file) => require(path.join(root, file));

const { processJson, jsonSample } = load('tools/developer/json-formatter/utils.js');
const { encodeBase64, decodeBase64 } = load('tools/developer/base64/utils.js');
const { encodeUrlComponent, decodeUrlComponent } = load('tools/developer/url-codec/utils.js');
const { parseTimestamp } = load('tools/developer/timestamp/utils.js');
const { createUuidV4, generateUuids } = load('tools/developer/uuid-generator/utils.js');
const { countText, wordCounterSample } = load('tools/text/word-counter/utils.js');
const { deduplicateLines } = load('tools/text/text-deduplicator/utils.js');
const { parseBigIntWithBase, convertRadix } = load('tools/converter/radix-converter/utils.js');
const { parseWeatherData, isCurrentWeather, parseStockQuotes, parseCryptoQuotes } = load(
  'utils/navigationWidgetData.js',
);

test('json-formatter formats, minifies, validates and guards invalid or oversized input', () => {
  const formatted = processJson('{"a":1,"b":[2,3]}', 'format-2');
  assert.equal(formatted.output, '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  assert.equal(processJson(formatted.output, 'minify').output, '{"a":1,"b":[2,3]}');
  assert.equal(processJson(jsonSample, 'validate').output, jsonSample);
  assert.throws(() => processJson('   ', 'format-2'), /请输入/);
  assert.throws(() => processJson('{bad}', 'format-2'), /JSON 格式错误/);
  assert.throws(() => processJson('a'.repeat(2_000_001), 'validate'), /超过 2 MB/);
});

test('base64 preserves Unicode, accepts URL-safe unpadded input, and rejects invalid UTF-8', () => {
  const text = '你好，LUOPO Tools 🚀';
  const encoded = encodeBase64(text);
  assert.equal(decodeBase64(encoded), text);
  const urlSafe = encoded.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  assert.equal(decodeBase64(` ${urlSafe}\n`), text);
  assert.throws(() => encodeBase64(''), /请输入/);
  assert.throws(() => decodeBase64('a'), /无效/);
  // 0xFF 0xFE is not valid UTF-8
  assert.throws(() => decodeBase64('//4='), /无效/);
});

test('url-codec follows standard URI component rules and preserves literal plus signs', () => {
  const original = 'a+b=中文 & 100%';
  const encoded = encodeUrlComponent(original);
  assert.equal(encoded, 'a%2Bb%3D%E4%B8%AD%E6%96%87%20%26%20100%25');
  assert.equal(decodeUrlComponent(encoded), original);
  assert.equal(decodeUrlComponent('a+b'), 'a+b');
  assert.throws(() => decodeUrlComponent('%E0%A4%A'), /无效/);
});

test('timestamp auto-detects seconds and milliseconds and rejects invalid values', () => {
  const fromSeconds = parseTimestamp('1724238000');
  assert.equal(fromSeconds.seconds, 1724238000);
  assert.equal(fromSeconds.milliseconds, 1724238000000);
  assert.equal(fromSeconds.iso, '2024-08-21T11:00:00.000Z');

  const fromMs = parseTimestamp('1724238000123');
  assert.equal(fromMs.seconds, 1724238000);
  assert.equal(fromMs.milliseconds, 1724238000123);

  const negative = parseTimestamp('-86400');
  assert.equal(negative.iso, '1969-12-31T00:00:00.000Z');

  assert.throws(() => parseTimestamp('12.34'), /整数/);
  assert.throws(() => parseTimestamp('99999999999999999999'), /安全处理/);
});

test('uuid-generator produces valid v4 UUIDs and respects formatting and count bounds', () => {
  const single = createUuidV4();
  assert.match(single, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

  const upperCompact = generateUuids(3, true, false);
  assert.equal(upperCompact.length, 3);
  assert.ok(upperCompact.every((id) => /^[0-9A-F]{32}$/.test(id)));

  assert.equal(generateUuids(0, false, true).length, 1);
  assert.equal(generateUuids(500, false, true).length, 100);
});

test('word-counter counts CJK, Latin words, Unicode code points, lines and paragraphs', () => {
  const empty = countText('');
  assert.deepEqual(empty, {
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    chineseCharacters: 0,
    lines: 0,
    paragraphs: 0,
    readingMinutes: 0,
  });

  const stats = countText('你好 world 🚀\n\n第二段');
  assert.equal(stats.chineseCharacters, 5);
  assert.equal(stats.words, 6);
  assert.equal(stats.characters, 15);
  assert.equal(stats.lines, 3);
  assert.equal(stats.paragraphs, 2);
  assert.equal(stats.readingMinutes, 1);
  assert.ok(countText(wordCounterSample).words > 0);
});

test('text-deduplicator preserves order and honors ignoreCase, trimWhitespace and removeEmpty', () => {
  const input = 'Apple\n apple \n\nBanana\nAPPLE';
  const result = deduplicateLines(input, {
    ignoreCase: true,
    trimWhitespace: true,
    removeEmpty: true,
  });
  assert.equal(result.output, 'Apple\nBanana');
  assert.equal(result.inputLines, 5);
  assert.equal(result.outputLines, 2);
  assert.equal(result.removedLines, 3);
  assert.throws(
    () => deduplicateLines('', { ignoreCase: false, trimWhitespace: false, removeEmpty: false }),
    /请输入/,
  );
});

test('radix-converter supports BigInt, leading +/- signs, and rejects invalid or huge inputs', () => {
  assert.equal(convertRadix('ff', 16, 10), '255');
  assert.equal(convertRadix('+1010', 2, 10), '10');
  assert.equal(convertRadix('-255', 10, 16), '-ff');
  assert.equal(
    parseBigIntWithBase('ffffffffffffffffffffffff', 16).toString(10),
    '79228162514264337593543950335',
  );
  assert.throws(() => convertRadix('2', 2, 10), /不是 2 进制/);
  assert.throws(() => convertRadix('1'.repeat(10_001), 10, 16), /超过 10,000 位/);
});

test('navigationWidgetData parses weather, stock and crypto payloads strictly', () => {
  const weather = parseWeatherData({
    current: {
      temperature_2m: 22.5,
      apparent_temperature: 21.8,
      weather_code: 1,
      is_day: 1,
    },
    daily: {
      time: ['2026-11-22', 'bad-date', '2026-11-23'],
      temperature_2m_min: [15, 10, 20],
      temperature_2m_max: [24, 18, 18],
      weather_code: [1, 2, 3],
    },
  });
  assert.ok(weather);
  assert.equal(isCurrentWeather(weather), true);
  assert.equal(weather.forecast.length, 1);
  assert.equal(weather.forecast[0]?.date, '2026-11-22');
  assert.equal(parseWeatherData({ current: { temperature_2m: 'NaN' } }), null);

  const stockPayload = [
    'v_usIXIC="200~纳斯达克~IXIC~19000.50~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~2026-11-22 04:00:00~0~1.25";',
    'v_sh000001="1~上证指数~000001~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~2026-11-22~0~-0.50";',
  ].join('\n');
  const stocks = parseStockQuotes(stockPayload);
  assert.equal(stocks.length, 1);
  assert.equal(stocks[0]?.id, 'nasdaq');
  assert.equal(stocks[0]?.price, 19000.5);

  const crypto = parseCryptoQuotes([
    {
      symbol: 'BTCUSDT',
      lastPrice: '98000.12',
      priceChangePercent: '2.34',
      closeTime: 1763779200000,
    },
    { symbol: 'ETHUSDT', lastPrice: '-1', priceChangePercent: '0', closeTime: 1763779200000 },
  ]);
  assert.equal(crypto.length, 1);
  assert.equal(crypto[0]?.id, 'btc');
  assert.equal(crypto[0]?.marketTime, '2025-11-22T02:40:00.000Z');
});
