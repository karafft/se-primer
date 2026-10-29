import { useMemo, useState } from 'react';
import { DECISIONS } from '../game/story.ts';
import type { DecisionId, Profile } from '../game/types.ts';
import { askTutor, type Turn } from '../tutor/core.ts';
import { makeGenerate } from '../tutor/gemini.ts';

export default function TutorPanel({ decision, profile }: { decision: DecisionId; profile: Profile }) {
  const online = useMemo(() => makeGenerate(process.env.API_KEY || process.env.GEMINI_API_KEY), []);
  const [failed, setFailed] = useState(false);
  const generate = failed ? null : online;
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const message = draft.trim();
    if (!message || busy) return;
    setDraft('');
    setBusy(true);
    setHistory((h) => [...h, { role: 'user', text: message }]);
    try {
      const reply = await askTutor({ decision, profile, history, message, generate });
      setHistory((h) => [...h, { role: 'model', text: reply.text }]);
    } catch (e) {
      // Model çağrısı olmuyorsa (kota, AI Studio proxy'si) oyun durmasın: çevrimdışı sorulara geç.
      console.error('Tutor hatası, çevrimdışı moda geçiliyor:', e);
      setFailed(true);
      const reply = await askTutor({ decision, profile, history, message, generate: null });
      setHistory((h) => [...h, { role: 'model', text: reply.text }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tutor">
      <button className="tutor-toggle" data-cy="tutor-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Tutor'a sor {!generate && <span className="offline">çevrimdışı</span>}
      </button>
      {open && (
        <div className="tutor-body" data-cy="tutor-panel">
          <p className="bubble model">{DECISIONS[decision].tutorOpening}</p>
          {history.map((t, i) => (
            <p key={i} className={`bubble ${t.role}`} data-cy={t.role === 'model' ? 'tutor-reply' : 'player-msg'}>
              {t.text}
            </p>
          ))}
          {busy && <p className="bubble model muted">düşünüyor…</p>}
          <form
            className="tutor-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              data-cy="tutor-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Düşünceni ya da sorunu yaz…"
              aria-label="Tutor'a mesaj"
            />
            <button type="submit" data-cy="tutor-send" disabled={busy}>
              Gönder
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
