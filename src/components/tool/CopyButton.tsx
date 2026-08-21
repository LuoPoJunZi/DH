import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useCopy } from '../../hooks/useCopy';
import { ActionButton } from './ActionButton';

export function CopyButton({ value, label = '复制结果' }: { value: string; label?: string }) {
  const { copy, status } = useCopy();
  const Icon = status === 'copied' ? Check : status === 'error' ? TriangleAlert : Copy;
  const text = status === 'copied' ? '复制成功' : status === 'error' ? '请手动复制' : label;
  return (
    <ActionButton
      icon={Icon}
      onClick={() => {
        void copy(value);
      }}
      disabled={!value}
    >
      {text}
    </ActionButton>
  );
}
