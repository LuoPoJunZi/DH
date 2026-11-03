// Adapted from the owner-supplied address module and worker.js; see LICENSE.
import { Bookmark, Check, Copy, ExternalLink, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AddressRecord } from '../types';
import { MAX_NOTE_LENGTH } from '../storage';
import { googleMapsUrl, googleMapPreviewUrl, sourceMapUrl } from '../utils';

interface Props {
  record: AddressRecord;
  index: number;
  saved: boolean;
  note?: string;
  showNote?: boolean;
  onCopy: (text: string) => void;
  onSave?: () => void;
  onRemove?: () => void;
  onNote?: (note: string) => void;
}
interface AddressField {
  label: string;
  value: string;
  wide?: boolean;
  empty?: string;
}
export function AddressCard({
  record,
  index,
  saved,
  note = '',
  showNote = false,
  onCopy,
  onSave,
  onRemove,
  onNote,
}: Props) {
  const [draftNote, setDraftNote] = useState(note);
  const [showMap, setShowMap] = useState(false);
  const names = record.recipient.split(' ').filter(Boolean);
  const fields: AddressField[] = [
    { label: '名字（测试）', value: names[0] ?? '' },
    { label: '姓氏（测试）', value: names.slice(1).join(' ') },
    { label: '性别（测试）', value: record.gender },
    { label: '电话（测试）', value: record.phone },
    { label: '街道地址', value: record.addressLine1, wide: true },
    { label: '城市 / 区', value: record.city, empty: '地图未提供' },
    { label: '州 / 省 / 地区', value: record.region, empty: '地图未提供' },
    {
      label: '邮政编码',
      value: record.postalCode,
      empty: record.postalCodeStatus === 'not-used' ? '不使用邮编' : '地图未提供',
    },
    { label: '国家 / 地区', value: record.countryNameEn },
  ];
  return (
    <article className="ag-card">
      <div className="ag-record-heading">
        <span>
          {String(index).padStart(2, '0')} · {record.countryName}{' '}
          {record.city && '/ ' + record.city}
        </span>
        {onRemove ? (
          <button
            className="ag-icon"
            type="button"
            onClick={onRemove}
            aria-label={'删除第 ' + index + ' 条收藏'}
          >
            <Trash2 size={17} />
          </button>
        ) : (
          <button
            className="ag-icon"
            type="button"
            onClick={onSave}
            disabled={saved}
            aria-label={saved ? '第 ' + index + ' 条已收藏' : '收藏第 ' + index + ' 条地址'}
          >
            {saved ? <Check size={17} /> : <Bookmark size={17} />}
          </button>
        )}
      </div>
      <dl className="ag-fields">
        {fields.map((field) => (
          <div className={'ag-field' + (field.wide ? ' ag-field--wide' : '')} key={field.label}>
            <div>
              <dt>{field.label}</dt>
              <dd>{field.value || field.empty || '—'}</dd>
            </div>
            <button
              className="ag-icon"
              type="button"
              disabled={!field.value}
              aria-label={'复制第 ' + index + ' 条' + field.label}
              onClick={() => onCopy(field.value)}
            >
              <Copy size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </dl>
      <div className="ag-full-address">
        <div>
          <span>完整地址</span>
          <p>{record.fullAddress}</p>
        </div>
        <button
          className="ag-icon"
          type="button"
          aria-label={'复制第 ' + index + ' 条完整地址'}
          onClick={() => onCopy(record.fullAddress)}
        >
          <Copy size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="ag-map-actions">
        <a
          className="button button--primary"
          href={googleMapsUrl(record)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={16} aria-hidden="true" />
          Google Maps 查询
        </a>
        <button
          className="button button--secondary"
          type="button"
          aria-expanded={showMap}
          aria-controls={'ag-map-' + record.id}
          onClick={() => setShowMap((value) => !value)}
        >
          {showMap ? '收起地图' : '地图预览'}
        </button>
        <a
          className="ag-source-link"
          href={sourceMapUrl(record)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={14} aria-hidden="true" />
          查看开放地图原始记录
        </a>
      </div>
      {showMap && (
        <div className="ag-map-frame" id={'ag-map-' + record.id}>
          <iframe
            title={'第 ' + index + ' 条地址的地图预览'}
            src={googleMapPreviewUrl(record)}
            loading="lazy"
            referrerPolicy="no-referrer"
            allowFullScreen
          />
          <p>预览不可用时，可使用上方 Google Maps 查询入口。</p>
        </div>
      )}
      <p className="ag-source">
        在线获取：
        <time dateTime={record.retrievedAt}>
          {new Date(record.retrievedAt).toLocaleString()}
        </time> · {record.source}
      </p>
      {record.contactKind === 'test' && (
        <p className="ag-record-note">姓名、性别和电话是独立测试资料，与地址住户无关。</p>
      )}
      {record.warnings.length > 0 && <p className="ag-record-note">{record.warnings.join(' ')}</p>}
      {showNote && (
        <div className="ag-note-row">
          <label className="field" htmlFor={'ag-note-' + record.id}>
            <span className="field__label">本地备注（最多 {MAX_NOTE_LENGTH} 字）</span>
            <input
              id={'ag-note-' + record.id}
              value={draftNote}
              maxLength={MAX_NOTE_LENGTH}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="给这条地址添加备注"
            />
          </label>
          <button
            className="button button--secondary"
            type="button"
            disabled={draftNote === note}
            onClick={() => onNote?.(draftNote)}
          >
            保存备注
          </button>
        </div>
      )}
    </article>
  );
}
