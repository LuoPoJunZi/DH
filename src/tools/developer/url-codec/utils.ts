export function encodeUrlComponent(value: string) {
  if (!value) throw new Error('请输入需要编码的 URL 或参数。');
  return encodeURIComponent(value);
}

export function decodeUrlComponent(value: string) {
  if (!value) throw new Error('请输入需要解码的 URL 内容。');
  try {
    return decodeURIComponent(value.replaceAll('+', ' '));
  } catch {
    throw new Error('URL 编码无效，请检查百分号编码是否完整。');
  }
}
