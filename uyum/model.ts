// model.onnx'i tarayıcıda çalıştırır (spec.md §10). Yüklenemezse null döner, oyun sabit kurallarla sürer.
import * as ort from 'onnxruntime-web';
import type { Ozellikler, Uyum } from '../game/davranis.ts';

// Yayından sonra commit'e sabit adres: https://huggingface.co/<kullanici>/<repo>/resolve/<commit>/
const HF_TABAN = '';
const YEREL_TABAN = `${import.meta.env.BASE_URL}model/`;

interface Yuklu {
  oturum: ort.InferenceSession;
  adlar: string[];
  esik: number;
}

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';

let yukleme: Promise<Yuklu | null> | null = null;

async function tabandanYukle(taban: string): Promise<Yuklu> {
  const yanit = await fetch(`${taban}config.json`);
  if (!yanit.ok) throw new Error(`config.json HTTP ${yanit.status}`);
  const config = await yanit.json();
  return {
    oturum: await ort.InferenceSession.create(`${taban}model.onnx`),
    adlar: config.features.map((o: { name: string }) => o.name),
    esik: config.karar_esigi,
  };
}

function yukle(): Promise<Yuklu | null> {
  yukleme ??= (async () => {
    for (const taban of [HF_TABAN, YEREL_TABAN].filter(Boolean)) {
      try {
        return await tabandanYukle(taban);
      } catch (e) {
        console.warn(`Model yüklenemedi (${taban}):`, e);
      }
    }
    return null;
  })();
  return yukleme;
}

// onnxruntime-web aynı anda tek run kabul eder; istekler sıraya girer.
let sira: Promise<unknown> = Promise.resolve();

export function riskHesapla(girdi: Ozellikler): Promise<Uyum | null> {
  const sonuc = sira.then(() => hesapla(girdi));
  sira = sonuc;
  return sonuc;
}

async function hesapla(girdi: Ozellikler): Promise<Uyum | null> {
  try {
    const m = await yukle();
    if (!m) return null;
    const veri = Float32Array.from(m.adlar.map((a) => girdi[a as keyof Ozellikler]));
    const cikti = await m.oturum.run({ input: new ort.Tensor('float32', veri, [1, m.adlar.length]) });
    const p = Number((cikti.probabilities.data as Float32Array)[1]);
    return { p, mudahale: p >= m.esik };
  } catch (e) {
    console.warn('Tahmin yapılamadı:', e);
    return null;
  }
}
