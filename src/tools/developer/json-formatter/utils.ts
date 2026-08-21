const MAX_INPUT_LENGTH = 2_000_000;

export type JsonAction = 'format-2' | 'format-4' | 'minify' | 'validate';

export interface JsonResult {
  output: string;
  message: string;
}

function describeJsonError(error: unknown, source: string) {
  if (!(error instanceof SyntaxError)) return 'JSON 处理失败，请检查输入内容。';
  const positionMatch = error.message.match(/position\s+(\d+)/i);
  if (!positionMatch?.[1]) return `JSON 格式错误：${error.message}`;
  const position = Number(positionMatch[1]);
  const beforeError = source.slice(0, position);
  const line = beforeError.split('\n').length;
  const lastLineBreak = beforeError.lastIndexOf('\n');
  const column = position - lastLineBreak;
  return `JSON 格式错误，约在第 ${line} 行、第 ${column} 列。`;
}

export function processJson(source: string, action: JsonAction): JsonResult {
  if (!source.trim()) throw new Error('请输入需要处理的 JSON 数据。');
  if (source.length > MAX_INPUT_LENGTH) throw new Error('输入超过 2 MB，请缩小数据后重试。');

  try {
    const value: unknown = JSON.parse(source);
    if (action === 'validate') return { output: source, message: 'JSON 格式正确，可以安全使用。' };
    const indentation = action === 'format-2' ? 2 : action === 'format-4' ? 4 : 0;
    return {
      output: JSON.stringify(value, null, indentation),
      message: action === 'minify' ? '已移除多余空白。' : `已使用 ${indentation} 空格缩进。`,
    };
  } catch (error) {
    throw new Error(describeJsonError(error, source));
  }
}

export const jsonSample = `{
  "project": "KANG Tools",
  "static": true,
  "features": ["fast", "private", "useful"],
  "toolCount": 8
}`;
