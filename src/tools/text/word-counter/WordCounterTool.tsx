import { Eraser, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { TextAreaField } from '../../../components/tool/TextAreaField';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { countText, wordCounterSample } from './utils';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const statistics = useMemo(() => countText(text), [text]);
  const metrics: Array<readonly [string, number]> = [
    ['字 / 词', statistics.words],
    ['字符', statistics.characters],
    ['不含空格', statistics.charactersNoSpaces],
    ['中文字符', statistics.chineseCharacters],
    ['行数', statistics.lines],
    ['段落', statistics.paragraphs],
  ];

  return (
    <ToolWorkspace>
      <div className="metric-grid" aria-live="polite">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <strong>{value.toLocaleString()}</strong>
            <span>{label}</span>
          </div>
        ))}
        <div className="metric metric--accent">
          <strong>{statistics.readingMinutes}</strong>
          <span>分钟阅读</span>
        </div>
      </div>
      <TextAreaField
        className="field--tall"
        label="输入文本"
        hint="统计结果实时更新"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="在这里输入或粘贴需要统计的内容…"
      />
      <div className="workspace-footer-actions">
        <ActionButton icon={FileText} onClick={() => setText(wordCounterSample)}>
          加载示例
        </ActionButton>
        <ActionButton icon={Eraser} variant="quiet" onClick={() => setText('')} disabled={!text}>
          清空文本
        </ActionButton>
      </div>
    </ToolWorkspace>
  );
}
