// model.onnx cihaz içinde, internetsiz çalışır (spec.md §10). Yüklenemezse null döner, oyun sabit kurallarla sürer.
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

import config from '../assets/model/config.json';
import type { Ozellikler, Uyum } from '../../game/davranis.ts';

let yukleme: Promise<InferenceSession> | null = null;

function yukle(): Promise<InferenceSession> {
  yukleme ??= (async () => {
    const asset = Asset.fromModule(require('../assets/model/model.onnx'));
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error('gömülü model.onnx bulunamadı');
    return InferenceSession.create(await new File(asset.localUri).bytes());
  })();
  return yukleme;
}

export async function riskHesapla(girdi: Ozellikler): Promise<Uyum | null> {
  try {
    const oturum = await yukle();
    const veri = Float32Array.from(config.features.map((o) => girdi[o.name as keyof Ozellikler]));
    const cikti = await oturum.run({ input: new Tensor('float32', veri, [1, config.features.length]) });
    const p = Number((cikti.probabilities.data as Float32Array)[1]);
    return { p, mudahale: p >= config.karar_esigi };
  } catch (e) {
    console.warn('Tahmin yapılamadı:', e);
    return null;
  }
}
