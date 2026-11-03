export interface AddressContext {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'REQUEST_FAILED',
  ) {
    super(message);
  }
}
export function json(value: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...headers,
    },
  });
}
export async function readJsonLimited(source: Request | Response, limit: number): Promise<unknown> {
  const length = Number(source.headers.get('content-length') ?? 0);
  if (length > limit) throw new ApiError(413, '请求体或响应体过大。', 'TOO_LARGE');
  if (!source.body) throw new ApiError(400, '缺少 JSON 内容。', 'BAD_JSON');
  const reader = source.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new ApiError(413, '内容超过长度限制。', 'TOO_LARGE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new ApiError(400, 'JSON 格式无效。', 'BAD_JSON');
  }
}
export function withTimeout(parent: AbortSignal, milliseconds: number) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parent.addEventListener('abort', abort, { once: true });
  if (parent.aborted) controller.abort();
  const timer = setTimeout(abort, milliseconds);
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      parent.removeEventListener('abort', abort);
    },
  };
}
