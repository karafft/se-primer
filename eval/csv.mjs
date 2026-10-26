// Türkçe Excel ile açılabilsin diye ';' ayırıcı + UTF-8 BOM.
export const SEP = ';';

export function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return '﻿' + [columns.join(SEP), ...rows.map((r) => columns.map((c) => esc(r[c])).join(SEP))].join('\r\n') + '\r\n';
}

export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const sep = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
