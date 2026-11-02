import { useEffect, useState } from 'react';
import type { Ozellikler } from '../game/davranis.ts';
import { riskHesapla } from '../uyum/model.ts';

// ?girdi=<json>: diferansiyel test için modeli oyundan bağımsız çalıştırır (spec.md KÖ-9).
export default function ParitePaneli({ girdi }: { girdi: Ozellikler }) {
  const [p, setP] = useState<number | null>(null);

  useEffect(() => {
    riskHesapla(girdi).then((u) => setP(u ? u.p : null));
  }, []);

  return (
    <section className="card" data-cy="screen-parite">
      <p className="eyebrow">Parite testi</p>
      {p !== null && <output data-cy="p">{p}</output>}
    </section>
  );
}
