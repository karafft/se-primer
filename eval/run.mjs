// Tutor eval: 20 öğrenci cevabını uygulamadaki tutor koduna (guard KAPALI) verir,
// çıktıları elle etiketlenecek labels.csv'ye yazar.
// Kullanım: anahtarı .env.local dosyasına yaz, sonra npm run eval   (anahtar yoksa --offline ile boru hattı denenir)
// Yarıda kalırsa (ör. günlük kota) tekrar çalıştır: alınan cevaplar saklanır, kaldığı yerden devam eder.
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

const isDailyQuota = (e) => e?.status === 429 && /per day|PerDay/i.test(String(e?.message));

// 429/503 (dakikalık kota, "model yoğun") geçicidir: artan beklemeyle yeniden dene.
// Günlük kota dolduysa beklemek işe yaramaz: hemen dur.
const retry = (fn) => async (...args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(...args);
    } catch (e) {
      if (isDailyQuota(e) || ![429, 500, 503].includes(e?.status) || attempt === 8) throw e;
      const wait = Math.min(60, 5 * 2 ** (attempt - 1));
      console.log(`   ${e.status} — ${wait} sn sonra tekrar (${attempt}/7)`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
  }
};
const generate = base && retry(base);
const model = offline ? 'offline' : MODEL;

const outDir = join(here, 'results');
const outputsFile = join(outDir, 'outputs.json');
mkdirSync(outDir, { recursive: true });
const previous = existsSync(outputsFile) ? JSON.parse(readFileSync(outputsFile, 'utf8')) : null;
const rows = previous?.meta.model === model ? previous.rows : [];
const save = () =>
  writeFileSync(outputsFile, JSON.stringify({ meta: { model, date: new Date().toISOString(), n: rows.length }, rows }, null, 2));

const students = readFileSync(join(here, 'students.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
if (rows.length) console.log(`${rows.length} cevap daha önce alınmış, devam ediliyor.`);
for (const s of students) {
  if (rows.some((r) => r.id === s.id)) continue;
  const profile = { level: s.level, role: 'backend', goal: s.decision };
  let reply;
  try {
    reply = await askTutor({ decision: s.decision, profile, history: [], message: s.message, generate, guard: false });
  } catch (e) {
    save();
    const why = isDailyQuota(e) ? 'günlük ücretsiz kota doldu' : `${e?.status ?? ''} ${String(e?.message ?? e).slice(0, 120)}`;
    console.error(`\n${s.id} alınamadı (${why}). ${rows.length}/${students.length} cevap kaydedildi; sonra tekrar "npm run eval" çalıştır.`);
    process.exit(1);
  }
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
  save();
  console.log(`${s.id} ${auto ? 'GUARD!' : 'ok    '} ${reply.text.slice(0, 90).replaceAll('\n', ' ')}`);
}

const columns = ['id', 'decision', 'kind', 'student', 'tutor_reply', 'ends_with_question', 'auto_leak', 'auto_reason', 'leak', 'category', 'note'];
const target = existsSync(join(outDir, 'labels.csv')) ? 'labels.new.csv' : 'labels.csv';
writeFileSync(join(outDir, target), toCsv(rows, columns));
console.log(`\n${rows.length} cevap → eval/results/${target}. 'leak' (1/0) ve 'category' sütunlarını ELLE doldur, sonra: npm run eval:report`);
