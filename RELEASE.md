# Sürüm notları

## v2.0

**Ne değişti:** v1'de uyum yalnız girişte beyan edilen seviyeye bağlı sabit kurallardı. v2'de oyuncunun davranışından öğrenen küçük bir model (`model/`) karar ekranında ipucu gösterir ve süre baskısını kaldırır. Sabit kurallar yedek olarak durur.

**Model reposu:** https://huggingface.co/karaft/se-primer-risk · **Sabitlenen commit:** `45f9e3d7684900fac76dd9b51ee024cb505113c5`

```
https://huggingface.co/karaft/se-primer-risk/resolve/45f9e3d7684900fac76dd9b51ee024cb505113c5/model.onnx
https://huggingface.co/karaft/se-primer-risk/resolve/45f9e3d7684900fac76dd9b51ee024cb505113c5/config.json
```

## Geri alma (rollback)

| Ortam | Adım | Süre |
|-------|------|------|
| Web | `uyum/model.ts` içindeki `HF_TABAN` önceki commit'e alınır, push edilir, Pages yeniden yayınlar | Dakikalar |
| Web, modeli tamamen kapatma | `HF_TABAN` boş bırakılıp `public/model/` silinir; yüklenemeyen model durumunda oyun §5 kurallarıyla sürer | Dakikalar |
| Mobil | Model APK'ya gömülü olduğu için önceki model `mobile/assets/model/` altına konup APK yeniden derlenir | Derleme + yeniden kurulum |

Geri almayı tetikleyen durum: Parite testi kalırsa ya da gerçek oyuncularda ipucu gösterilme oranı beklenmedik biçimde %90'ın üstüne çıkar veya %5'in altına düşerse.

## Yeni sürümü güvenle devreye alma

Bu uygulamada sunucu yok. Bu yüzden adımlar istemcide işler ve ölçüm oyun sonu dışa aktarılan CSV ile yapılır.

1. **Shadow (gölge):** Yeni model mevcut modelle birlikte çalışır, olasılığı kaydedilir ama oyunu etkilemez. Veri toplama oturumlarında iki modelin kararları karşılaştırılır.
2. **Canary (%5):** Oturum başında üretilen rastgele sayı 0,05'in altındaysa yeni model kullanılır. Oturum sayımız küçük olduğu için %5 pratikte tek tük oturum demektir; bu ölçekte canary güvenlik ağıdan çok süreç provasıdır.
3. **Aşamalı geçiş:** %25 → %50 → %100. Her aşamada müdahale oranı ve kötü sona gitme oranı önceki sürümle karşılaştırılır.

Bu adımlar **plandır**, v2.0 için uygulanmadı: v2.0 ilk modeldir ve kıyaslanacak önceki model yoktur.

## Mimari karar ve ödünleşim matrisi

**Karar:** Tarayıcı (`onnxruntime-web`) ve cihaz içi mobil (`onnxruntime-react-native`, gömülü). Sunucu kullanılmıyor.

| Soru | Tarayıcı | Cihaz içi mobil | Kendi sunucu (kullanılmadı) |
|------|----------|-----------------|------------------------------|
| İnternet zorunlu mu, gecikme? | İlk açılışta model ve WASM iner; sonra tahmin yereldir | Gerekmez, tahmin yereldir | Her tahminde ağ gecikmesi; ağ yoksa çalışmaz |
| Veri cihazdan çıkar mı? | Hayır | Hayır | Evet; KVKK yükü doğar |
| Model gizli kalır mı? | Hayır, dosya herkese açık | Hayır, APK'dan çıkarılabilir | Evet, ama istek-yanıtla tersine mühendislik riski kalır |
| Güncelleme | Commit değişir, anında | APK yeniden kurulur | Sunucuda anında |

**Neden bu karar:** Model kişisel veri içermiyor ve gizli tutulması gereken bir değeri yok, bu yüzden açık olması sorun değil. Karşılığında davranış verisi cihazdan çıkmıyor ve ücretsiz çalışıyor. Bedeli: mobilde model güncellemek APK gerektirir.

## Kaynaklar

- Amershi vd. (2019), *Software Engineering for Machine Learning: A Case Study*: veri toplamadan izlemeye dönen yaşam döngüsü.
- Shankar vd. (2022), *Operationalizing Machine Learning*: Velocity, Validation, Versioning.
- Mitchell vd. (2019), *Model Cards for Model Reporting*: `model/README.md` yapısı.
- Hugging Face Hub belgeleri: `resolve/<revision>` URL'leri.
