export function createUuidV4() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUuids(count: number, uppercase: boolean, hyphens: boolean) {
  const safeCount = Number.isFinite(count) ? Math.min(100, Math.max(1, Math.trunc(count))) : 1;
  return Array.from({ length: safeCount }, () => {
    let uuid = createUuidV4();
    if (!hyphens) uuid = uuid.replaceAll('-', '');
    return uppercase ? uuid.toUpperCase() : uuid;
  });
}
