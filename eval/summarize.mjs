// Elle etiketlenmiş labels.csv → REPORT.md (oran + örnek sayısı + Wilson %95 güven aralığı).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './csv.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const labeler = flag('--labeler') ?? 'elle (1 kişi)';
const file = args[0] ?? join(here, 'results', 'labels.csv');
const rows = parseCsv(readFileSync(file, 'utf8'));
const meta = (() => {
  try { return JSON.parse(readFileSync(join(here, 'results', 'outputs.json'), 'utf8')).meta; } catch { return {}; }
})();

const unlabeled = rows.filter((r) => r.leak !== '0' && r.leak !== '1');
if (unlabeled.length) {
  console.error(`Etiketsiz satır var (leak 0/1 olmalı): ${unlabeled.map((r) => r.id).join(', ')}`);
  process.exit(1);
}

export function wilson(k, n, z = 1.96) {
  if (n === 0) return [0, 0];
  const p = k / n, d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

const pct = (x) => `%${(x * 100).toFixed(1)}`;
const rate = (k, n) => { const [lo, hi] = wilson(k, n); return `${k}/${n} = ${pct(k / n)} (Wilson %95 GA: ${pct(lo)}–${pct(hi)})`; };
const n = rows.length;
const leaks = rows.filter((r) => r.leak === '1');
const questions = rows.filter((r) => r.ends_with_question === '1').length;

const count = (key) => Object.entries(rows.reduce((m, r) => ((m[r[key] || '—'] = (m[r[key] || '—'] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
const byGroup = (key) =>
  Object.entries(rows.reduce((m, r) => ((m[r[key]] ??= []).push(r), m), {}))
    .map(([g, rs]) => `| ${g} | ${rs.length} | ${rs.filter((r) => r.leak === '1').length} |`).join('\n');

const tp = rows.filter((r) => r.leak === '1' && r.auto_leak === '1').length;
const fp = rows.filter((r) => r.leak === '0' && r.auto_leak === '1').length;
const fn = rows.filter((r) => r.leak === '1' && r.auto_leak === '0').length;
const afterGuard = fn; // guard yakaladığını gizler; kaçırdığı sızıntı oyuncuya ulaşır

const report = `# Tutor eval raporu

- Model: \`${meta.model ?? '?'}\` · Tarih: ${meta.date ?? '?'} · Etiketleyen: ${labeler}
- Örnek sayısı: **n = ${n}**

## Ana ölçüt: "Tutor cevabı ele verdi mi?"

| Ölçüt | Sonuç |
|-------|-------|
| Ele verme (ham model, guard kapalı) | **${rate(leaks.length, n)}** |
| Ele verme (guard sonrası, oyuncunun gördüğü) | ${rate(afterGuard, n)} |
| Cevabı soruyla bitirdi | ${rate(questions, n)} |

> n=${n} küçük bir örnek: güven aralığı geniş. Bu sonuç "Sokratik" iddiasının kaba bir kanıtıdır, kesin değildir.

## Hata kategorileri

| Kategori | Adet |
|----------|------|
${count('category').map(([c, k]) => `| ${c} | ${k} |`).join('\n')}

## Öğrenci cevabı türüne göre

| Tür | n | Ele verme |
|-----|---|-----------|
${byGroup('kind')}

## Karara göre

| Karar | n | Ele verme |
|-------|---|-----------|
${byGroup('decision')}

## Guard (detectLeak) doğruluğu

| | İnsan: ele verdi | İnsan: vermedi |
|---|---|---|
| Guard: yakaladı | ${tp} | ${fp} |
| Guard: kaçırdı | ${fn} | ${n - tp - fp - fn} |

## Ele veren örnekler

${leaks.map((r) => `- **${r.id}** (${r.kind}, ${r.category}): "${r.student}" → "${r.tutor_reply.replaceAll('\n', ' ')}"${r.note ? ` — _${r.note}_` : ''}`).join('\n') || '_Yok._'}
`;

writeFileSync(join(here, 'REPORT.md'), report);
console.log(report);
