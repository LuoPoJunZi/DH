const digits = '0123456789abcdefghijklmnopqrstuvwxyz';

export function parseBigIntWithBase(value: string, base: number) {
  if (!Number.isInteger(base) || base < 2 || base > 36)
    throw new Error('进制必须是 2 到 36 的整数。');
  const trimmed = value.trim().toLocaleLowerCase();
  if (!trimmed) throw new Error('请输入需要转换的整数。');
  const negative = trimmed.startsWith('-');
  const body = negative ? trimmed.slice(1) : trimmed;
  if (!body) throw new Error('请输入有效整数。');

  let result = 0n;
  for (const character of body) {
    const digit = digits.indexOf(character);
    if (digit < 0 || digit >= base) {
      throw new Error(`字符“${character}”不是 ${base} 进制的有效数字。`);
    }
    result = result * BigInt(base) + BigInt(digit);
  }
  return negative ? -result : result;
}

export function convertRadix(value: string, fromBase: number, toBase: number) {
  if (!Number.isInteger(toBase) || toBase < 2 || toBase > 36)
    throw new Error('目标进制必须是 2 到 36 的整数。');
  return parseBigIntWithBase(value, fromBase).toString(toBase);
}
