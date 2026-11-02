// Web ile aynı oyun kuralları (../game) ve aynı model.onnx; yalnız arayüz React Native. Tutor burada hazır soruyla çalışır.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ozellikCikar, yeniIzler, type Ozellikler, type Uyum } from '../game/davranis.ts';
import { clock, elapsedMinutes, ending, initialState, reduce } from '../game/engine.ts';
import { consequence, DECISION_ORDER, DECISION_SECONDS, DECISIONS, decisionPrompt, DEEP_DIVE, ENDINGS, GOALS, INTRO, LEVELS, ROLE_INTRO, ROLES, TIMEOUT_NOTE, TITLE } from '../game/story.ts';
import type { Choice, DecisionId, GameState, Goal, Level, Profile, Role } from '../game/types.ts';
import { riskHesapla } from './src/model';

function Dugme({ yazi, onPress, kapali, ikincil }: { yazi: string; onPress: () => void; kapali?: boolean; ikincil?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={kapali} style={[s.dugme, ikincil && s.ikincil, kapali && s.kapali]}>
      <Text style={ikincil ? s.ikincilYazi : s.dugmeYazi}>{yazi}</Text>
    </Pressable>
  );
}

function Secenekler<T extends string>(props: { baslik: string; secenek: Record<T, string>; deger: T | null; degis: (v: T) => void }) {
  return (
    <View style={s.grup}>
      <Text style={s.etiket}>{props.baslik}</Text>
      {(Object.keys(props.secenek) as T[]).map((k) => (
        <Pressable key={k} onPress={() => props.degis(k)} style={[s.cip, props.deger === k && s.cipSecili]}>
          <Text style={props.deger === k ? s.cipSeciliYazi : s.metin}>{props.secenek[k]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ProfilEkrani({ bitti }: { bitti: (p: Profile) => void }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  return (
    <>
      <Text style={s.h1}>Kişiye uyum sağlayan kitap, yazılım mühendisi için.</Text>
      <Secenekler baslik="1 · Seviyen?" secenek={LEVELS} deger={level} degis={setLevel} />
      <Secenekler baslik="2 · Rolün?" secenek={ROLES} deger={role} degis={setRole} />
      <Secenekler baslik="3 · Bugün ne öğrenmek istiyorsun?" secenek={GOALS} deger={goal} degis={setGoal} />
      <Dugme yazi="Nöbete başla" kapali={!(level && role && goal)} onPress={() => level && role && goal && bitti({ level, role, goal })} />
    </>
  );
}

function KararEkrani(props: { id: DecisionId; profile: Profile; choices: GameState['choices']; uyum: Uyum | null; tutorAc: () => void; sec: (c: Choice, sureDoldu?: boolean) => void }) {
  const { id, profile, choices, uyum, tutorAc, sec } = props;
  const d = DECISIONS[id];
  const sureKalkti = profile.level === 'deneyimli' && id !== DECISION_ORDER[0] && !!uyum?.mudahale;
  const sureli = profile.level === 'deneyimli' && !sureKalkti;
  const [kalan, setKalan] = useState(DECISION_SECONDS);
  const [tutorAcik, setTutorAcik] = useState(false);
  const secildi = useRef(false);

  const secim = (c: Choice, sureDoldu?: boolean) => {
    if (secildi.current) return;
    secildi.current = true;
    sec(c, sureDoldu);
  };

  useEffect(() => {
    if (!sureli) return;
    const t = setInterval(() => setKalan((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, [sureli]);

  useEffect(() => {
    if (sureli && kalan === 0) secim('B', true);
  }, [sureli, kalan]);

  return (
    <>
      {sureli && <Text style={s.sure}>{kalan} sn</Text>}
      <Text style={s.etiket}>{d.label}</Text>
      <Text style={s.h2}>{decisionPrompt(id, choices)}</Text>
      {d.log && <Text style={s.log}>{d.log}</Text>}
      {profile.level === 'yeni' && <Text style={s.ipucu}>İpucu: {d.hint}</Text>}
      {profile.level !== 'yeni' && uyum?.mudahale && <Text style={s.ipucu}>Bir dur: {d.hint}</Text>}
      {sureKalkti && <Text style={s.soluk}>Bu karar için süre baskısını kaldırdık. Acele etme.</Text>}
      {(['A', 'B'] as Choice[]).map((c) => (
        <Dugme key={c} ikincil yazi={`${c} · ${d.options[c]}`} onPress={() => secim(c)} />
      ))}
      <Pressable
        onPress={() => {
          if (!tutorAcik) tutorAc();
          setTutorAcik(!tutorAcik);
        }}
      >
        <Text style={s.baglanti}>Tutor'a sor</Text>
      </Pressable>
      {tutorAcik && <Text style={s.ipucu}>{d.tutorOpening}</Text>}
    </>
  );
}

function SonucEkrani({ id, state, devam }: { id: DecisionId; state: GameState; devam: () => void }) {
  const d = DECISIONS[id];
  const secim = state.choices[id]!;
  const c = consequence(id, state.choices);
  return (
    <>
      <Text style={s.etiket}>{d.label} · {ROLES[state.profile!.role]}</Text>
      <Text style={s.h2}>{secim} · {d.options[secim]}</Text>
      {state.timedOut[id] && <Text style={s.uyari}>{TIMEOUT_NOTE}</Text>}
      <Text style={s.h3}>Ne oldu</Text>
      <Text style={s.metin}>{c.what}</Text>
      <Text style={s.h3}>Neden oldu</Text>
      <Text style={s.metin}>{c.why}</Text>
      <Text style={s.soluk}>{c.minutes > 0 ? `+${c.minutes} dk` : 'Süreye etkisi yok'} · saat {clock(elapsedMinutes(state))}</Text>
      {state.profile!.goal === id && <Text style={s.ipucu}>Derinleş: {DEEP_DIVE[id]}</Text>}
      <Dugme yazi="Devam" onPress={devam} />
    </>
  );
}

function SonEkrani({ state, yeniden }: { state: GameState; yeniden: () => void }) {
  const e = ending(state);
  const dakika = elapsedMinutes(state);
  return (
    <>
      <Text style={s.etiket}>{ENDINGS[e].title}</Text>
      <Text style={s.h1}>{ENDINGS[e].headline(clock(dakika))}</Text>
      <Text style={s.soluk}>Kesinti: {dakika} dk</Text>
      {DECISION_ORDER.map((id) => (
        <Text key={id} style={s.metin}>{DECISIONS[id].label}: {DECISIONS[id].options[state.choices[id]!]}</Text>
      ))}
      <Dugme yazi="Tekrar oyna" onPress={yeniden} />
    </>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const { screen, profile } = state;
  const [uyum, setUyum] = useState<Uyum | null>(null);
  const iz = useRef(yeniIzler());
  const ekranBasi = useRef(Date.now());
  const girisOzellik = useRef<Ozellikler | null>(null);

  const gecenSn = () => {
    const simdi = Date.now();
    const sn = (simdi - ekranBasi.current) / 1000;
    ekranBasi.current = simdi;
    return sn;
  };

  const ilerle = (olay: { type: 'BASLA' | 'DEVAM' }) => {
    iz.current.okumaSn = gecenSn();
    const sonraki = DECISION_ORDER[screen.kind === 'sonuc' ? DECISION_ORDER.indexOf(screen.id) + 1 : 0];
    if (sonraki) {
      const ozellik = ozellikCikar(profile!.level, sonraki, state.choices, iz.current);
      girisOzellik.current = ozellik;
      setUyum(null);
      riskHesapla(ozellik).then((u) => {
        if (girisOzellik.current === ozellik) setUyum(u);
      });
    }
    dispatch(olay);
  };

  return (
    <SafeAreaView style={s.kok}>
      <StatusBar style="auto" />
      <View style={s.ust}>
        <Text style={s.marka}>SE Primer · {TITLE}</Text>
        {screen.kind !== 'profil' && <Text style={s.marka}>{clock(elapsedMinutes(state))}</Text>}
      </View>
      <ScrollView contentContainerStyle={s.icerik}>
        {screen.kind === 'profil' && (
          <ProfilEkrani
            bitti={(p) => {
              gecenSn();
              dispatch({ type: 'PROFIL_TAMAM', profile: p });
            }}
          />
        )}
        {screen.kind === 'giris' && profile && (
          <>
            <Text style={s.h1}>"08:00, randevu sistemi çöktü. Nöbetçi sensin."</Text>
            <Text style={s.metin}>{INTRO}</Text>
            <Text style={s.metin}>{ROLES[profile.role]}: {ROLE_INTRO[profile.role]}</Text>
            <Dugme yazi="Başla" onPress={() => ilerle({ type: 'BASLA' })} />
          </>
        )}
        {screen.kind === 'karar' && profile && (
          <KararEkrani
            key={screen.id}
            id={screen.id}
            profile={profile}
            choices={state.choices}
            uyum={uyum}
            tutorAc={() => iz.current.tutorSayisi++}
            sec={(choice, timedOut) => {
              iz.current.oncekiKararSn = gecenSn();
              dispatch({ type: 'SEC', choice, timedOut });
            }}
          />
        )}
        {screen.kind === 'sonuc' && <SonucEkrani id={screen.id} state={state} devam={() => ilerle({ type: 'DEVAM' })} />}
        {screen.kind === 'son' && (
          <SonEkrani
            state={state}
            yeniden={() => {
              iz.current = yeniIzler();
              dispatch({ type: 'YENIDEN' });
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kok: { flex: 1, backgroundColor: '#f6f8fa', paddingTop: 36 },
  ust: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  marka: { fontWeight: '600', color: '#0f4c75' },
  icerik: { padding: 16, gap: 12 },
  h1: { fontSize: 24, fontWeight: '700', color: '#14212b' },
  h2: { fontSize: 19, fontWeight: '600', color: '#14212b' },
  h3: { fontSize: 15, fontWeight: '600', color: '#14212b' },
  metin: { fontSize: 16, lineHeight: 23, color: '#14212b' },
  soluk: { fontSize: 14, color: '#5b6b78' },
  etiket: { fontSize: 13, fontWeight: '600', color: '#0f4c75' },
  sure: { fontSize: 15, fontWeight: '700', color: '#b42318' },
  uyari: { fontSize: 14, color: '#b42318' },
  log: { fontFamily: 'monospace', fontSize: 12, backgroundColor: '#14212b', color: '#e6edf3', padding: 10, borderRadius: 8 },
  ipucu: { fontSize: 14, lineHeight: 20, color: '#0f4c75', backgroundColor: '#e3eff7', padding: 12, borderRadius: 12 },
  grup: { gap: 6 },
  cip: { borderWidth: 1, borderColor: '#c5d0d9', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  cipSecili: { backgroundColor: '#0f4c75', borderColor: '#0f4c75' },
  cipSeciliYazi: { fontSize: 16, color: '#fff' },
  dugme: { backgroundColor: '#0f4c75', borderRadius: 12, padding: 14, alignItems: 'center' },
  dugmeYazi: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ikincil: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#c5d0d9', alignItems: 'flex-start' },
  ikincilYazi: { color: '#14212b', fontSize: 16 },
  kapali: { opacity: 0.4 },
  baglanti: { color: '#0f4c75', fontWeight: '600', paddingVertical: 8 },
});
