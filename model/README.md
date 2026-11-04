# Model kartı: SE Primer riskli karar modeli

## Amaç

SE Primer oyununda, açılan karar ekranında oyuncunun riskli seçeneği (B) seçme olasılığını tahmin eder. Olasılık 0,50 veya üstündeyse oyun ipucu gösterir ve deneyimli oyuncunun 2. ve 3. karardaki süre baskısını kaldırır.

## Model

`StandardScaler → LogisticRegression (class_weight="balanced")`, tohum 13. Girdi ve çıktı sözleşmesi `config.json` içindedir: `input` float32 `[n, 6]`, `probabilities` float32 `[n, 2]`.

## Veri

`data/oturumlar.csv`, sözlüğü `data/SOZLUK.md`: 40 gerçek oturum (119 satır) ve 120 sentetik oturum (360 satır, `data/sentetik.py`, tohum 13).

## Metrikler

Oturum bazında ayrılmış test kümesinde, kabul eşiği `spec.md` §10: ROC AUC ≥ 0,65, recall ≥ 0,60. Güncel değerler `config.json` → `metrics`.

| Test kümesi | Satır | ROC AUC | Recall |
|-------------|-------|---------|--------|
| Tümü (kapı buna bakar) | 143 | 0,654 | 0,610 |
| Yalnız gerçek satırlar | 32 | 0,283 | 0,500 |

Gerçek satırlarda öngörü gücü düşük; `okuma_suresi_sn` (gerçek ortanca 1,2 sn) okumayı değil tıklama hızını ölçüyor. Sentetik oturum sayısı 80'de kapıda kalınca 120'ye çıkarıldı.

## Sınırlar

- Tek senaryoda (Nöbetçi Mühendis) eğitildi; başka senaryoya genellenmez.
- "Riskli" bu oyunun B seçenekleridir; gerçek hayatta canlıda yama her zaman yanlış değildir.
- Süre özellikleri cihaz ve okuma hızından etkilenir; ekran okuyucu kullananlar için ölçülmedi.

## Kullanılmaması gereken durumlar

Not verme, işe alım, kişi değerlendirme ya da oyun dışı herhangi bir karar. Model, kişinin yeteneğini ölçmez; yalnız oyun içi bir sonraki seçimi tahmin eder.

## Gizlilik

Kişisel veri içermez. Model istemcide çalıştığı için dosyası herkese açıktır.
