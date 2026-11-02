import { useEffect, useRef, useState } from 'react';
import type { Uyum } from '../game/davranis.ts';
import { DECISION_ORDER, DECISION_SECONDS, DECISIONS, decisionPrompt } from '../game/story.ts';
import type { Choice, DecisionId, GameState, Profile } from '../game/types.ts';
import TutorPanel from './TutorPanel.tsx';

// ?risk=1: demo videosunda modelin olasılığını gösterir.
const RISKI_GOSTER = new URLSearchParams(location.search).has('risk');

export default function DecisionScreen(props: {
  id: DecisionId;
  profile: Profile;
  choices: GameState['choices'];
  uyum: Uyum | null;
  onTutorAc: () => void;
  onChoose: (c: Choice, timedOut?: boolean) => void;
}) {
  const { id, profile, choices, uyum, onTutorAc, onChoose } = props;
  const d = DECISIONS[id];
  // spec.md §10: 1. kararda henüz davranış verisi yok, süre kalkmaz.
  const sureKalkti = profile.level === 'deneyimli' && id !== DECISION_ORDER[0] && !!uyum?.mudahale;
  const timed = profile.level === 'deneyimli' && !sureKalkti;
  const [left, setLeft] = useState(DECISION_SECONDS);
  const chosen = useRef(false);

  const choose = (c: Choice, timedOut?: boolean) => {
    if (chosen.current) return;
    chosen.current = true;
    onChoose(c, timedOut);
  };

  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timed]);

  useEffect(() => {
    if (timed && left === 0) choose('B', true);
  }, [timed, left]);

  return (
    <section className="card" data-cy={`screen-karar-${id}`}>
      {timed && (
        <div className={`timer${left <= 10 ? ' critical' : ''}`} data-cy="timer" aria-live="polite">
          <div className="timer-bar" style={{ width: `${(left / DECISION_SECONDS) * 100}%` }} />
          <span>{left} sn</span>
        </div>
      )}
      <p className="eyebrow">{d.label}</p>
      <h2 data-cy="prompt">{decisionPrompt(id, choices)}</h2>
      {d.log && (
        <pre className="log" data-cy="log">
          {d.log}
        </pre>
      )}
      {profile.level === 'yeni' && (
        <aside className="hint" data-cy="hint">
          <strong>İpucu</strong> {d.hint}
        </aside>
      )}
      {profile.level !== 'yeni' && uyum?.mudahale && (
        <aside className="hint" data-cy="model-hint">
          <strong>Bir dur</strong> {d.hint}
        </aside>
      )}
      {sureKalkti && (
        <p className="muted" data-cy="model-sure-kalkti">
          Bu karar için süre baskısını kaldırdık. Acele etme.
        </p>
      )}
      {uyum && (
        <small hidden={!RISKI_GOSTER} data-cy="p">
          {uyum.p}
        </small>
      )}
      <div className="choices">
        {(['A', 'B'] as Choice[]).map((c) => (
          <button key={c} className="choice" data-cy={`choice-${c}`} onClick={() => choose(c)}>
            <span className="badge">{c}</span>
            {d.options[c]}
          </button>
        ))}
      </div>
      <TutorPanel decision={id} profile={profile} choices={choices} onOpen={onTutorAc} />
    </section>
  );
}
