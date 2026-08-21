import { useEffect, useRef, useState } from 'react';

async function copyWithFallback(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy is not supported');
}

export function useCopy(resetDelay = 1800) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = async (value: string) => {
    if (!value) return;
    window.clearTimeout(timerRef.current);
    try {
      await copyWithFallback(value);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    timerRef.current = window.setTimeout(() => setStatus('idle'), resetDelay);
  };

  return { copy, status };
}
