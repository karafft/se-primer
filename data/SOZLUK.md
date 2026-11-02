# Veri sözlüğü: `data/oturumlar.csv`

Her satır bir karardır. Özellikler karar ekranı açıldığı anda bilinen değerlerdir.

| Sütun | Anlamı | Birim / değerler |
|-------|--------|------------------|
| `oturum_id` | Rastgele üretilen oturum kimliği; kişiyle bağı yoktur | metin |
| `kaynak` | Satırın kaynağı | `gercek` \| `sentetik` |
| `seviye` | Girişte beyan edilen seviye | 0 yeni, 1 orta, 2 deneyimli |
| `sahne_no` | Karar sırası | 1 mimari, 2 test, 3 KVKK |
| `onceki_yanlis_sayisi` | Bu oturumda daha önce seçilen riskli (B) seçenek sayısı | adet, 0–2 |
| `onceki_karar_suresi_sn` | Önceki kararda ekran açılışından seçime kadar geçen süre; 1. kararda 0 | saniye |
| `okuma_suresi_sn` | Bu karardan hemen önceki ekranda (giriş ya da sonuç) geçen süre | saniye |
| `tutor_kullanim_sayisi` | Bu karar ekranına kadar tutor panelinin açılma sayısı | adet |
| `sure_doldu` | Seçim oyuncudan değil, süre dolmasından geldi; 1 ise eğitime girmez | 0 \| 1 |
| `yanlis_karar` | **Etiket.** Bu kararda riskli seçenek (B) seçildi mi | 0 \| 1 |

**Gizlilik:** Ad, e-posta, cihaz kimliği, konum ve tutor'a yazılan metinler toplanmaz. Rol ve hedef de bu tabloya girmez.
