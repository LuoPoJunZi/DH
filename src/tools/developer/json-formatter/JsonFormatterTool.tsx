import { CheckCircle2, Download, Eraser, FileJson2, Minimize2, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { TextAreaField } from '../../../components/tool/TextAreaField';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { siteConfig } from '../../../config/site/site';
import { jsonSample, processJson, type JsonAction } from './utils';

export default function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState<'format-2' | 'format-4'>('format-2');

  const run = (action: JsonAction) => {
    try {
      const result = processJson(input, action);
      setOutput(result.output);
      setStatus(result.message);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'JSON 处理失败。');
      setOutput('');
      setStatus('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStatus('');
  };

  const download = () => {
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'formatted.json';
    anchor.click();
    // Delay revocation so Safari/Firefox can start the download first.
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <ToolWorkspace>
      <div className="workspace-toolbar">
        <div className="workspace-toolbar__group">
          <ActionButton variant="primary" icon={WandSparkles} onClick={() => run(indent)}>
            格式化
          </ActionButton>
          <ActionButton icon={Minimize2} onClick={() => run('minify')}>
            压缩
          </ActionButton>
          <ActionButton icon={CheckCircle2} onClick={() => run('validate')}>
            校验
          </ActionButton>
        </div>
        <div className="workspace-toolbar__group">
          <ActionButton icon={FileJson2} variant="quiet" onClick={() => setInput(jsonSample)}>
            示例
          </ActionButton>
          <ActionButton icon={Eraser} variant="quiet" onClick={clear}>
            清空
          </ActionButton>
        </div>
      </div>
      <div className="editor-grid">
        <TextAreaField
          className="code-field"
          label="输入 JSON"
          hint={`${input.length.toLocaleString()} 字符`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`粘贴 JSON，例如 { "name": "${siteConfig.author}" }`}
          spellCheck={false}
        />
        <TextAreaField
          className="code-field"
          label="处理结果"
          hint={status}
          value={output}
          readOnly
          placeholder="结果会显示在这里"
          spellCheck={false}
        />
      </div>
      {error ? <FieldError message={error} /> : null}
      <div className="workspace-footer-actions">
        <CopyButton value={output} />
        <ActionButton icon={Download} onClick={download} disabled={!output}>
          下载 JSON
        </ActionButton>
        <label className="select-field select-field--inline">
          <span>缩进</span>
          <select
            value={indent}
            onChange={(event) => {
              const nextIndent = event.target.value === 'format-4' ? 'format-4' : 'format-2';
              setIndent(nextIndent);
              // Re-format only when there is something to format; avoid empty-input errors.
              if (input.trim()) run(nextIndent);
            }}
          >
            <option value="format-2">2 空格</option>
            <option value="format-4">4 空格</option>
          </select>
        </label>
      </div>
    </ToolWorkspace>
  );
}
