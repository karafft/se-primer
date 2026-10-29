# SE Primer · Nöbetçi Mühendis

Kişiye uyum sağlayan bir kitap, bu kez yazılım mühendisi için: oyuncu karar verir, uygulama o kararın teknik sonucunu gösterir.

> **"08:00, randevu sistemi çöktü. Nöbetçi sensin."** 300 hasta bekliyor. Üç karar (mimari, test, KVKK), iki son. AI tutor cevabı söylemez, sorar.

YZM301 · Ödev 1

## Linkler

| | |
|---|---|
| AI Studio uygulaması | https://ai.studio/apps/81c335ee-e5d5-40e1-bfd6-0d604951e640 |
| 60 sn demo video | https://youtu.be/emrkpLx8I1k |

## Teslim → kanıt

| Teslim | Nerede |
|--------|--------|
| spec.md | [spec.md](spec.md): problem, başarı ölçütü, kapsam dışı, 5 kabul örneği, akış şeması |
| Tasarım | [design/stitch/](design/stitch/) (3 ekran), [DESIGN.md](DESIGN.md), durum makinesi: [spec.md §7](spec.md#7-akış-şeması-durum-makinesi) |
| Çalışan uygulama | AI Studio linki (yukarıda) |
| Tutor eval | [eval/](eval/README.md): 20 öğrenci cevabı, hata kategorileri, [REPORT.md](eval/REPORT.md) |
| Cypress demo | [cypress/e2e/](cypress/e2e/): 8 yolun hepsi + kişiselleştirme + tutor (18 test), video: [docs/demo.mp4](docs/demo.mp4) |
| Ürün kararı | aşağıda |

## Ürün kararı: yapmadığım 3 özellik

1. **Kullanıcı hesabı ve ilerleme kaydı:** 5 dakikalık tek oturumluk bir deneyimde hesap, öğrenmeye bir şey katmadan giriş sürtünmesi ve saklanması gereken kişisel veri getirir.
2. **İkinci bölüm / aynı krizi başka bir rolle oynamak:** Tutor'un tek bölümde bile Sokratik kaldığını ölçmeden içeriği çoğaltmak, ölçülmemiş riski çoğaltmak olur.
3. **Serbest metinle karar verme:** Sonuçlar deterministik bir durum makinesinden geldiği için her yol test edilebilir; serbest metni AI'a puanlatmak sonuçları test edilemez hale getirir ve ayrı bir eval ister.

## Nasıl çalışıyor

- **Anlatı bir durum makinesi:** her sahne bir durum, her seçim bir geçiş, her son bir kabul kriteri ([game/engine.ts](game/engine.ts)). Bu yüzden 8 yolun hepsi test edilebiliyor.
- **Kişiselleştirme:** "Yeni başladım" her kararda ipucu görür; "Deneyimliyim" 60 saniyelik süreyle oynar, süre dolarsa ekip B'yi seçer. Rol giriş metnini, hedef ilgili karardaki "Derinleş" bölümünü değiştirir.
- **Tutor:** Gemini, cevabı söylemeyen bir sistem talimatıyla çalışır. Çıktı ayrıca `detectLeak()` ile taranır; ele verme şüphesi varsa yerine hazır bir Sokratik soru gösterilir. Tutor oyunun sonucunu değiştiremez. Anahtar yoksa çevrimdışı moda düşer.

## Çalıştırma

```bash
npm install
```

`.env.example` dosyasını `.env.local` olarak kopyalayıp `GEMINI_API_KEY` değerini yaz (isteğe bağlı; yoksa tutor çevrimdışı çalışır).

```bash
npm run dev
```

Testler ve demo videosu:

```bash
npm run test:e2e
```

```bash
npm run demo
```

Tutor eval:

```bash
npm run eval
```

`eval/results/labels.csv` dosyasında `leak` ve `category` sütunları elle doldurulur, sonra:

```bash
npm run eval:report
```

## Arkadaş testi

- Oynayan: Volkan (sınıf arkadaşı), AI Studio linkinden, telefonda
- Süre: **TODO** dk
- İlk takıldığı yer: Karar 2 · Test. Sonunda SON A ile bitirdi (08:25).
- spec.md'ye eklenen kabul örneği: **TODO (KÖ-6)**

## Kaynakça

- Stephenson, N. (1995). *The Diamond Age: Or, A Young Lady's Illustrated Primer.*
- Y Combinator (2026). Requests for Startups, Güz 2026: "The Primer".
- GitHub (2025). Spec Kit: spec-driven development.
- Sommerville, I. (2016). *Software Engineering* (10. baskı), Bölüm 5: durum makineleri.
- 6698 sayılı Kişisel Verilerin Korunması Kanunu (2016), m.6 ve m.12.
- OpenAI (2025). Introducing study mode.
- Cypress. E2E testing, screenshots and videos. docs.cypress.io
