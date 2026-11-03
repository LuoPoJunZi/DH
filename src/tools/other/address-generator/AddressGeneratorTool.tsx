// Adapted from the owner-supplied online module; see LICENSE.
import {
  Bookmark,
  Copy,
  Download,
  Globe2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { useCopy } from '../../../hooks/useCopy';
import { addressLinks } from '../../../config/address-generator';
import { AddressCard } from './components/AddressCard';
import { generateAddresses, loadCatalog } from './api';
import { downloadAddresses, serializeAddresses } from './export';
import { clearFavorites, loadFavorites, MAX_FAVORITES, saveFavorites } from './storage';
import type {
  AddressCatalog,
  AddressRecord,
  CountryCode,
  ExportEntry,
  ExportFormat,
  SavedAddress,
} from './types';
import { addressKey, DATA_NOTICE, isCountryCode } from './utils';
import './address-generator.css';

const PAGE_SIZE = 10;
const QUICK_COUNTRIES: CountryCode[] = ['US', 'HK', 'GB', 'JP', 'CA', 'SG'];
export default function AddressGeneratorTool() {
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [regionCode, setRegionCode] = useState('');
  const [cityId, setCityId] = useState('');
  const [includeContact, setIncludeContact] = useState(true);
  const [catalog, setCatalog] = useState<AddressCatalog | null>(null);
  const [retry, setRetry] = useState(0);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const [records, setRecords] = useState<AddressRecord[]>([]);
  const [initialFavorites] = useState(() => loadFavorites());
  const [favorites, setFavorites] = useState<SavedAddress[]>(initialFavorites.entries);
  const [message, setMessage] = useState(initialFavorites.warning);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'results' | 'favorites'>('results');
  const [page, setPage] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);
  const { copy, status } = useCopy();
  const country = catalog?.countries.find((item) => item.code === countryCode);
  const cityOptions = (country?.regions ?? [])
    .filter((region) => !regionCode || region.code === regionCode)
    .flatMap((region) => region.cities);
  const favoriteKeys = useMemo(
    () => new Set(favorites.map((entry) => addressKey(entry.record))),
    [favorites],
  );
  const entries: ExportEntry[] =
    tab === 'results' ? records.map((record) => ({ record })) : favorites;
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    setError('');
    void loadCatalog(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setCatalog(value);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : '国家目录暂不可用，请稍后重试。');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(
    () => () => {
      requestId.current++;
      requestRef.current?.abort();
    },
    [],
  );
  const reset = () => {
    setRecords([]);
    setPage(1);
    setError('');
    setMessage('');
    setConfirmClear(false);
  };
  const chooseCountry = (value: CountryCode) => {
    setCountryCode(value);
    setRegionCode('');
    setCityId('');
    reset();
    setTab('results');
  };
  const generate = async () => {
    if (busy || !catalog?.ready) return;
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    const id = ++requestId.current;
    const timer = window.setTimeout(() => controller.abort(), 45000);
    setBusy(true);
    setRecords([]);
    setTab('results');
    setPage(1);
    setConfirmClear(false);
    setError('');
    setMessage('正在从开放地图获取地址…');
    try {
      const result = await generateAddresses(
        {
          countryCode,
          regionCode,
          cityId: countryCode === 'US' ? '' : cityId,
          kind: 'building',
          count: 1,
          includeContact: countryCode === 'US' && includeContact,
          previousSourceId: records[0]?.sourcePlaceId,
        },
        controller.signal,
      );
      if (id !== requestId.current) return;
      setRecords(result.records);
      setMessage('已获取 ' + result.records.length + ' 条地址。' + result.warnings.join(' '));
    } catch (cause) {
      if (id !== requestId.current) return;
      setError(
        controller.signal.aborted
          ? '本次获取已取消或超时，请重试。'
          : cause instanceof Error
            ? cause.message
            : '在线地址获取失败，请重试。',
      );
      setMessage('');
    } finally {
      window.clearTimeout(timer);
      if (id === requestId.current) {
        setBusy(false);
        requestRef.current = null;
      }
    }
  };
  const cancel = () => {
    requestId.current++;
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    setMessage('已取消获取。');
  };
  const persist = (next: SavedAddress[], success: string) => {
    const failure = saveFavorites(next);
    if (failure) {
      setError(failure);
      return;
    }
    setFavorites(next);
    setMessage(success);
    setError('');
  };
  const save = (record: AddressRecord) => {
    if (favoriteKeys.has(addressKey(record))) return;
    if (favorites.length >= MAX_FAVORITES) {
      setError('收藏已达 100 条，请先导出或删除部分记录。');
      return;
    }
    persist(
      [{ record, note: '', savedAt: new Date().toISOString() }, ...favorites],
      '已保存到当前浏览器。',
    );
  };
  const exportData = (format: ExportFormat) => {
    try {
      downloadAddresses(entries, format);
      setMessage('已导出 ' + entries.length + ' 条记录。');
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导出失败。');
    }
  };
  const copyAll = () => {
    try {
      void copy(serializeAddresses(entries, 'txt'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '复制失败。');
    }
  };
  const clear = () => {
    const failure = clearFavorites();
    if (failure) {
      setError(failure);
      return;
    }
    setFavorites([]);
    setConfirmClear(false);
    setPage(1);
    setMessage('已清空本工具收藏。');
    setError('');
  };
  return (
    <ToolWorkspace mode="online">
      <div className="ag-root">
        <nav className="ag-country-nav" aria-label="地址生成国家快捷入口">
          {QUICK_COUNTRIES.map((code) => {
            const option = catalog?.countries.find((item) => item.code === code);
            return (
              <button
                type="button"
                key={code}
                disabled={busy || !catalog}
                aria-pressed={countryCode === code}
                onClick={() => chooseCountry(code)}
              >
                {option?.name ?? code}地址
              </button>
            );
          })}
          <label className="ag-more-country" htmlFor="ag-country">
            <span>更多国家 / 地区</span>
            <select
              id="ag-country"
              value={countryCode}
              disabled={busy || !catalog}
              onChange={(event) => {
                if (isCountryCode(event.target.value)) chooseCountry(event.target.value);
              }}
            >
              {(catalog?.countries ?? []).map((item) => (
                <option value={item.code} key={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </nav>
        <div className="ag-generator">
          <header className="ag-hero">
            <div className="ag-hero-copy">
              <p className="ag-kicker">在线地址生成</p>
              <h1>
                <span>{country?.name ?? '美国'}地址</span>生成器
              </h1>
              <p>在线获取开放地图中已有的门牌地址，支持复制、保存与导出。</p>
              <div className="ag-hero-features">
                <span>
                  <Globe2 size={16} />
                  开放地图数据
                </span>
                <span>
                  <ShieldCheck size={16} />
                  无需账户
                </span>
              </div>
            </div>
            <div className="ag-controls" aria-label="地址生成选项">
              <label className="field" htmlFor="ag-region">
                <span className="field__label">
                  {countryCode === 'US' ? '选择州' : '选择州 / 省 / 地区'}
                </span>
                <select
                  id="ag-region"
                  value={regionCode}
                  disabled={busy || !country}
                  onChange={(event) => {
                    setRegionCode(event.target.value);
                    setCityId('');
                    reset();
                  }}
                >
                  <option value="">{countryCode === 'US' ? '随机州' : '随机所列地区'}</option>
                  {(country?.regions ?? []).map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name} ({region.code})
                    </option>
                  ))}
                </select>
              </label>
              {countryCode !== 'US' && (
                <label className="field" htmlFor="ag-city">
                  <span className="field__label">参考城市</span>
                  <select
                    id="ag-city"
                    value={cityId}
                    disabled={busy || !cityOptions.length}
                    onChange={(event) => {
                      setCityId(event.target.value);
                      reset();
                    }}
                  >
                    <option value="">随机所列城市</option>
                    {cityOptions.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {countryCode === 'US' && (
                <label className="ag-contact-option">
                  <input
                    type="checkbox"
                    checked={includeContact}
                    disabled={busy}
                    onChange={(event) => setIncludeContact(event.target.checked)}
                  />
                  <span>附带姓名、性别和电话测试资料</span>
                </label>
              )}
              <ActionButton
                className="ag-generate"
                variant="primary"
                icon={RefreshCw}
                busy={busy}
                disabled={!catalog?.ready}
                onClick={() => {
                  void generate();
                }}
              >
                {busy ? '正在生成…' : '生成地址'}
              </ActionButton>
              {busy && <ActionButton onClick={cancel}>取消获取</ActionButton>}
              {!catalog && (
                <div className="ag-catalog-status" role="status">
                  <span>{catalogLoading ? '正在加载国家目录…' : '国家目录暂不可用'}</span>
                  <ActionButton
                    disabled={catalogLoading}
                    onClick={() => setRetry((value) => value + 1)}
                  >
                    重试
                  </ActionButton>
                </div>
              )}
            </div>
          </header>
          <section className="ag-output" aria-label="生成与收藏结果">
            <div className="ag-output-heading">
              <div className="ag-tabs" role="group" aria-label="结果视图">
                <button
                  type="button"
                  aria-pressed={tab === 'results'}
                  onClick={() => {
                    setTab('results');
                    setPage(1);
                    setConfirmClear(false);
                  }}
                >
                  生成结果
                </button>
                <button
                  type="button"
                  aria-pressed={tab === 'favorites'}
                  onClick={() => {
                    setTab('favorites');
                    setPage(1);
                    setConfirmClear(false);
                  }}
                >
                  <Bookmark size={16} />
                  已保存 <span>{favorites.length}</span>
                </button>
              </div>
              <div className="ag-output-actions">
                <ActionButton icon={Copy} disabled={!entries.length} onClick={copyAll}>
                  复制全部
                </ActionButton>
                {tab === 'results' && (
                  <ActionButton
                    icon={Bookmark}
                    variant="primary"
                    disabled={!records[0] || favoriteKeys.has(addressKey(records[0]))}
                    onClick={() => {
                      if (records[0]) save(records[0]);
                    }}
                  >
                    保存地址
                  </ActionButton>
                )}
              </div>
            </div>
            <p className="ag-feedback" role="status" aria-live="polite">
              {status === 'copied'
                ? '已复制。'
                : status === 'error'
                  ? '复制失败，请手动复制。'
                  : message}
            </p>
            {error && (
              <p className="ag-error" role="alert">
                {error}
              </p>
            )}
            {entries.length === 0 ? (
              <div className="ag-empty">
                <MapPin size={34} aria-hidden="true" />
                <h2>{tab === 'results' ? '尚未生成地址' : '还没有保存的地址'}</h2>
                <p>
                  {tab === 'results'
                    ? '选择国家和地区，点击生成地址。查询不到地图门牌时会给出提示。'
                    : '生成后保存需要的地址，随时添加备注或导出。'}
                </p>
              </div>
            ) : (
              <div className="ag-results">
                {visible.map((entry, index) => (
                  <AddressCard
                    key={entry.record.id}
                    record={entry.record}
                    index={(currentPage - 1) * PAGE_SIZE + index + 1}
                    saved={favoriteKeys.has(addressKey(entry.record))}
                    onCopy={(text) => {
                      void copy(text);
                    }}
                    onSave={() => save(entry.record)}
                    note={entry.note}
                    showNote={tab === 'favorites'}
                    onRemove={
                      tab === 'favorites'
                        ? () =>
                            persist(
                              favorites.filter((item) => item.record.id !== entry.record.id),
                              '已删除收藏。',
                            )
                        : undefined
                    }
                    onNote={
                      tab === 'favorites'
                        ? (note) =>
                            persist(
                              favorites.map((item) =>
                                item.record.id === entry.record.id ? { ...item, note } : item,
                              ),
                              '备注已保存。',
                            )
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
            <div className="ag-export-bar">
              <span>导出当前{tab === 'results' ? '结果' : '收藏'}</span>
              {(['csv', 'json', 'txt'] as const).map((format) => (
                <ActionButton
                  key={format}
                  icon={format === 'csv' ? Download : undefined}
                  disabled={!entries.length}
                  onClick={() => exportData(format)}
                >
                  {format.toUpperCase()}
                </ActionButton>
              ))}
              {tab === 'favorites' ? (
                <ActionButton
                  variant="quiet"
                  icon={Trash2}
                  disabled={!favorites.length && !initialFavorites.warning}
                  onClick={() => setConfirmClear(true)}
                >
                  清空收藏
                </ActionButton>
              ) : (
                <ActionButton variant="quiet" disabled={!records.length || busy} onClick={reset}>
                  清空结果
                </ActionButton>
              )}
            </div>
            {confirmClear && (
              <div className="ag-confirm" role="alert">
                <span>确定清空本工具全部收藏？</span>
                <ActionButton variant="danger" onClick={clear}>
                  确定清空
                </ActionButton>
                <ActionButton onClick={() => setConfirmClear(false)}>取消</ActionButton>
              </div>
            )}
            {pageCount > 1 && (
              <nav className="ag-pagination" aria-label="收藏分页">
                <ActionButton disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  上一页
                </ActionButton>
                <span>
                  第 {currentPage} / {pageCount} 页
                </span>
                <ActionButton
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  下一页
                </ActionButton>
              </nav>
            )}
          </section>
        </div>
        <p className="ag-data-note">
          {DATA_NOTICE}{' '}
          <a href={addressLinks.copyright} target="_blank" rel="noopener noreferrer">
            © OpenStreetMap contributors
          </a>
        </p>
      </div>
    </ToolWorkspace>
  );
}
