"""Test kahini: aynı model.onnx'i Python'da çalıştırır, tests/parite.json'u yazar."""
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort

KOK = Path(__file__).parent.parent
GIRDILER = [
    [0, 1, 0, 0.0, 12.0, 0],
    [1, 2, 1, 3.0, 2.0, 0],
    [1, 2, 0, 20.0, 25.0, 1],
    [2, 3, 2, 2.5, 1.5, 0],
    [2, 3, 0, 15.0, 30.0, 2],
]

config = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
adlar = [o["name"] for o in config["features"]]
oturum = ort.InferenceSession(str(KOK / "model" / "model.onnx"))
sonuc = []
for g in GIRDILER:
    p = oturum.run(["probabilities"], {"input": np.array([g], dtype=np.float32)})[0][0][1]
    sonuc.append({"girdi": dict(zip(adlar, g)), "p": round(float(p), 6)})
(KOK / "tests" / "parite.json").write_text(json.dumps(sonuc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(sonuc, ensure_ascii=False))
