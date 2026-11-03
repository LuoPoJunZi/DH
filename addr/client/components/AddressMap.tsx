import { ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AddressRecord } from '../../shared/types';
import { googleMapsUrl, googleMapPreviewUrl, sourceMapUrl } from '../../shared/address';

export function AddressMap({ record, index }: { record: AddressRecord; index: number }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!frameRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || state !== 'loading') return;
    const timer = window.setTimeout(() => setState('failed'), 15000);
    return () => window.clearTimeout(timer);
  }, [state, attempt, visible]);
  return (
    <aside className="ag-map-pane" aria-label="地址地图">
      <div className="ag-map-frame" ref={frameRef}>
        <iframe
          key={attempt}
          title={'第 ' + index + ' 条地址地图'}
          src={googleMapPreviewUrl(record)}
          loading="lazy"
          referrerPolicy="no-referrer"
          allowFullScreen
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
        />
        {state !== 'loaded' && (
          <div className="ag-map-status" role="status">
            <MapPin size={30} aria-hidden="true" />
            <strong>{state === 'loading' ? '正在加载地图…' : '地图暂时无法加载'}</strong>
            <span>
              {state === 'loading'
                ? '地址已就绪，可继续复制或保存'
                : '可重试，或在 Google 地图中打开'}
            </span>
            {state === 'failed' && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setState('loading');
                  setAttempt((value) => value + 1);
                }}
              >
                <RefreshCw size={15} />
                重试地图
              </button>
            )}
          </div>
        )}
        <a
          className="ag-map-open"
          href={googleMapsUrl(record)}
          target="_blank"
          rel="noopener noreferrer"
        >
          在 Google 地图中打开 <ExternalLink size={15} />
        </a>
      </div>
      <div className="ag-map-footer">
        <span title={'获取于 ' + new Date(record.retrievedAt).toLocaleString()}>
          {record.provider === 'photon'
            ? 'Photon'
            : record.provider === 'overpass'
              ? 'Overpass'
              : 'OpenStreetMap'}{' '}
          数据
        </span>
        <a href={googleMapsUrl(record)} target="_blank" rel="noopener noreferrer">
          Google 地图 <ExternalLink size={13} />
        </a>
        <a href={sourceMapUrl(record)} target="_blank" rel="noopener noreferrer">
          OpenStreetMap <ExternalLink size={13} />
        </a>
      </div>
    </aside>
  );
}
