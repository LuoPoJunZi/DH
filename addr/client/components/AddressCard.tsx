import { Bookmark, Check, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AddressRecord } from '../../shared/types';
import { MAX_NOTE_LENGTH } from '../storage';
import { serializeAddresses } from '../export';
import { AddressMap } from './AddressMap';

interface Props {
  record: AddressRecord;
  index: number;
  saved: boolean;
  note?: string;
  onCopy: (text: string) => void;
  onSave?: (note: string) => void;
  onRemove?: () => void;
  onNote?: (note: string) => void;
}
const TYPE_NAMES = {
  residential: '住宅',
  commercial: '商业',
  public: '公共设施',
  unspecified: '用途未标注',
};

function AddressFields({
  fields,
  index,
  onCopy,
}: {
  fields: string[][];
  index: number;
  onCopy: (text: string) => void;
}) {
  return (
    <dl className="ag-fields">
      {fields.map(([label, value]) => (
        <div className="ag-field" key={label}>
          <dt>{label}</dt>
          <dd>{value || '地图未提供'}</dd>
          <button
            className="ag-icon ag-field-copy"
            type="button"
            disabled={!value || value === '地图未提供' || value === '不使用邮编'}
            aria-label={'复制第 ' + index + ' 条' + label}
            onClick={() => onCopy(value ?? '')}
          >
            <Copy size={14} />
          </button>
        </div>
      ))}
    </dl>
  );
}

export function AddressCard({
  record,
  index,
  saved,
  note = '',
  onCopy,
  onSave,
  onRemove,
  onNote,
}: Props) {
  const [draftNote, setDraftNote] = useState(note);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const address = record.localized?.[language] || record.fullAddress;
  const displayed = { ...record, fullAddress: address };
  const fields = [
    ['门牌号', record.houseNumber],
    ['街道 / 町丁目', record.street],
    ['城市', record.city],
    ['州 / 省', [record.region, record.regionCode].filter(Boolean).join(' · ')],
    [
      '邮政编码',
      record.postalCode || (record.postalCodeStatus === 'not-used' ? '不使用邮编' : '地图未提供'),
    ],
    ...(record.district ? [['区 / 县', record.district]] : []),
    ['国家 / 地区', record.countryNameEn],
  ];
  const saveNote = () => {
    if (onNote) onNote(draftNote);
    else onSave?.(draftNote);
  };
  return (
    <article className="ag-card">
      <div className="ag-address-layout">
        <div className="ag-label-pane">
          <div className="ag-record-heading">
            <span className="ag-type">
              {record.addressType ? TYPE_NAMES[record.addressType] : '地图地址'}
            </span>
            {record.taxFree && <span className="ag-tax-pill">免税州 · {record.taxFree.code}</span>}
            <span className="ag-place-name">
              {record.placeName || record.city || record.countryName}
            </span>
            <button
              className="ag-icon"
              type="button"
              disabled={!onRemove && saved}
              aria-label={
                onRemove
                  ? '删除第 ' + index + ' 条收藏'
                  : saved
                    ? '第 ' + index + ' 条已收藏'
                    : '收藏第 ' + index + ' 条地址'
              }
              onClick={onRemove ?? (() => onSave?.(draftNote))}
            >
              {onRemove ? (
                <Trash2 size={17} />
              ) : saved ? (
                <Check size={17} />
              ) : (
                <Bookmark size={17} />
              )}
            </button>
          </div>
          <div className="ag-full-address">
            <h2>{address}</h2>
            <p className="ag-coordinates">
              {Math.abs(record.latitude).toFixed(5)}° {record.latitude >= 0 ? 'N' : 'S'}&nbsp;
              {Math.abs(record.longitude).toFixed(5)}° {record.longitude >= 0 ? 'E' : 'W'}
              <span>OSM {record.sourcePlaceId}</span>
            </p>
            {record.taxFree && (
              <p className="ag-tax-note">
                {record.taxFree.name}：{record.taxFree.note}
              </p>
            )}
            <div className="ag-copy-actions">
              <button
                className="button button--secondary"
                type="button"
                onClick={() => onCopy(address)}
              >
                <Copy size={15} />
                复制地址
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() =>
                  onCopy(serializeAddresses([{ record: displayed, note: draftNote }], 'txt'))
                }
              >
                <Copy size={15} />
                复制全部信息
              </button>
              {record.localized?.en && record.localized.zh && (
                <div className="ag-language" aria-label="完整地址语言">
                  <button
                    type="button"
                    aria-pressed={language === 'en'}
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    aria-pressed={language === 'zh'}
                    onClick={() => setLanguage('zh')}
                  >
                    繁體中文
                  </button>
                </div>
              )}
            </div>
          </div>
          <h3 className="ag-detail-title">地址明细</h3>
          <AddressFields fields={fields} index={index} onCopy={onCopy} />
          {record.contactKind === 'test' && (
            <>
              <h3 className="ag-detail-title">测试资料</h3>
              <AddressFields
                fields={[
                  ['姓名（测试）', record.recipient],
                  ['性别（测试）', record.gender],
                  ['电话（测试）', record.phone],
                ]}
                index={index}
                onCopy={onCopy}
              />
              <p className="ag-record-note">随机姓名与电话，与真实住户无关。</p>
            </>
          )}
          {record.warnings.length > 0 && (
            <p className="ag-record-note">{record.warnings.join(' ')}</p>
          )}
          <form
            className="ag-note-row"
            onSubmit={(event) => {
              event.preventDefault();
              saveNote();
            }}
          >
            <label className="field" htmlFor={'ag-note-' + record.id}>
              <span className="sr-only">备注（最多 {MAX_NOTE_LENGTH} 字）</span>
              <input
                id={'ag-note-' + record.id}
                value={draftNote}
                maxLength={MAX_NOTE_LENGTH}
                disabled={!onNote && saved}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="添加备注（可选），回车保存"
              />
            </label>
            <button
              className="button button--secondary"
              type="submit"
              disabled={onNote ? draftNote === note : saved}
            >
              {saved && !onNote ? <Check size={16} /> : <Bookmark size={16} />}
              {onNote ? '保存备注' : saved ? '已保存' : '保存地址'}
            </button>
          </form>
        </div>
        <AddressMap record={displayed} index={index} />
      </div>
    </article>
  );
}
