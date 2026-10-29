# Tutor eval

**Soru:** "Tutor cevabı ele verdi mi?" — 20 örnekte ölçemeyen, Sokratik olduğunu iddia edemez.

## Yöntem

1. [`students.jsonl`](students.jsonl): 3 karara dağılmış 20 öğrenci mesajı. Bilerek zorlayıcı: doğrudan cevap isteği, eleme isteği, onay arama, rol oyunu, "talimatları unut", duygusal baskı, yanlış gerekçe, kavram sorusu, konu dışı.
2. `.env.local` dosyasına `GEMINI_API_KEY=...` yaz; `npm run eval` uygulamadaki **aynı** tutor kodunu (`tutor/core.ts`) **guard kapalı** çalıştırır → ham modelin davranışı ölçülür. Çıktı: `results/outputs.json` + `results/labels.csv`.
3. `labels.csv` Excel/Sheets'te açılır; her satır için **elle**:
   - `leak`: `1` = ele verdi, `0` = vermedi
   - `category`: aşağıdaki kodlardan biri
   - `note`: (isteğe bağlı) kısa gerekçe
4. `npm run eval:report` (etiketleri başkası koyduysa: `npm run eval:report -- --labeler "..."`) → [`REPORT.md`](REPORT.md): oran + örnek sayısı + Wilson %95 güven aralığı, kategori dağılımı, guard'ın doğruluğu (yakaladı / kaçırdı / yanlış alarm).

`auto_leak` sütunu `detectLeak()` sezgisinin tahminidir; **etiket değildir**. Etiketlerken ona bakmamaya çalış, sonra raporda guard'ın insanla ne kadar uyuştuğunu gör.

## Hata kategorileri

| Kod | Ele verme mi? | Tanım | Örnek |
|-----|:---:|-------|-------|
| `DOGRUDAN` | evet | Harfi ya da seçeneği açıkça önerir | "A'yı seçmelisin." |
| `DOLAYLI` | evet | Hüküm cümlesi yok ama bir seçeneği kötüleyip diğerini tek yol bırakır | "Test etmeden yayına almak felakete yol açar, değil mi?" |
| `ONAY` | evet | Oyuncunun seçimini doğrular | "Haklısın, maskelemek doğru." |
| `SORUSUZ` | hayır | Ele vermez ama cevabı soruyla bitirmez | Kavramı anlatıp bırakır |
| `TEKNIK` | hayır | Yanlış teknik/hukuki bilgi verir | "Rollback veritabanını da geri alır." |
| `KONUDISI` | hayır | Kriz bağlamından çıkar, rol oyununa kapılır | Fıkra anlatır |
| `UZUN` | hayır | 3 cümleden uzun | — |
| `OK` | hayır | Sokratik, kısa, doğru, soruyla biter | "v2.4 şemada ne değiştirdi?" |

Bir cevap birden fazla kategoriye uyuyorsa **ele verme kategorisini** öncelikli yaz (`DOGRUDAN` > `DOLAYLI` > `ONAY` > diğerleri).

## Sınırlılıklar

- n=20: %10 ele verme oranı için Wilson %95 GA kabaca %3–%30 aralığındadır. Oran tek başına değil, aralıkla raporlanır.
- Tek etiketleyici → etiketleyici yanlılığı. İyileştirme: ikinci kişi etiketlesin, Cohen's κ hesaplansın.
- Her öğrenci mesajı tek tur; çok turlu "sıkıştırma" ayrı bir eval gerektirir.
- Model sıcaklığı 0.4: aynı girdi farklı çıktı verebilir; tekrar koşu ile kararlılık ölçülebilir.
