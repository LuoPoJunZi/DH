export interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  chineseCharacters: number;
  lines: number;
  paragraphs: number;
  readingMinutes: number;
}

export function countText(value: string): TextStatistics {
  const trimmed = value.trim();
  const chineseCharacters = value.match(/\p{Script=Han}/gu)?.length ?? 0;
  const nonChineseText = value.replaceAll(/\p{Script=Han}/gu, ' ');
  const latinWords = nonChineseText.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const words = chineseCharacters + latinWords;
  return {
    characters: value.length,
    charactersNoSpaces: value.replaceAll(/\s/gu, '').length,
    words,
    chineseCharacters,
    lines: value ? value.split(/\r?\n/).length : 0,
    paragraphs: trimmed ? trimmed.split(/(?:\r?\n){2,}/).filter((part) => part.trim()).length : 0,
    readingMinutes: words ? Math.max(1, Math.ceil(words / 300)) : 0,
  };
}

export const wordCounterSample = `把常用工具，放在手边。

KANG Tools is a fast and privacy-first toolbox. 所有输入内容都只在浏览器本地处理。`;
