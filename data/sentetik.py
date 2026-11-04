"""Sentetik satırları üretir. data/oturumlar.csv içindeki gerçek satırlara dokunmaz.

Dağılımlar 40 gerçek oturumdan alındı (seviye oranı 15/17/8, okuma süresi ortancası 1,2 sn,
önceki karar süresi ortancası 5,3 sn, tutor kullanımı satırların %6'sı).

Üretici kuralı (tohum 13), riskli seçim olasılığı:
  logit = 0.9 - 0.6*seviye + 0.6*onceki_yanlis - 0.5*(okuma_sn - 1.2) - 0.08*(karar_sn - 5) - 0.8*tutor
Bu kural bir varsayımdır. Gerçek oturumlarda bu ilişki görülmedi (model kartı, yalnız gerçek test metrikleri).
Oturum sayısı ilk denemede 80'di; kapıda kalınca 120'ye çıkarıldı.
"""
import math
import random
from pathlib import Path

import pandas as pd

YOL = Path(__file__).parent / "oturumlar.csv"
OTURUM = 120
SUTUNLAR = ["oturum_id", "kaynak", "seviye", "sahne_no", "onceki_yanlis_sayisi", "onceki_karar_suresi_sn",
            "okuma_suresi_sn", "tutor_kullanim_sayisi", "sure_doldu", "yanlis_karar"]


def oturum_uret(r: random.Random, no: int) -> list[dict]:
    seviye = r.choices([0, 1, 2], weights=[15, 17, 8])[0]
    yanlis, karar_sn, tutor, satirlar = 0, 0.0, 0, []
    for sahne in (1, 2, 3):
        okuma = round(min(r.lognormvariate(math.log(1.2), 0.8), 30), 1)
        tutor += int(r.random() < 0.06)
        logit = 0.9 - 0.6 * seviye + 0.6 * yanlis - 0.5 * (okuma - 1.2) - 0.08 * (karar_sn - 5) - 0.8 * tutor
        y = int(r.random() < 1 / (1 + math.exp(-logit)))
        satirlar.append({"oturum_id": f"s{no:04d}", "kaynak": "sentetik", "seviye": seviye, "sahne_no": sahne,
                         "onceki_yanlis_sayisi": yanlis, "onceki_karar_suresi_sn": karar_sn, "okuma_suresi_sn": okuma,
                         "tutor_kullanim_sayisi": tutor, "sure_doldu": 0, "yanlis_karar": y})
        karar_sn = round(min(r.lognormvariate(math.log(5.3), 0.7), 60), 1)
        yanlis += y
    return satirlar


if __name__ == "__main__":
    r = random.Random(13)
    yeni = pd.DataFrame([s for i in range(OTURUM) for s in oturum_uret(r, i)], columns=SUTUNLAR)
    gercek = pd.read_csv(YOL) if YOL.exists() else pd.DataFrame(columns=SUTUNLAR)
    gercek = gercek[gercek["kaynak"] == "gercek"]
    pd.concat([gercek, yeni] if len(gercek) else [yeni]).to_csv(YOL, index=False)
    print(f"{len(gercek)} gerçek + {len(yeni)} sentetik satır → {YOL.name}")
