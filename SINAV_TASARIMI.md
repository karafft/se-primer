# YZM301 · Kısa Sınav: Yayın, Sürüm, Geçerleme

**Yönerge:** Her soru için doğru olan tüm seçeneklerin harflerini yazın. Sorunun yanında toplam doğru cevap sayısı verilmiştir. Bazı doğru cevaplar bankada yoktur; bunları "Banka dışı" satırına anahtar kelime olarak yazın. Her yanlış işaret bir doğruyu götürür.

## Seçenek bankası

| | | | | | | | |
|---|---|---|---|---|---|---|---|
| **A** | Diferansiyel test | **B** | Test kâhini (oracle) | **F** | Doğrulama (verification) | **G** | Geçerleme (validation) |
| **H** | Arayüz sözleşmesi | **I** | Determinizm | **N** | Kabul örneği | **P** | Örnek sayısı ve güven aralığı |
| **Q** | JSON şema doğrulaması | **U** | Gölge dağıtım (shadow) | **V** | Kanarya dağıtım (canary) | **W** | Geri alma (rollback) |
| **X** | Commit'e sabit sürüm | **Y** | Eval kapısı | **Z** | Model kartı | **E** | Sınır değer testi |

## Sorular

**1.** Bir sağlık uygulaması, hastanın randevuya gelmeme riskini cihaz içinde çalışan küçük bir modelle tahmin ediyor. Uygulama modeli her açılışta Hugging Face'teki `main` dalından indiriyor. Bir geliştirici cuma akşamı yeni modeli `main`'e yüklüyor; sabaha kadar bütün kullanıcılar farklı hatırlatma alıyor ve önceki modelin hangisi olduğunu kimse bilmiyor. Bu kazayı **önleyen ya da etkisini sınırlayan** mekanizmalar hangileri? **(Doğru cevap sayısı: 5)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**2.** Aynı ekip modeli yeniden eğitiyor. Kabul eşiği eğitimden önce yazılmış: AUC ≥ 0,65. 40 gerçek ve 80 sentetik oturumla model kapıda kalıyor (0,63). Ekip sentetik veriyi 120 oturuma çıkarıyor, model geçiyor (0,654). Model kartında ikinci bir satır var: yalnız gerçek test satırlarında (32 satır) AUC 0,28. Ekip "kapı geçildi, yayınlıyoruz" diyor. Bu kararın sorununu **hangi kavram(lar)** açıklar? **(Doğru cevap sayısı: 5)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**Puanlama:** Her soru 50 puan. Soru puanı = 50 × (doğru işaret − yanlış işaret) / doğru cevap sayısı; 0'ın altına düşmez.

---

## Cevap anahtarı (öğretmen için)

| Soru | Harfler | Banka dışı | Çeldirici |
|------|---------|------------|-----------|
| 1 | X, U, V, W | Aşamalı geçiş | A, B |
| 2 | G, P, Y, Z | Goodhart yasası | F |

**Tasarım gerekçesi:** Çeldiriciler doğru ama bu soruya ait olmayan kavramlardır. Parite testi (A, B) iki ortamın aynı modelden aynı sonucu verdiğini gösterir, yanlış sürümü yakalamaz. Doğrulama (F) 2. soruda geçmiştir (ONNX ile sklearn farkı 1e-7); sorun geçerlemededir. Öğrenci kavramı tanımakla kalmaz, hangi sorunu hangi kavramın çözdüğünü ayırt eder. 2. soru bu ödevde yaşanan durumdur.
