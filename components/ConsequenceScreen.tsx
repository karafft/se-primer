import { clock, elapsedMinutes } from '../game/engine.ts';
import { consequence, DECISIONS, DEEP_DIVE, ROLES, TIMEOUT_NOTE } from '../game/story.ts';
import type { DecisionId, GameState } from '../game/types.ts';

export default function ConsequenceScreen({ id, state, onNext }: { id: DecisionId; state: GameState; onNext: () => void }) {
  const d = DECISIONS[id];
  const choice = state.choices[id]!;
  const c = consequence(id, state.choices);
  const profile = state.profile!;

  return (
    <section className="card" data-cy={`screen-sonuc-${id}`}>
      <p className="eyebrow">
        {d.label} · {ROLES[profile.role]}
      </p>
      <h2>
        <span className="badge">{choice}</span> {d.options[choice]}
      </h2>
      {state.timedOut[id] && (
        <p className="warn" data-cy="timeout-note">
          {TIMEOUT_NOTE}
        </p>
      )}
      <h3>Ne oldu</h3>
      <p data-cy="what">{c.what}</p>
      <h3>Neden oldu</h3>
      <p data-cy="why">{c.why}</p>
      <p className="impact" data-cy="impact">
        {c.minutes > 0 ? `+${c.minutes} dk` : 'Süreye etkisi yok'} · saat {clock(elapsedMinutes(state))}
      </p>
      {profile.goal === id && (
        <aside className="deep" data-cy="deep-dive">
          <strong>Derinleş · hedefin bu</strong> {DEEP_DIVE[id]}
        </aside>
      )}
      <button className="primary" data-cy="next" onClick={onNext}>
        Devam
      </button>
    </section>
  );
}
