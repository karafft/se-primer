"""Sentetik satırları üretir. data/oturumlar.csv içindeki gerçek satırlara dokunmaz.

Üretici kuralı (tohum 13), riskli seçim olasılığı:
  logit = 0.3 - 0.8*seviye + 0.7*onceki_yanlis - 0.09*okuma_sn - 0.05*karar_sn + 0.15*(sahne=3) - 0.4*tutor
Bu kural bir varsayımdır, gerçek oyuncuların böyle davrandığını göstermez.
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
    seviye = r.choice([0, 1, 2])
    aceleci = r.random() < 0.5
    yanlis, karar_sn, tutor, satirlar = 0, 0.0, 0, []
    for sahne in (1, 2, 3):
        okuma = round(r.uniform(1, 6) if aceleci else r.uniform(6, 30), 1)
        tutor += int(r.random() < (0.05 if aceleci else 0.2))
        logit = 0.3 - 0.8 * seviye + 0.7 * yanlis - 0.09 * okuma - 0.05 * karar_sn + 0.15 * (sahne == 3) - 0.4 * tutor
        y = int(r.random() < 1 / (1 + math.exp(-logit)))
        satirlar.append({"oturum_id": f"s{no:04d}", "kaynak": "sentetik", "seviye": seviye, "sahne_no": sahne,
                         "onceki_yanlis_sayisi": yanlis, "onceki_karar_suresi_sn": karar_sn, "okuma_suresi_sn": okuma,
                         "tutor_kullanim_sayisi": tutor, "sure_doldu": 0, "yanlis_karar": y})
        karar_sn = round(r.uniform(1, 8) if aceleci else r.uniform(8, 40), 1)
        yanlis += y
    return satirlar


if __name__ == "__main__":
    r = random.Random(13)
    yeni = pd.DataFrame([s for i in range(OTURUM) for s in oturum_uret(r, i)], columns=SUTUNLAR)
    gercek = pd.read_csv(YOL) if YOL.exists() else pd.DataFrame(columns=SUTUNLAR)
    gercek = gercek[gercek["kaynak"] == "gercek"]
    pd.concat([gercek, yeni] if len(gercek) else [yeni]).to_csv(YOL, index=False)
    print(f"{len(gercek)} gerçek + {len(yeni)} sentetik satır → {YOL.name}")
