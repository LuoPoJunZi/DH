import { ATTRIBUTION, DATA_NOTICE } from '../shared/address';
import type { ExportEntry, ExportFormat } from '../shared/types';

export function csvCell(value: string): string {
  // Guard spreadsheet formulas even when hidden behind leading whitespace.
  const protectedValue =
    /^[\s]*[=+\-@]/.test(value) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${protectedValue.replace(/"/g, '""')}"`;
}

export function serializeAddresses(entries: readonly ExportEntry[], format: ExportFormat): string {
  if (!entries.length) throw new Error('当前没有可导出的地址。');
  if (format === 'json') {
    return JSON.stringify(
      {
        schemaVersion: 6,
        dataKind: 'mapped',
        verified: false,
        notice: DATA_NOTICE,
        attribution: ATTRIBUTION,
        records: entries.map(({ record, note = '' }) => ({ ...record, note })),
      },
      null,
      2,
    );
  }
  if (format === 'txt') {
    return `${DATA_NOTICE}\n${ATTRIBUTION}\n\n${entries
      .map(({ record: r, note = '' }, index) =>
        [
          `[${index + 1}] ${r.countryName}`,
          r.recipient,
          r.fullAddress,
          r.email ? `邮箱示例：${r.email}` : '',
          r.phone ? `电话占位：${r.phone}` : '',
          note ? `备注：${note}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n---\n\n')}\n`;
  }
  const columns = [
    'id',
    'countryCode',
    'countryName',
    'regionCode',
    'region',
    'city',
    'district',
    'addressLine1',
    'addressLine2',
    'postalCode',
    'postalCodeStatus',
    'recipient',
    'email',
    'phone',
    'fullAddress',
    'source',
    'sourcePlaceId',
    'retrievedAt',
    'dataKind',
    'verified',
    'createdAt',
    'note',
    'attribution',
  ] as const;
  const rows = entries.map(({ record, note = '' }) =>
    columns
      .map((key) =>
        csvCell(key === 'note' ? note : key === 'attribution' ? ATTRIBUTION : String(record[key])),
      )
      .join(','),
  );
  return '\uFEFF' + [columns.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n';
}

export function downloadAddresses(entries: readonly ExportEntry[], format: ExportFormat): void {
  const contents = serializeAddresses(entries, format);
  const mime = { json: 'application/json', csv: 'text/csv', txt: 'text/plain' }[format];
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `address-samples-${new Date().toISOString().slice(0, 10)}.${format}`;
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    // Give the browser time to begin the download before releasing the URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
