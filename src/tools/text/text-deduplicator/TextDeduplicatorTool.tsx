import { Eraser, ListFilter, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { FieldError } from '../../../components/tool/FieldError';
import { TextAreaField } from '../../../components/tool/TextAreaField';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { dedupeSample, deduplicateLines, type DedupeResult } from './utils';

export default function TextDeduplicatorTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DedupeResult | null>(null);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [error, setError] = useState('');

  const run = () => {
    try {
      setResult(deduplicateLines(input, { ignoreCase, trimWhitespace, removeEmpty }));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '文本去重失败。');
      setResult(null);
    }
  };

  return (
    <ToolWorkspace>
      <div className="option-bar">
        <label className="check-field">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(event) => setIgnoreCase(event.target.checked)}
          />
          <span>忽略大小写</span>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(event) => setTrimWhitespace(event.target.checked)}
          />
          <span>移除首尾空格</span>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={removeEmpty}
            onChange={(event) => setRemoveEmpty(event.target.checked)}
          />
          <span>移除空行</span>
        </label>
      </div>
      <div className="editor-grid">
        <TextAreaField
          label="原始文本"
          hint="每行一条内容"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="输入需要整理的列表…"
        />
        <TextAreaField
          label="去重结果"
          hint={result ? `移除 ${result.removedLines} 行` : undefined}
          value={result?.output ?? ''}
          readOnly
          placeholder="处理结果会显示在这里"
        />
      </div>
      {error ? <FieldError message={error} /> : null}
      {result ? (
        <p className="workspace-summary">
          <ListFilter size={16} aria-hidden="true" /> {result.inputLines} 行输入 →{' '}
          {result.outputLines} 行输出
        </p>
      ) : null}
      <div className="workspace-footer-actions">
        <ActionButton variant="primary" icon={Sparkles} onClick={run}>
          开始去重
        </ActionButton>
        <CopyButton value={result?.output ?? ''} />
        <ActionButton icon={ListFilter} variant="quiet" onClick={() => setInput(dedupeSample)}>
          加载示例
        </ActionButton>
        <ActionButton
          icon={Eraser}
          variant="quiet"
          onClick={() => {
            setInput('');
            setResult(null);
            setError('');
          }}
        >
          清空
        </ActionButton>
      </div>
    </ToolWorkspace>
  );
}
