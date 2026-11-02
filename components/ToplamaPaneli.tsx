import { useState } from 'react';

// ?topla=1 oyun sonu: sunucu yok, oyuncu CSV'yi kopyalayıp geliştiriciye gönderir.
export default function ToplamaPaneli({ csv }: { csv: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  return (
    <aside className="hint" data-cy="toplama">
      <strong>Veri toplama</strong>
      Ad, e-posta, cihaz bilgisi ya da tutor'a yazdıkların burada yok. Yalnız süreler ve seçimler var.
      <textarea readOnly rows={6} value={csv} data-cy="veri-csv" aria-label="Oturum verisi" style={{ width: '100%', marginTop: 8 }} />
      <button
        data-cy="veri-kopyala"
        onClick={() => navigator.clipboard.writeText(csv).then(() => setKopyalandi(true))}
      >
        {kopyalandi ? 'Kopyalandı' : 'Veriyi kopyala'}
      </button>
    </aside>
  );
}
