interface ExternalDataOptions {
  signal?: AbortSignal;
  encoding?: 'json' | 'gbk';
}

export async function fetchExternalData(
  url: string,
  timeoutMs: number,
  { signal, encoding = 'json' }: ExternalDataOptions = {},
): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = window.setTimeout(abort, timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return null;
    return encoding === 'gbk'
      ? new TextDecoder('gbk').decode(await response.arrayBuffer())
      : ((await response.json()) as unknown);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
