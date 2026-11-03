import { isAddressRecord, isCountryCode, isObject } from '../shared/address';
import type { AddressCatalog, GenerateOptions, GenerateResult } from '../shared/types';
const API_ROOT = '/api/address';
async function readResponse(response: Response): Promise<unknown> {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(
      response.ok
        ? '在线地址服务暂未就绪，请稍后重试。'
        : '在线地址服务返回异常（HTTP ' + response.status + '），请稍后重试。',
    );
  }
  const value: unknown = await response.json();
  if (!response.ok) {
    const message =
      isObject(value) && typeof value.error === 'string' ? value.error : '地址服务暂时不可用。';
    throw new Error(message);
  }
  return value;
}
export async function loadCatalog(signal: AbortSignal): Promise<AddressCatalog> {
  const value = await readResponse(
    await fetch(`${API_ROOT}/catalog`, {
      signal,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }),
  );
  if (
    !isObject(value) ||
    !Array.isArray(value.countries) ||
    !value.countries.length ||
    typeof value.ready !== 'boolean' ||
    typeof value.configurationMessage !== 'string' ||
    typeof value.turnstileSiteKey !== 'string' ||
    typeof value.maxCount !== 'number' ||
    typeof value.source !== 'string'
  )
    throw new Error('地址目录响应格式不正确。');
  for (const country of value.countries as unknown[]) {
    if (
      !isObject(country) ||
      !isCountryCode(country.code) ||
      typeof country.name !== 'string' ||
      typeof country.englishName !== 'string' ||
      !Array.isArray(country.regions)
    )
      throw new Error('国家目录无效。');
    for (const region of country.regions as unknown[]) {
      if (
        !isObject(region) ||
        typeof region.code !== 'string' ||
        typeof region.name !== 'string' ||
        !Array.isArray(region.cities)
      )
        throw new Error('地区目录无效。');
      for (const city of region.cities as unknown[]) {
        if (!isObject(city) || typeof city.id !== 'string' || typeof city.name !== 'string')
          throw new Error('城市目录无效。');
      }
    }
  }
  return value as unknown as AddressCatalog;
}
export async function generateAddresses(
  options: GenerateOptions,
  signal: AbortSignal,
): Promise<GenerateResult> {
  const value = await readResponse(
    await fetch(`${API_ROOT}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(options),
      credentials: 'same-origin',
      signal,
    }),
  );
  if (
    !isObject(value) ||
    !Array.isArray(value.records) ||
    value.records.length > 5 ||
    !value.records.every(isAddressRecord) ||
    !Array.isArray(value.warnings) ||
    !value.warnings.every((item) => typeof item === 'string') ||
    !['hit', 'miss'].includes(String(value.cache)) ||
    typeof value.queryArea !== 'string'
  ) {
    throw new Error('地址响应格式不正确，未展示异常数据。');
  }
  return value as unknown as GenerateResult;
}
