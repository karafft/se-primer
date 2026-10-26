import { useState } from 'react';
import { GOALS, LEVELS, ROLES } from '../game/story.ts';
import type { Goal, Level, Profile, Role } from '../game/types.ts';

function Chips<T extends string>(props: { name: string; legend: string; options: Record<T, string>; value: T | null; onChange: (v: T) => void }) {
  return (
    <fieldset className="chips">
      <legend>{props.legend}</legend>
      {(Object.keys(props.options) as T[]).map((key) => (
        <button
          key={key}
          type="button"
          className={`chip${props.value === key ? ' selected' : ''}`}
          aria-pressed={props.value === key}
          data-cy={`${props.name}-${key}`}
          onClick={() => props.onChange(key)}
        >
          {props.options[key]}
        </button>
      ))}
    </fieldset>
  );
}

export default function ProfileScreen({ onDone }: { onDone: (p: Profile) => void }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const ready = level && role && goal;

  return (
    <section className="card" data-cy="screen-profil">
      <h1>Kişiye uyum sağlayan kitap, yazılım mühendisi için.</h1>
      <p className="muted">Sen karar verirsin, kitap kararının teknik sonucunu gösterir. Önce seni tanıyalım.</p>
      <Chips name="level" legend="1 · Seviyen?" options={LEVELS} value={level} onChange={setLevel} />
      <Chips name="role" legend="2 · Rolün?" options={ROLES} value={role} onChange={setRole} />
      <Chips name="goal" legend="3 · Bugün ne öğrenmek istiyorsun?" options={GOALS} value={goal} onChange={setGoal} />
      <button className="primary" data-cy="profile-done" disabled={!ready} onClick={() => ready && onDone({ level, role, goal })}>
        Nöbete başla
      </button>
    </section>
  );
}
