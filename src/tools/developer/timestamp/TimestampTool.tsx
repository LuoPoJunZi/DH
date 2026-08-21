import { Clock3, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { parseTimestamp, type TimestampResult } from './utils';

export default function TimestampTool() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [result, setResult] = useState<TimestampResult | null>(() =>
    parseTimestamp(String(Math.floor(Date.now() / 1000))),
  );
  const [error, setError] = useState('');

  const convert = (value = input) => {
    try {
      setResult(parseTimestamp(value));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '时间转换失败。');
      setResult(null);
    }
  };

  const setCurrent = () => {
    const current = String(Math.floor(Date.now() / 1000));
    setInput(current);
    convert(current);
  };

  const rows = result
    ? [
        ['本地时间', result.local],
        ['UTC 时间', result.utc],
        ['ISO 8601', result.iso],
        ['秒时间戳', String(result.seconds)],
        ['毫秒时间戳', String(result.milliseconds)],
      ]
    : [];

  return (
    <ToolWorkspace>
      <div className="single-input-row">
        <label className="field" htmlFor="timestamp-input">
          <span className="field__header">
            <span className="field__label">Unix 时间戳</span>
            <span className="field__hint">自动识别秒 / 毫秒</span>
          </span>
          <input
            id="timestamp-input"
            inputMode="numeric"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') convert();
            }}
            placeholder="例如 1724238000"
          />
        </label>
        <ActionButton variant="primary" icon={Clock3} onClick={() => convert()}>
          转换
        </ActionButton>
        <ActionButton icon={RotateCcw} onClick={setCurrent}>
          当前时间
        </ActionButton>
      </div>
      {error ? <FieldError message={error} /> : null}
      <div className="result-table" aria-live="polite">
        {rows.map(([label, value]) => (
          <div className="result-table__row" key={label}>
            <span>{label}</span>
            <code>{value}</code>
            <CopyButton value={value ?? ''} label="复制" />
          </div>
        ))}
      </div>
      {result ? (
        <div className="workspace-footer-actions">
          <CopyButton value={result.iso} label="复制 ISO 时间" />
          <ActionButton
            icon={Copy}
            variant="quiet"
            onClick={() => setInput(String(result.milliseconds))}
          >
            使用毫秒值
          </ActionButton>
        </div>
      ) : null}
    </ToolWorkspace>
  );
}
