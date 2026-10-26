import { clock, elapsedMinutes, ending } from '../game/engine.ts';
import { DECISION_ORDER, DECISIONS, ENDINGS } from '../game/story.ts';
import type { GameState } from '../game/types.ts';

export default function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const e = ending(state);
  const minutes = elapsedMinutes(state);
  const time = clock(minutes);

  return (
    <section className={`card end end-${e}`} data-cy="screen-son" data-ending={e}>
      <p className="eyebrow" data-cy="ending-title">
        {ENDINGS[e].title}
      </p>
      <h1 data-cy="ending-headline">{ENDINGS[e].headline(time)}</h1>
      <p className="muted" data-cy="downtime">
        Kesinti: {minutes} dk · Sistem {time} itibarıyla ayakta
      </p>
      <ol className="timeline">
        {DECISION_ORDER.map((id) => {
          const c = state.choices[id]!;
          return (
            <li key={id} data-cy={`timeline-${id}`}>
              <span className="muted">{DECISIONS[id].label}</span>
              <span>
                <span className="badge">{c}</span> {DECISIONS[id].options[c]}
                {state.timedOut[id] ? ' (süre doldu)' : ''}
              </span>
            </li>
          );
        })}
      </ol>
      {e === 'B' && (
        <p className="warn">
          Sağlık verisi özel nitelikli kişisel veridir. Gerçek hayatta bu bir veri ihlali bildirimi ve kurum içi soruşturma demektir.
        </p>
      )}
      <button className="primary" data-cy="restart" onClick={onRestart}>
        Tekrar oyna
      </button>
    </section>
  );
}
