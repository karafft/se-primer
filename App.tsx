import { useReducer, useRef, useState } from 'react';
import { csvMetni, csvSatiri, oturumKimligi, ozellikCikar, yeniIzler, type Ozellikler, type Uyum } from './game/davranis.ts';
import { clock, elapsedMinutes, initialState, reduce } from './game/engine.ts';
import { DECISION_ORDER, TITLE } from './game/story.ts';
import type { Choice, DecisionId } from './game/types.ts';
import { riskHesapla } from './uyum/model.ts';
import ParitePaneli from './components/ParitePaneli.tsx';
import ToplamaPaneli from './components/ToplamaPaneli.tsx';
import ProfileScreen from './components/ProfileScreen.tsx';
import IntroScreen from './components/IntroScreen.tsx';
import DecisionScreen from './components/DecisionScreen.tsx';
import ConsequenceScreen from './components/ConsequenceScreen.tsx';
import EndScreen from './components/EndScreen.tsx';

const SORGU = new URLSearchParams(location.search);
// Veri toplarken model kapalı: verdiği ipucu etiketi etkiler (spec.md §10).
const TOPLA = SORGU.has('topla');
const PARITE_GIRDI = SORGU.get('girdi');

export default function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const { screen, profile } = state;
  const [uyum, setUyum] = useState<Uyum | null>(null);
  const [satirlar, setSatirlar] = useState<string[]>([]);
  const iz = useRef(yeniIzler());
  const ekranBasi = useRef(Date.now());
  const girisOzellik = useRef<Ozellikler | null>(null);
  const oturumId = useRef(oturumKimligi());

  const gecenSn = () => {
    const simdi = Date.now();
    const sn = (simdi - ekranBasi.current) / 1000;
    ekranBasi.current = simdi;
    return sn;
  };

  const kararaGir = (id: DecisionId) => {
    const ozellik = ozellikCikar(profile!.level, id, state.choices, iz.current);
    girisOzellik.current = ozellik;
    setUyum(null);
    if (!TOPLA) {
      riskHesapla(ozellik).then((u) => {
        if (girisOzellik.current === ozellik) setUyum(u);
      });
    }
  };

  const ilerle = (olay: { type: 'BASLA' | 'DEVAM' }) => {
    iz.current.okumaSn = gecenSn();
    const sira = screen.kind === 'sonuc' ? DECISION_ORDER.indexOf(screen.id) + 1 : 0;
    if (DECISION_ORDER[sira]) kararaGir(DECISION_ORDER[sira]);
    dispatch(olay);
  };

  const sec = (choice: Choice, timedOut?: boolean) => {
    iz.current.oncekiKararSn = gecenSn();
    if (TOPLA && girisOzellik.current) {
      setSatirlar((s) => [...s, csvSatiri(oturumId.current, girisOzellik.current!, !!timedOut, choice === 'B')]);
    }
    dispatch({ type: 'SEC', choice, timedOut });
  };

  if (PARITE_GIRDI) return <main className="app"><ParitePaneli girdi={JSON.parse(PARITE_GIRDI)} /></main>;

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">SE Primer</span>
        <span className="chapter">{TITLE}</span>
        {screen.kind !== 'profil' && (
          <span className="clock" data-cy="clock">
            {clock(elapsedMinutes(state))}
          </span>
        )}
      </header>

      {screen.kind === 'profil' && (
        <ProfileScreen
          onDone={(p) => {
            gecenSn();
            dispatch({ type: 'PROFIL_TAMAM', profile: p });
          }}
        />
      )}
      {screen.kind === 'giris' && profile && <IntroScreen profile={profile} onStart={() => ilerle({ type: 'BASLA' })} />}
      {screen.kind === 'karar' && profile && (
        <DecisionScreen
          key={screen.id}
          id={screen.id}
          profile={profile}
          choices={state.choices}
          uyum={uyum}
          onTutorAc={() => iz.current.tutorSayisi++}
          onChoose={sec}
        />
      )}
      {screen.kind === 'sonuc' && profile && (
        <ConsequenceScreen id={screen.id} state={state} onNext={() => ilerle({ type: 'DEVAM' })} />
      )}
      {screen.kind === 'son' && (
        <>
          <EndScreen
            state={state}
            onRestart={() => {
              iz.current = yeniIzler();
              oturumId.current = oturumKimligi();
              dispatch({ type: 'YENIDEN' });
            }}
          />
          {TOPLA && <ToplamaPaneli csv={csvMetni(satirlar)} />}
        </>
      )}
    </main>
  );
}
