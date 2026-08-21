export interface DedupeOptions {
  ignoreCase: boolean;
  trimWhitespace: boolean;
  removeEmpty: boolean;
}

export interface DedupeResult {
  output: string;
  inputLines: number;
  outputLines: number;
  removedLines: number;
}

export function deduplicateLines(value: string, options: DedupeOptions): DedupeResult {
  if (!value) throw new Error('请输入需要按行去重的文本。');
  const lines = value.split(/\r?\n/);
  const seen = new Set<string>();
  const output: string[] = [];

  for (const originalLine of lines) {
    const normalizedLine = options.trimWhitespace ? originalLine.trim() : originalLine;
    if (options.removeEmpty && !normalizedLine) continue;
    const key = options.ignoreCase ? normalizedLine.toLocaleLowerCase() : normalizedLine;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalizedLine);
  }

  return {
    output: output.join('\n'),
    inputLines: lines.length,
    outputLines: output.length,
    removedLines: lines.length - output.length,
  };
}

export const dedupeSample = `Apple
Banana
apple
Orange
Banana
  Orange  `;
