import { ArrowDownUp, Eraser, Link2 } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { TextAreaField } from '../../../components/tool/TextAreaField';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { decodeUrlComponent, encodeUrlComponent } from './utils';

export default function UrlCodecTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const run = () => {
    try {
      setOutput(mode === 'encode' ? encodeUrlComponent(input) : decodeUrlComponent(input));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'URL 转换失败。');
      setOutput('');
    }
  };

  const swap = () => {
    setInput(output || input);
    setOutput('');
    setMode((current) => (current === 'encode' ? 'decode' : 'encode'));
    setError('');
  };

  return (
    <ToolWorkspace>
      <div className="mode-switch" aria-label="转换模式">
        <button
          type="button"
          data-active={mode === 'encode'}
          aria-pressed={mode === 'encode'}
          onClick={() => setMode('encode')}
        >
          URL Encode
        </button>
        <button
          type="button"
          data-active={mode === 'decode'}
          aria-pressed={mode === 'decode'}
          onClick={() => setMode('decode')}
        >
          URL Decode
        </button>
      </div>
      <div className="editor-grid editor-grid--with-swap">
        <TextAreaField
          label="输入内容"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="例如：https://example.com/search?q=在线工具"
          spellCheck={false}
        />
        <button
          className="swap-button"
          type="button"
          onClick={swap}
          aria-label="交换输入输出并切换模式"
        >
          <ArrowDownUp size={18} />
        </button>
        <TextAreaField
          label="转换结果"
          value={output}
          readOnly
          placeholder="结果会显示在这里"
          spellCheck={false}
        />
      </div>
      {error ? <FieldError message={error} /> : null}
      <div className="workspace-footer-actions">
        <ActionButton variant="primary" icon={Link2} onClick={run}>
          {mode === 'encode' ? '编码 URL' : '解码 URL'}
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
