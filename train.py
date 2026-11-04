"""Tek komut: python train.py → data/oturumlar.csv → model/{model.onnx, config.json}.

Eşik spec.md §10'da eğitimden önce yazıldı. Eşiğin altında hata koduyla durur, model/ değişmez.
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
import pandas as pd
import sklearn
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

KOK = Path(__file__).parent
SEED = 13
KARAR_ESIGI = 0.5
ESIK_AUC = 0.65
ESIK_RECALL = 0.60
OZELLIKLER = [
    ("seviye", "Seviye (0 yeni, 1 orta, 2 deneyimli)", 1),
    ("sahne_no", "Karar sırası", 2),
    ("onceki_yanlis_sayisi", "Önceki riskli seçim sayısı", 1),
    ("onceki_karar_suresi_sn", "Önceki karar süresi (sn)", 3.0),
    ("okuma_suresi_sn", "Önceki ekranı okuma süresi (sn)", 2.0),
    ("tutor_kullanim_sayisi", "Tutor açma sayısı", 0),
]
ADLAR = [o[0] for o in OZELLIKLER]


def main() -> None:
    df = pd.read_csv(KOK / "data" / "oturumlar.csv")
    df = df[df["sure_doldu"] == 0]
    X, y = df[ADLAR].astype(np.float32), df["yanlis_karar"]
    egitim, test = next(GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=SEED).split(X, y, df["oturum_id"]))

    model = make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced", random_state=SEED))
    model.fit(X.iloc[egitim], y.iloc[egitim])
    p = model.predict_proba(X.iloc[test])[:, 1]
    tahmin = (p >= KARAR_ESIGI).astype(int)
    gercek_test = (df["kaynak"].iloc[test] == "gercek").to_numpy()
    yt = y.iloc[test][gercek_test]
    metrikler = {
        "test_roc_auc": round(float(roc_auc_score(y.iloc[test], p)), 4),
        "test_recall": round(float(recall_score(y.iloc[test], tahmin)), 4),
        "test_accuracy": round(float(accuracy_score(y.iloc[test], tahmin)), 4),
        "test_satir": int(len(test)),
        # Kapı tüm test kümesine bakar (spec §10); yalnız gerçek satırlar ayrıca raporlanır.
        "gercek_test_roc_auc": round(float(roc_auc_score(yt, p[gercek_test])), 4) if yt.nunique() == 2 else None,
        "gercek_test_recall": round(float(recall_score(yt, tahmin[gercek_test])), 4) if yt.sum() else None,
        "gercek_test_satir": int(gercek_test.sum()),
    }
    gercek = df[df["kaynak"] == "gercek"]
    veri = {"gercek_oturum": int(gercek["oturum_id"].nunique()), "gercek_satir": int(len(gercek)),
            "sentetik_satir": int((df["kaynak"] == "sentetik").sum())}
    print(json.dumps({**metrikler, **veri}, ensure_ascii=False))

    if metrikler["test_roc_auc"] < ESIK_AUC or metrikler["test_recall"] < ESIK_RECALL:
        sys.exit(f"✗ Eval kapısı: AUC ≥ {ESIK_AUC} ve recall ≥ {ESIK_RECALL} gerekli. model/ güncellenmedi.")

    onx = to_onnx(model, initial_types=[("input", FloatTensorType([None, len(ADLAR)]))],
                  options={id(model): {"zipmap": False}}, target_opset=17)
    gecici = KOK / "model" / "model.onnx.tmp"
    gecici.write_bytes(onx.SerializeToString())
    p_onnx = ort.InferenceSession(str(gecici)).run(["probabilities"], {"input": X.to_numpy(np.float32)})[0]
    fark = float(np.abs(p_onnx - model.predict_proba(X)).max())
    if fark > 1e-4:
        gecici.unlink()
        sys.exit(f"✗ ONNX sklearn'den sapıyor (maks fark {fark:.2e})")
    gecici.replace(KOK / "model" / "model.onnx")

    config = {
        "title": "SE Primer riskli karar modeli",
        "target": "yanlis_karar",
        "classes": [0, 1],
        "class_labels": {"0": "guvenli", "1": "riskli"},
        "features": [{"name": a, "label": e, "example": o} for a, e, o in OZELLIKLER],
        "karar_esigi": KARAR_ESIGI,
        "kabul": {"test_roc_auc": ESIK_AUC, "test_recall": ESIK_RECALL},
        "metrics": metrikler,
        "veri": veri,
        "seed": SEED,
        "sklearn_version": sklearn.__version__,
    }
    (KOK / "model" / "config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    hedef = KOK / "public" / "model"
    hedef.mkdir(parents=True, exist_ok=True)
    for ad in ("model.onnx", "config.json"):
        shutil.copy(KOK / "model" / ad, KOK / "mobile" / "assets" / "model" / ad)
        shutil.copy(KOK / "model" / ad, hedef / ad)
    print(f"✓ model/ güncellendi (ONNX↔sklearn maks fark {fark:.1e})")


if __name__ == "__main__":
    main()
