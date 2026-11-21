import { ArrowLeftRight, Eraser } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { parseBigIntWithBase } from './utils';

const commonBases = [2, 8, 10, 16, 36] as const;

export default function RadixConverterTool() {
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  // The parsed value is base-independent; null means the input has not been converted yet.
  const [decimal, setDecimal] = useState<bigint | null>(255n);
  const [error, setError] = useState('');
  const output = decimal === null ? '' : decimal.toString(toBase);

  const run = () => {
    try {
      setDecimal(parseBigIntWithBase(input, fromBase));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '进制转换失败。');
      setDecimal(null);
    }
  };

  const invalidate = () => {
    setDecimal(null);
    setError('');
  };

  const swap = () => {
    if (decimal !== null) setInput(output);
    setFromBase(toBase);
    setToBase(fromBase);
    setError('');
  };

  return (
    <ToolWorkspace>
      <div className="radix-controls">
        <label className="field" htmlFor="radix-input">
          <span className="field__label">输入整数</span>
          <input
            id="radix-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              invalidate();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') run();
            }}
            spellCheck={false}
          />
        </label>
        <label className="select-field">
          <span>原始进制</span>
          <select
            value={fromBase}
            onChange={(event) => {
              setFromBase(Number(event.target.value));
              invalidate();
            }}
          >
            {Array.from({ length: 35 }, (_, index) => index + 2).map((base) => (
              <option key={base} value={base}>
                {base} 进制
              </option>
            ))}
          </select>
        </label>
        <button
          className="swap-button"
          type="button"
          onClick={swap}
          aria-label="交换原始和目标进制"
        >
          <ArrowLeftRight size={18} />
        </button>
        <label className="select-field">
          <span>目标进制</span>
          <select value={toBase} onChange={(event) => setToBase(Number(event.target.value))}>
            {Array.from({ length: 35 }, (_, index) => index + 2).map((base) => (
              <option key={base} value={base}>
                {base} 进制
              </option>
            ))}
          </select>
        </label>
        <ActionButton variant="primary" icon={ArrowLeftRight} onClick={run}>
          转换
        </ActionButton>
      </div>
      {error ? <FieldError message={error} /> : null}
      <div className="radix-output">
        <div>
          <span>{toBase} 进制结果</span>
          <code>{output || '—'}</code>
        </div>
        <CopyButton value={output} />
      </div>
      <div className="result-table result-table--compact">
        {commonBases.map((base) => {
          const value = decimal === null ? '' : decimal.toString(base);
          return (
            <div className="result-table__row" key={base}>
              <span>{base} 进制</span>
              <code>{value || '—'}</code>
              <CopyButton value={value} label="复制" />
            </div>
          );
        })}
      </div>
      <div className="workspace-footer-actions">
        <ActionButton
          icon={Eraser}
          variant="quiet"
          onClick={() => {
            setInput('');
            invalidate();
          }}
        >
          清空
        </ActionButton>
        <span className="workspace-note">使用 BigInt 保持大整数精度</span>
      </div>
    </ToolWorkspace>
  );
}
