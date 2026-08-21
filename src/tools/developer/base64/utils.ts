const textEncoder = new TextEncoder();

export function encodeBase64(value: string) {
  if (!value) throw new Error('请输入需要编码的文本。');
  const bytes = textEncoder.encode(value);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += Array.from(chunk, (byte) => String.fromCharCode(byte)).join('');
  }
  return btoa(binary);
}

export function decodeBase64(value: string) {
  const normalized = value.replaceAll(/\s+/g, '');
  if (!normalized) throw new Error('请输入需要解码的 Base64 内容。');
  try {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Base64 内容无效，或解码结果不是 UTF-8 文本。');
  }
}
