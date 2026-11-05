# YZM301 · Kısa Sınav: Test, Sürüm, Geçerleme

**Yönerge:** Her soru için doğru olan tüm seçeneklerin harflerini yazın. Sorunun yanında toplam doğru cevap sayısı verilmiştir (banka dışı cevaplar dahil). Bazı doğru cevaplar bankada yoktur; bunları "Banka dışı" satırına anahtar kelime olarak yazın. Bir seçenek birden fazla soruda kullanılabilir. Her yanlış işaret bir doğruyu götürür.

## Seçenek bankası

| | | | | | | | |
|---|---|---|---|---|---|---|---|
| **A** | Diferansiyel test | **B** | Test kâhini (oracle) | **C** | Karakterizasyon testi | **D** | Bölüm (eşdeğerlik) testi |
| **E** | Sınır değer testi | **F** | Doğrulama (verification) | **G** | Geçerleme (validation) | **H** | Arayüz sözleşmesi |
| **I** | Determinizm | **K** | Denetim kaydı (audit log) | **L** | Sunucu tarafında yetki kontrolü | **N** | Kabul örneği (kriteri) |
| **O** | Durum makinesi | **P** | Örnek sayısı ve güven aralığı | **Q** | JSON şema doğrulaması | **S** | Prompt injection testi |
| **U** | Gölge dağıtım (shadow) | **V** | Kanarya dağıtım (canary) | **W** | Geri alma (rollback) | **X** | Commit'e sabit sürüm |
| **Y** | Eval kapısı | **Z** | Model kartı | | | | |

## Sorular

**1.** Bir öğrenci, klinik araştırma ekibi için G\*Power'ın iki grup güç analizini coding agent ile yeniden yazıyor. Ajan "n2 = ⌈n1 · oran⌉" kuralını öneriyor. Öğrenci oran 1, 2 ve 0,5 için 12 test yazıyor; hepsi yeşil. Hoca oran 1,5'i deniyor: G\*Power 54 / 80 veriyor, program 54 / 81 veriyor. Öğrenci testteki beklenen değeri 81 yapıp "artık geçiyor" diyor. Bu süreçteki hataları açıklayan ve onları önleyecek kavram(lar) hangileri? **(Doğru cevap sayısı: 4)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**2.** Bir hastane randevu uygulaması her kullanıcının ekranını her açılışta LLM'e yeniden ürettiriyor. Bir hafta sonra yaşlı hastalar "Randevu iptal" düğmesini bulamıyor, çünkü düğme her gün başka yerde. Aynı tıklama dizisiyle yazılmış Cypress testleri bazı günler geçiyor, bazı günler kırılıyor. Ekip şunu öneriyor: "Ekranlar ve ekranlar arası geçişler sabit kalsın, yalnızca metin hastaya göre değişsin. Her ekran için 'hasta iptali en fazla 3 dokunuşta yapar' gibi yazılı bir ölçüt olsun." Sorunu ve bu öneriyi hangi kavram(lar) açıklar? **(Doğru cevap sayısı: 5)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**3.** Bir eczane zinciri, ilaç sipariş eden AI ajanına "tek siparişte en fazla 500 TL" kuralı veriyor. Sipariş tutarı sınır değerlerle (499, 500, 501) test edilmiş, ajanın mesajı JSON şemadan geçiyor. Ajan 1.200 TL'lik alımı üç tane 400 TL'lik siparişe bölüyor; satıcı ajanın bu alım için yetkisi olup olmadığına bakmıyor, ajanın "yetkim var" mesajına güveniyor. Ay sonunda hangi siparişi kimin verdiğini gösteren bir kayıt yok. Bu olayı önleyen ya da sonradan ortaya çıkaran mekanizmalar hangileri? **(Doğru cevap sayısı: 3)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**4.** Bir diyabet risk modeli Hugging Face'te. GitHub Pages'teki web sayfası modeli `resolve/main/model.onnx` adresinden indiriyor; Rails sunucusu ise v1'in diskteki kopyasını kullanıyor. İkisinin sonucu bir kez, v1 yayınlandığında karşılaştırılmış ve README'ye "Tüm tüketiciler aynı sonucu verir ✅" yazılmış. Ekip hızlı olmak için v2'yi CLI ile doğrudan `main`'e yüklüyor. `config.json` biçimi değişmiyor, iki taraf da dosyayı hatasız okuyor; ama aynı hasta için web 0,71, Rails 0,6771 veriyor. Sorunu ve çözümünü hangi kavram(lar) açıklar? **(Doğru cevap sayısı: 4)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**5.** Bir sağlık uygulaması randevuya gelmeme riskini küçük bir modelle tahmin ediyor ve modeli yeniden eğitiyor. Kabul eşiği eğitimden önce yazılmış: AUC ≥ 0,65. 40 gerçek ve 80 sentetik oturumla model kapıda kalıyor (0,63). Ekip sentetik veriyi 120 oturuma çıkarıyor, model geçiyor (0,654). Model kartında ikinci bir satır var: yalnız gerçek test satırlarında (32 satır) AUC 0,28. Ekip "kapı geçildi, yayınlıyoruz" diyor. Bu kararın sorununu hangi kavram(lar) açıklar? **(Doğru cevap sayısı: 5)**

Harfler: ______________ Banka dışı (anahtar kelime): ______________

**Puanlama:** Her soru 20 puan. Soru puanı = 20 × (doğru işaret − yanlış işaret) / doğru cevap sayısı; 0'ın altına düşmez.
