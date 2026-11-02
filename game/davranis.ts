// Oyuncu davranışı → model girdisi (spec.md §10, data/SOZLUK.md). Saf fonksiyonlar: web ve mobil aynısını kullanır.
import { DECISION_ORDER } from './story.ts';
import type { DecisionId, GameState, Level } from './types.ts';

export interface Izler {
  okumaSn: number;
  oncekiKararSn: number;
  tutorSayisi: number;
}

export type Ozellikler = Record<
  'seviye' | 'sahne_no' | 'onceki_yanlis_sayisi' | 'onceki_karar_suresi_sn' | 'okuma_suresi_sn' | 'tutor_kullanim_sayisi',
  number
>;

export interface Uyum {
  p: number;
  mudahale: boolean;
}

const SEVIYE: Record<Level, number> = { yeni: 0, orta: 1, deneyimli: 2 };
const SUTUNLAR = 'oturum_id,kaynak,seviye,sahne_no,onceki_yanlis_sayisi,onceki_karar_suresi_sn,okuma_suresi_sn,tutor_kullanim_sayisi,sure_doldu,yanlis_karar';

export const yeniIzler = (): Izler => ({ okumaSn: 0, oncekiKararSn: 0, tutorSayisi: 0 });

export function ozellikCikar(level: Level, id: DecisionId, choices: GameState['choices'], iz: Izler): Ozellikler {
  return {
    seviye: SEVIYE[level],
    sahne_no: DECISION_ORDER.indexOf(id) + 1,
    onceki_yanlis_sayisi: Object.values(choices).filter((c) => c === 'B').length,
    onceki_karar_suresi_sn: iz.oncekiKararSn,
    okuma_suresi_sn: iz.okumaSn,
    tutor_kullanim_sayisi: iz.tutorSayisi,
  };
}

export const oturumKimligi = (): string => Math.random().toString(36).slice(2, 10);

export function csvSatiri(oturumId: string, o: Ozellikler, sureDoldu: boolean, yanlis: boolean): string {
  const sn = (x: number) => Math.round(x * 10) / 10;
  return [oturumId, 'gercek', o.seviye, o.sahne_no, o.onceki_yanlis_sayisi, sn(o.onceki_karar_suresi_sn), sn(o.okuma_suresi_sn), o.tutor_kullanim_sayisi, +sureDoldu, +yanlis].join(',');
}

export const csvMetni = (satirlar: string[]): string => [SUTUNLAR, ...satirlar].join('\n') + '\n';
