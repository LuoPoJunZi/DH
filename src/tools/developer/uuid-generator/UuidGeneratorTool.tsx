import { Copy, Fingerprint, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ActionButton } from '../../../components/tool/ActionButton';
import { CopyButton } from '../../../components/tool/CopyButton';
import { ToolWorkspace } from '../../../components/tool/ToolWorkspace';
import { useCopy } from '../../../hooks/useCopy';
import { generateUuids } from './utils';

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState(() => generateUuids(5, false, true));
  const { copy, status } = useCopy();

  const generate = () => setUuids(generateUuids(count, uppercase, hyphens));

  return (
    <ToolWorkspace>
      <div className="option-bar">
        <label className="field field--small" htmlFor="uuid-count">
          <span className="field__label">生成数量</span>
          <input
            id="uuid-count"
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(event) => setUppercase(event.target.checked)}
          />
          <span>大写字母</span>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(event) => setHyphens(event.target.checked)}
          />
          <span>保留连字符</span>
        </label>
        <ActionButton variant="primary" icon={RefreshCw} onClick={generate}>
          重新生成
        </ActionButton>
      </div>
      <div className="uuid-list" aria-live="polite">
        {uuids.map((uuid, index) => (
          <div className="uuid-row" key={`${uuid}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <code>{uuid}</code>
            <button
              type="button"
              aria-label={`复制第 ${index + 1} 个 UUID`}
              onClick={() => {
                void copy(uuid);
              }}
            >
              <Copy size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="workspace-footer-actions">
        <CopyButton value={uuids.join('\n')} label="复制全部" />
        <span className="inline-status" aria-live="polite">
          {status === 'copied' ? '单个 UUID 已复制' : ''}
        </span>
        <span className="workspace-note">
          <Fingerprint size={15} aria-hidden="true" /> 使用浏览器加密随机源
        </span>
      </div>
    </ToolWorkspace>
  );
}
