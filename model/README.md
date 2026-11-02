# Model kartı: SE Primer riskli karar modeli

## Amaç

SE Primer oyununda, açılan karar ekranında oyuncunun riskli seçeneği (B) seçme olasılığını tahmin eder. Olasılık 0,50 veya üstündeyse oyun ipucu gösterir ve deneyimli oyuncunun 2. ve 3. karardaki süre baskısını kaldırır.

## Model

`StandardScaler → LogisticRegression (class_weight="balanced")`, tohum 13. Girdi ve çıktı sözleşmesi `config.json` içindedir: `input` float32 `[n, 6]`, `probabilities` float32 `[n, 2]`.

## Veri

`data/oturumlar.csv`, sözlüğü `data/SOZLUK.md`. Gerçek ve sentetik satır sayıları `config.json` → `veri` alanındadır. Sentetik satırlar `data/sentetik.py` kuralıyla üretilir.

**Sınır:** Sentetik veriyle ölçülen metrik, modelin üreticinin kuralını öğrendiğini gösterir; gerçek oyuncu davranışını öngördüğünü göstermez. Asıl değerlendirme gerçek satırlarla yapılmalıdır.

## Metrikler

Oturum bazında ayrılmış test kümesinde ölçülür, güncel değerler `config.json` → `metrics` alanındadır. Kabul eşiği eğitimden önce `spec.md` §10'da yazıldı: ROC AUC ≥ 0,65, recall ≥ 0,60.

## Sınırlar

- Az sayıda oyuncuyla, tek senaryoda (Nöbetçi Mühendis) eğitildi; başka senaryoya genellenmez.
- "Riskli" bu oyunun B seçenekleridir; gerçek hayatta canlıda yama her zaman yanlış değildir.
- Süre özellikleri cihaz ve okuma hızından etkilenir; yavaş okuyan oyuncu "dikkatli" görünebilir, ekran okuyucu kullananlar için ölçülmedi.

## Kullanılmaması gereken durumlar

Not verme, işe alım, kişi değerlendirme ya da oyun dışı herhangi bir karar. Model, kişinin yeteneğini ölçmez; yalnız oyun içi bir sonraki seçimi tahmin eder.

## Gizlilik

Kişisel veri içermez. Model istemcide çalıştığı için dosyası herkese açıktır.
