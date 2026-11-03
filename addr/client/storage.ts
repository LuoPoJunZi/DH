import { addressKey, isAddressRecord } from '../shared/address';
import type { SavedAddress } from '../shared/types';

export const STORAGE_KEY = 'luopo-tools.address-generator.online-favorites.v6';
export const MAX_FAVORITES = 100;
export const MAX_NOTE_LENGTH = 160;
const MAX_STORAGE_CHARS = 2_000_000;
export interface StoragePort {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
export interface FavoritesLoadResult {
  entries: SavedAddress[];
  warning: string;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSavedAddress(value: unknown): value is SavedAddress {
  return (
    object(value) &&
    isAddressRecord(value.record) &&
    typeof value.note === 'string' &&
    value.note.length <= MAX_NOTE_LENGTH &&
    typeof value.savedAt === 'string' &&
    Number.isFinite(Date.parse(value.savedAt))
  );
}

function browserStorage(): StoragePort {
  if (typeof window === 'undefined') throw new Error('Storage unavailable');
  return window.localStorage;
}

export function loadFavorites(storage?: StoragePort): FavoritesLoadResult {
  try {
    const raw = (storage ?? browserStorage()).getItem(STORAGE_KEY);
    if (!raw) return { entries: [], warning: '' };
    if (raw.length > MAX_STORAGE_CHARS) throw new Error('Storage is too large');
    const parsed: unknown = JSON.parse(raw);
    if (!object(parsed) || parsed.version !== 6 || !Array.isArray(parsed.entries)) {
      throw new Error('Invalid storage envelope');
    }
    const entries: SavedAddress[] = [];
    const seen = new Set<string>();
    const ids = new Set<string>();
    for (const value of parsed.entries as unknown[]) {
      if (!isSavedAddress(value)) continue;
      const key = addressKey(value.record);
      if (seen.has(key) || ids.has(value.record.id) || entries.length >= MAX_FAVORITES) continue;
      seen.add(key);
      ids.add(value.record.id);
      entries.push(value);
    }
    return {
      entries,
      warning:
        entries.length === parsed.entries.length
          ? ''
          : '部分本地收藏格式异常或重复，已忽略；原始存储未自动覆盖。',
    };
  } catch {
    return { entries: [], warning: '本地收藏不可读取或格式异常；仍可生成和导出地址。' };
  }
}

export function saveFavorites(entries: readonly SavedAddress[], storage?: StoragePort): string {
  try {
    if (entries.length > MAX_FAVORITES || !entries.every(isSavedAddress)) {
      return '收藏内容无效，或已超过 100 条上限。';
    }
    const seen = new Set(entries.map((entry) => addressKey(entry.record)));
    const ids = new Set(entries.map((entry) => entry.record.id));
    if (seen.size !== entries.length || ids.size !== entries.length) return '收藏中存在重复记录。';
    (storage ?? browserStorage()).setItem(STORAGE_KEY, JSON.stringify({ version: 6, entries }));
    return '';
  } catch {
    return '保存失败：浏览器可能禁用了本地存储或空间不足。请先导出备份。';
  }
}

export function clearFavorites(storage?: StoragePort): string {
  try {
    (storage ?? browserStorage()).removeItem(STORAGE_KEY);
    return '';
  } catch {
    return '清空失败：浏览器未允许修改本地存储。';
  }
}
