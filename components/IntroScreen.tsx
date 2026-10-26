import { INTRO, LEVELS, ROLE_INTRO, ROLES } from '../game/story.ts';
import type { Profile } from '../game/types.ts';

export default function IntroScreen({ profile, onStart }: { profile: Profile; onStart: () => void }) {
  return (
    <section className="card" data-cy="screen-giris">
      <p className="eyebrow">Başlangıç · Kriz</p>
      <h1>"08:00, randevu sistemi çöktü. Nöbetçi sensin."</h1>
      <p>{INTRO}</p>
      <p data-cy="role-intro">
        <strong>{ROLES[profile.role]}:</strong> {ROLE_INTRO[profile.role]}
      </p>
      <p className="muted" data-cy="level-note">
        {profile.level === 'yeni' && 'Her kararda bir ipucu göreceksin. Acele yok.'}
        {profile.level === 'orta' && 'İpucu yok, ama takılırsan tutor\'a sorabilirsin.'}
        {profile.level === 'deneyimli' && 'Her karar için 60 saniyen var. Süre dolarsa ekip senin yerine karar verir.'}
      </p>
      <p className="tag">{LEVELS[profile.level]}</p>
      <button className="primary" data-cy="start" onClick={onStart}>
        Telefonu aç
      </button>
    </section>
  );
}
