export interface TimestampResult {
  milliseconds: number;
  seconds: number;
  local: string;
  utc: string;
  iso: string;
}

export function parseTimestamp(value: string): TimestampResult {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('请输入 Unix 时间戳。');
  if (!/^-?\d+$/.test(trimmed)) throw new Error('时间戳只能包含整数。');
  const numeric = Number(trimmed);
  if (!Number.isSafeInteger(numeric)) throw new Error('时间戳超出浏览器可安全处理的范围。');
  const milliseconds = Math.abs(numeric) < 100_000_000_000 ? numeric * 1000 : numeric;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) throw new Error('时间戳无法转换为有效日期。');

  return {
    milliseconds,
    seconds: Math.trunc(milliseconds / 1000),
    local: new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full', timeStyle: 'medium' }).format(
      date,
    ),
    utc: date.toUTCString(),
    iso: date.toISOString(),
  };
}
