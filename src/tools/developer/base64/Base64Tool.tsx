import { ArrowDownUp, Binary, Eraser } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { TextAreaField } from '../../../components/tool/TextAreaField';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { decodeBase64, encodeBase64 } from './utils';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const run = (nextMode = mode) => {
    try {
      setOutput(nextMode === 'encode' ? encodeBase64(input) : decodeBase64(input));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '转换失败。');
      setOutput('');
    }
  };

  const switchMode = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInput(output || input);
    setOutput('');
    setError('');
  };

  return (
    <ToolWorkspace>
      <div className="mode-switch" aria-label="转换模式">
        {(['encode', 'decode'] as const).map((value) => (
          <button
            key={value}
            type="button"
            data-active={mode === value}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setError('');
            }}
          >
            {value === 'encode' ? '编码' : '解码'}
          </button>
        ))}
      </div>
      <div className="editor-grid editor-grid--with-swap">
        <TextAreaField
          label={mode === 'encode' ? '原始文本' : 'Base64 内容'}
          hint={`${input.length.toLocaleString()} 字符`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={mode === 'encode' ? '输入中文或任意 Unicode 文本' : '粘贴 Base64 内容'}
        />
        <button
          className="swap-button"
          type="button"
          onClick={switchMode}
          aria-label="交换输入输出并切换模式"
        >
          <ArrowDownUp size={18} />
        </button>
        <TextAreaField label="转换结果" value={output} readOnly placeholder="结果会显示在这里" />
      </div>
      {error ? <FieldError message={error} /> : null}
      <div className="workspace-footer-actions">
        <ActionButton variant="primary" icon={Binary} onClick={() => run()}>
          {mode === 'encode' ? '开始编码' : '开始解码'}
        </ActionButton>
        <CopyButton value={output} />
        <ActionButton
          icon={Eraser}
          variant="quiet"
          onClick={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
        >
          清空
        </ActionButton>
      </div>
    </ToolWorkspace>
  );
}
