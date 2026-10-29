# DESIGN.md — SE Primer

> Google Stitch'in DESIGN.md biçimine uygun tasarım sistemi. Stitch ekranları `design/stitch/` klasöründedir; bu dosya hem Stitch'e hem AI Studio'ya (Gemini) bağlam olarak verilir.
> Görsel dil, ekibin kurumsal paneli **r-dash** ile aynıdır: aynı renk token'ları, aynı kart ve düğme biçimi.

## 1. Vibe

**"Kurumsal panel, sakin kriz."** Temiz bir iş uygulaması: açık slate zemin, beyaz kartlar, tek bir kurumsal lacivert. Kriz hissi dekorla değil, içerikle verilir (saat rozeti, kırmızı log, geri sayım). Bir oyun ama oyuncak değil; hastane yazılımının kendi ekranı gibi görünür. Açık mod varsayılan, koyu mod sistem ayarını izler.

## 2. Renkler (token)

| Token | Açık | Koyu | Kullanım |
|-------|------|------|----------|
| `--bg` | `#F8FAFC` | `#0D1117` | Sayfa zemini |
| `--surface` | `#FFFFFF` | `#161B22` | Kart, navbar |
| `--surface-2` | `#F1F5F9` | `#21262D` | Tutor balonu, zaman çizelgesi satırı |
| `--border` | `#E2E8F0` | `#30363D` | Kart ve düğme kenarı |
| `--text` | `#0F172A` | `#F1F5F9` | Ana metin |
| `--text-2` | `#475569` | `#94A3B8` | İkincil metin |
| `--muted` | `#64748B` | `#64748B` | Etiket |
| `--primary` | `#0F4C75` | `#0F4C75` | Birincil düğme, marka rozeti, oyuncu balonu |
| `--primary-text` | `#0F4C75` | `#58A6FF` | Bağlantı, seçili chip, harf rozeti |
| `--good` | `#10B981` | `#059669` | SON A, "Derinleş" |
| `--warn` | `#F59E0B` | `#D97706` | Süre etkisi, geri sayım |
| `--bad` | `#EF4444` | `#DC2626` | SON B, KVKK uyarısı, son 10 sn |
| `--code-bg` | `#0D1117` | `#010409` | Log önizlemesi (her iki modda koyu) |

Kontrast: `--text` / `--bg` her iki modda ≥ 15:1; `--text-2` / `--surface` ≥ 7:1 (WCAG AA üstü).

## 3. Tipografi

- Tek aile: **Inter** — başlık 700 (harf aralığı −0.015em), metin 400/500, taban 15 px, satır yüksekliği 1.6
- Bölüm etiketi (`KARAR 1 · MİMARİ`): 12 px, 600, büyük harf, `--primary-text`
- Kod/log ve saat: **JetBrains Mono** 12–13 px, `tabular-nums`

## 4. Yerleşim

- Mobil-öncelikli: tek sütun, en fazla 480 px genişlik, 16 px kenar boşluğu
- Yapışkan navbar: beyaz zemin + alt kenarlık; solda lacivert "SE Primer" rozeti, ortada bölüm adı, sağda saat rozeti (`08:00`)
- Dokunma hedefi ≥ 44 px; seçenek düğmeleri tam genişlik
- Köşe yarıçapı: kart 16 px, düğme/chip/girdi 12 px, rozet 8 px
- Gölge: yalnızca `shadow-sm`, üzerine gelince `shadow-md`; koyu modda gölge yok, kenarlık yeter

## 5. Bileşenler

| Bileşen | Tanım |
|---------|-------|
| `Navbar` | Yapışkan, `--surface`, alt kenarlık; marka rozeti `--primary` zemin beyaz yazı |
| `ChoiceButton` | Tam genişlik kart düğme, `--surface` + kenarlık; solda `--primary-soft` zeminli harf rozeti (A/B); üzerine gelince lacivert kenar + `shadow-md`, basınca %98 ölçek |
| `Chip` | 12 px yarıçaplı kenarlıklı düğme; seçiliyken `--primary-soft` zemin, lacivert kenar ve yazı |
| `PrimaryButton` | Tam genişlik, `--primary`, beyaz yazı, 600; hover `#0C3C5D` |
| `HintBox` | `--primary-soft` zemin, ince lacivert kenarlık, "İPUCU" etiketi; yalnızca "Yeni başladım" seviyesinde |
| `Timer` | Üstte hap biçimli çubuk, `--warn`; son 10 sn `--bad` |
| `TutorPanel` | Katlanır; tutor balonu solda `--surface-2`, oyuncu balonu sağda `--primary` beyaz yazı; "çevrimdışı" rozeti |
| `Consequence` | **Ne oldu** / **Neden oldu** başlıkları; süre etkisi rozeti (`+20 dk`, `--warn`) |
| `DeepDive` | Yeşil tonlu kutu, hedefle eşleşen kararda görünür |
| `EndCard` | Üstte 4 px renkli şerit (SON A yeşil / SON B kırmızı), büyük başlık, gri satırlı karar zaman çizelgesi, "Tekrar oyna" |

## 6. Ekranlar (Stitch'te üretilen 3 mobil ekran)

1. **Giriş** (`design/stitch/01-giris.png`) — Başlık, tek cümle vaat, 3 soru (seviye, rol, hedef) chip grubu olarak, "Nöbete başla" düğmesi
2. **Sahne / Karar** (`design/stitch/02-sahne.png`) — Saat rozeti, sahne metni, log önizlemesi (K3), iki seçenek, ipucu kutusu, tutor paneli
3. **Son** (`design/stitch/03-son.png`) — SON A/B başlığı, "sistem ayakta" saati, üç kararın zaman çizelgesi, "Tekrar oyna"

Durum makinesi diyagramı: [spec.md §7](spec.md#7-akış-şeması-durum-makinesi).

## 7. Stitch istemi (tekrar üretmek için)

```
Mobile app, 3 screens, Turkish UI. Clean corporate SaaS dashboard style (like a hospital admin panel),
NOT a game look. Light mode.
Design tokens: page background #F8FAFC (slate-50), cards #FFFFFF with 1px border #E2E8F0,
16px corner radius, very subtle shadow (shadow-sm). Single brand color: corporate navy #0F4C75
for primary buttons and accents. Text #0F172A, secondary text #475569. Font: Inter only
(headings bold 700, body 15px). Success #10B981, warning #F59E0B, error #EF4444.
Buttons and chips: 12px radius, primary button full width navy with white semibold text.
Top: sticky white navbar with bottom border, small navy pill logo "SE Primer", title
"Nöbetçi Mühendis", clock badge "08:00" on the right.
App: "SE Primer" — an interactive book for software engineers.
Screen 1 "Giriş": bold title "Kişiye uyum sağlayan kitap, yazılım mühendisi için.", one-line subtitle,
  three groups of outlined chips (selected chip: light navy tint background, navy border and text):
  Seviye (Yeni başladım / Biraz deneyimim var / Deneyimliyim),
  Rol (Backend geliştirici / Test uzmanı / DevOps / nöbetçi), Hedef (Mimari / Test / KVKK / güvenlik),
  navy button "Nöbete başla".
Screen 2 "Sahne": small uppercase navy label "KARAR 1 · MİMARİ", bold question text,
  light navy-tinted hint box labeled "İPUCU", two full-width white card buttons with small
  navy-tinted "A"/"B" badges ("Eski sürüme (v2.3) geri dön", "Canlıda yama yap"),
  below a divider a collapsible "Tutor'a sor" chat: grey tutor bubble on the left, text input and navy "Gönder" button.
Screen 3 "Son": card with a 4px green top stripe, green label "SON A · İYİ",
  bold green headline "08:25 sistem ayakta, veri güvende.", grey text "Kesinti: 25 dk",
  timeline of 3 decisions as light grey rounded rows, navy "Tekrar oyna" button.
```

## 8. Erişilebilirlik

- Tüm etkileşimli öğeler klavye ile erişilebilir, odak halkası `--primary-text`
- Geri sayım `aria-live="polite"`
- Renk tek başına anlam taşımaz: SON A/B metin olarak da yazılır
- Koyu mod `prefers-color-scheme` ile otomatik
