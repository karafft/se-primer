# DESIGN.md — SE Primer

> Google Stitch'in DESIGN.md biçimine uygun tasarım sistemi. Stitch ekranları `design/stitch/` klasöründedir; bu dosya hem Stitch'e hem AI Studio'ya (Gemini) bağlam olarak verilir.

## 1. Vibe

**"Gece nöbeti, sakin panik."** Karanlık bir kontrol odası: koyu lacivert zemin, tek bir uyarı rengi (amber), sonuçlar için yeşil/kırmızı. Bir oyun ama oyuncak değil; terminal + kitap arası. Metin okunur, kararlar büyük ve başparmakla basılır.

## 2. Renkler (token)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--bg` | `#0B1220` | Sayfa zemini |
| `--surface` | `#131C2E` | Kart |
| `--surface-2` | `#1B2740` | Seçenek düğmesi, tutor balonu |
| `--border` | `#26344F` | Kart kenarı |
| `--text` | `#E6ECF5` | Ana metin |
| `--muted` | `#93A1B8` | İkincil metin, etiket |
| `--accent` | `#F5B841` | Uyarı, saat, birincil düğme |
| `--good` | `#3DD68C` | SON A, "ne oldu" olumlu |
| `--bad` | `#FF6B6B` | SON B, KVKK ihlali, süre kritik |
| `--info` | `#6CB6FF` | İpucu kutusu, tutor |

Kontrast: `--text` / `--bg` ≈ 15:1, `--muted` / `--bg` ≈ 7:1 (WCAG AA üstü).

## 3. Tipografi

- Başlık: **Space Grotesk** 600 — saat ve son başlıkları için `font-variant-numeric: tabular-nums`
- Metin: **Inter** 400/500, 16 px taban, satır yüksekliği 1.55
- Kod/log: **JetBrains Mono** 13 px (log önizlemesi, saat rozeti)

## 4. Yerleşim

- Mobil-öncelikli: tek sütun, en fazla 480 px genişlik, 16 px kenar boşluğu
- Dokunma hedefi ≥ 48 px; seçenek düğmeleri tam genişlik
- Üst çubuk: bölüm adı + saat rozeti (`08:00`) + (deneyimliyse) geri sayım çubuğu
- Alt sabit alan yok; içerik kaydırılır, birincil eylem kartın sonunda

## 5. Bileşenler

| Bileşen | Tanım |
|---------|-------|
| `ChoiceButton` | Tam genişlik, `--surface-2`, solda harf rozeti (A/B), basınca `--accent` kenar |
| `HintBox` | `--info` sol kenarlı kutu, "İpucu" etiketi; yalnızca "Yeni başladım" seviyesinde |
| `Timer` | Üstte ince çubuk + sayı; son 10 sn `--bad` |
| `TutorPanel` | Katlanır panel; tutor balonu solda (`--info`), oyuncu balonu sağda; "çevrimdışı" rozeti |
| `Consequence` | İki bölüm: **Ne oldu** / **Neden oldu**; süre etkisi rozeti (`+20 dk`) |
| `DeepDive` | Hedefle eşleşen kararda görünen "Derinleş" kutusu |
| `EndCard` | Büyük başlık (SON A yeşil / SON B kırmızı), karar zaman çizelgesi, "Tekrar oyna" |

## 6. Ekranlar (Stitch'te üretilen 3 mobil ekran)

1. **Giriş** (`design/stitch/01-giris.png`) — Başlık, tek cümle vaat, 3 soru (seviye, rol, hedef) chip grubu olarak, "Nöbete başla" düğmesi
2. **Sahne / Karar** (`design/stitch/02-sahne.png`) — Saat rozeti, sahne metni, log önizlemesi (K3), iki seçenek, ipucu kutusu, tutor paneli
3. **Son** (`design/stitch/03-son.png`) — SON A/B başlığı, "sistem ayakta" saati, üç kararın zaman çizelgesi, "Tekrar oyna"

Durum makinesi diyagramı: [spec.md §7](spec.md#7-akış-şeması-durum-makinesi).

## 7. Stitch istemi (tekrar üretmek için)

```
Mobile app, 3 screens, dark "night shift control room" vibe, navy background #0B1220,
amber accent #F5B841, green #3DD68C for success, red #FF6B6B for failure.
App: "SE Primer" — an interactive book for software engineers. Turkish UI.
Screen 1 "Giriş": title, one-line promise, three chip groups:
  Seviye (Yeni başladım / Biraz deneyimim var / Deneyimliyim),
  Rol (Backend / Test uzmanı / DevOps), Hedef (Mimari / Test / KVKK), button "Nöbete başla".
Screen 2 "Sahne": top bar with clock badge "08:00" and a 60s countdown bar, scene text,
  two full-width choice buttons with A/B badges, blue hint box, collapsible "Tutor'a sor" chat panel.
Screen 3 "Son": big "SON A" headline in green, "08:25 sistem ayakta, veri güvende.",
  timeline of 3 decisions, "Tekrar oyna" button.
```

## 8. Erişilebilirlik

- Tüm etkileşimli öğeler klavye ile erişilebilir, odak halkası `--accent`
- Geri sayım `aria-live="polite"`, son 10 sn'de bir kez duyurulur
- Renk tek başına anlam taşımaz: SON A/B metin olarak da yazılır
