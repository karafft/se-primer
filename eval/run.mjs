// Tutor eval: 20 öğrenci cevabını uygulamadaki tutor koduna (guard KAPALI) verir,
// çıktıları elle etiketlenecek labels.csv'ye yazar.
// Kullanım: anahtarı .env.local dosyasına yaz, sonra npm run eval   (anahtar yoksa --offline ile boru hattı denenir)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { askTutor, detectLeak } from '../tutor/core.ts';
import { makeGenerate, MODEL } from '../tutor/gemini.ts';
import { toCsv } from './csv.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const offline = process.argv.includes('--offline');
const base = offline ? null : makeGenerate(process.env.GEMINI_API_KEY);
if (!base && !offline) {
  console.error('GEMINI_API_KEY yok. Anahtarı ver ya da boru hattını denemek için --offline kullan.');
  process.exit(1);
}

// 429/503 (kota, "model yoğun") geçicidir: artan beklemeyle yeniden dene.
const retry = (fn) => async (...args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(...args);
    } catch (e) {
      if (![429, 500, 503].includes(e?.status) || attempt === 8) throw e;
      const wait = Math.min(60, 5 * 2 ** (attempt - 1));
      console.log(`   ${e.status} — ${wait} sn sonra tekrar (${attempt}/7)`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
  }
};
const generate = base && retry(base);

const students = readFileSync(join(here, 'students.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const rows = [];
for (const s of students) {
  const profile = { level: s.level, role: 'backend', goal: s.decision };
  const reply = await askTutor({ decision: s.decision, profile, history: [], message: s.message, generate, guard: false });
  const auto = detectLeak(reply.text, s.decision);
  rows.push({
    id: s.id,
    decision: s.decision,
    kind: s.kind,
    student: s.message,
    tutor_reply: reply.text,
    ends_with_question: /\?\s*$/.test(reply.text) ? 1 : 0,
    auto_leak: auto ? 1 : 0,
    auto_reason: auto ?? '',
    leak: '',
    category: '',
    note: '',
  });
  console.log(`${s.id} ${auto ? 'GUARD!' : 'ok    '} ${reply.text.slice(0, 90).replaceAll('\n', ' ')}`);
}

const outDir = join(here, 'results');
mkdirSync(outDir, { recursive: true });
const meta = { model: offline ? 'offline' : MODEL, date: new Date().toISOString(), n: rows.length };
writeFileSync(join(outDir, 'outputs.json'), JSON.stringify({ meta, rows }, null, 2));
const columns = ['id', 'decision', 'kind', 'student', 'tutor_reply', 'ends_with_question', 'auto_leak', 'auto_reason', 'leak', 'category', 'note'];
const target = existsSync(join(outDir, 'labels.csv')) ? 'labels.new.csv' : 'labels.csv';
writeFileSync(join(outDir, target), toCsv(rows, columns));
console.log(`\n${rows.length} cevap → eval/results/${target}. 'leak' (1/0) ve 'category' sütunlarını ELLE doldur, sonra: npm run eval:report`);
