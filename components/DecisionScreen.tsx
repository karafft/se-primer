import { useEffect, useRef, useState } from 'react';
import { DECISION_SECONDS, DECISIONS, decisionPrompt } from '../game/story.ts';
import type { Choice, DecisionId, GameState, Profile } from '../game/types.ts';
import TutorPanel from './TutorPanel.tsx';

export default function DecisionScreen(props: {
  id: DecisionId;
  profile: Profile;
  choices: GameState['choices'];
  onChoose: (c: Choice, timedOut?: boolean) => void;
}) {
  const { id, profile, choices, onChoose } = props;
  const d = DECISIONS[id];
  const timed = profile.level === 'deneyimli';
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
      <div className="choices">
        {(['A', 'B'] as Choice[]).map((c) => (
          <button key={c} className="choice" data-cy={`choice-${c}`} onClick={() => choose(c)}>
            <span className="badge">{c}</span>
            {d.options[c]}
          </button>
        ))}
      </div>
      <TutorPanel decision={id} profile={profile} choices={choices} />
    </section>
  );
}
