import { ArrowLeftRight, Eraser } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { convertRadix, parseBigIntWithBase } from './utils';

const commonBases = [2, 8, 10, 16, 36] as const;

export default function RadixConverterTool() {
  const [input, setInput] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const [output, setOutput] = useState('ff');
  const [decimal, setDecimal] = useState(255n);
  const [error, setError] = useState('');

  const run = () => {
    try {
      const parsed = parseBigIntWithBase(input, fromBase);
      setDecimal(parsed);
      setOutput(convertRadix(input, fromBase, toBase));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '进制转换失败。');
      setOutput('');
    }
  };

  const swap = () => {
    if (output) {
      setInput(output);
      setOutput(input);
    }
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
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') run();
            }}
            spellCheck={false}
          />
        </label>
        <label className="select-field">
          <span>原始进制</span>
          <select value={fromBase} onChange={(event) => setFromBase(Number(event.target.value))}>
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
        {commonBases.map((base) => (
          <div className="result-table__row" key={base}>
            <span>{base} 进制</span>
            <code>{decimal.toString(base)}</code>
            <CopyButton value={decimal.toString(base)} label="复制" />
          </div>
        ))}
      </div>
      <div className="workspace-footer-actions">
        <ActionButton
          icon={Eraser}
          variant="quiet"
          onClick={() => {
            setInput('');
            setOutput('');
            setDecimal(0n);
            setError('');
          }}
        >
          清空
        </ActionButton>
        <span className="workspace-note">使用 BigInt 保持大整数精度</span>
      </div>
    </ToolWorkspace>
  );
}
