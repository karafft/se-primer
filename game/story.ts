// Bölüm içeriği. Süre ve son kuralları spec.md §4 "Sonuç tablosu" ile birebir aynıdır.
import type { Choice, Consequence, Decision, DecisionId, Level, Role } from './types.ts';

export const TITLE = 'Nöbetçi Mühendis';
export const START_MINUTES = 8 * 60;
export const DECISION_SECONDS = 60;

export const LEVELS: Record<Level, string> = {
  yeni: 'Yeni başladım',
  orta: 'Biraz deneyimim var',
  deneyimli: 'Deneyimliyim',
};

export const ROLES: Record<Role, string> = {
  backend: 'Backend geliştirici',
  test: 'Test uzmanı',
  devops: 'DevOps / nöbetçi',
};

export const GOALS: Record<DecisionId, string> = {
  mimari: 'Mimari',
  test: 'Test',
  kvkk: 'KVKK / güvenlik',
};

export const INTRO =
  'Pazartesi, 08:00. Dün gece randevu sisteminin v2.4 sürümü yayına çıktı. ' +
  'Şimdi randevu API\'si 500 dönüyor ve 300 hasta ekranın önünde bekliyor. Telefonun çalıyor: nöbetçi sensin.';

export const ROLE_INTRO: Record<Role, string> = {
  backend: 'Randevu servisinin kodunu sen yazdın; stack trace\'i ilk okuyacak kişi sensin.',
  test: 'Dünkü sürümün regresyon testlerini sen imzaladın; neyin test edilmediğini en iyi sen bilirsin.',
  devops: 'Bu hafta nöbet sende; dağıtım hattının anahtarı senin elinde.',
};

export const DECISION_ORDER: DecisionId[] = ['mimari', 'test', 'kvkk'];

export const DECISIONS: Record<DecisionId, Decision> = {
  mimari: {
    id: 'mimari',
    label: 'Karar 1 · Mimari',
    prompt: 'Randevu API\'si çöktü. Loglar v2.4 ile gelen yeni bir sorguyu işaret ediyor. İlk hamlen ne?',
    options: { A: 'Eski sürüme (v2.3) geri dön', B: 'Canlıda yama yap' },
    hint: 'Geri dönüşün güvenli olup olmadığı, yeni sürümün veritabanı şemasını değiştirip değiştirmediğine bağlı. Migration dosyalarına bak.',
    tutorOpening: 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?',
  },
  test: {
    id: 'test',
    label: 'Karar 2 · Test',
    prompt: 'Düzeltme hazır. Ekip "hemen basalım" diyor; hastane müdürü her dakika arıyor. Yayına almadan önce?',
    options: { A: 'Önce kısa smoke test koş', B: 'Hemen yayına al' },
    hint: 'Smoke test en kritik yolu (randevu al → iptal et → SMS onayı) birkaç dakikada dener. Kaç dakika kazanırsın, neyi riske atarsın?',
    tutorOpening: 'Bu düzeltmenin neyi bozabileceğini yayından önce en hızlı nasıl öğrenirsin?',
  },
  kvkk: {
    id: 'kvkk',
    label: 'Karar 3 · KVKK',
    prompt: 'Kök nedeni bulmak için hata logunu ekip kanalına (40 kişi) atman gerekiyor. Logda şunu görüyorsun:',
    log: '08:03:12 ERROR appointment.create failed\n  patient_name="Ayşe Yılmaz" tckn="12345678901"\n  clinic="Kardiyoloji" slot="2026-10-26T09:30"',
    options: { A: 'Maskele, sonra paylaş', B: 'Ekibe olduğu gibi at' },
    hint: 'Sağlık verisi KVKK\'da özel nitelikli kişisel veridir. Logu okuyacak kişinin hatayı bulmak için adı görmesi gerekiyor mu?',
    tutorOpening: 'Bu logu okuyacak kişinin işini yapması için hangi alanlara gerçekten ihtiyacı var?',
  },
};

type Choices = Partial<Record<DecisionId, Choice>>;

export function consequence(id: DecisionId, choices: Choices): Consequence {
  const c = choices[id];
  if (id === 'mimari') {
    return c === 'A'
      ? {
          what: 'v2.3\'e geri döndün. 20 dakikada randevu API\'si yeniden 200 dönmeye başladı.',
          why: 'v2.4\'ün migration\'ı yalnızca yeni bir kolon ekliyordu (geriye uyumlu). Eski kod yeni kolonu görmezden geldi. Şema geriye uyumlu olmasaydı rollback veri kaybettirirdi: geri dönülebilirlik kodda değil, mimaride başlar.',
          minutes: 20,
        }
      : {
          what: 'Canlıda yama yapmaya karar verdin. Hatanın yerini bulup düzeltmek 35 dakika sürdü; hastalar bu sürede randevu alamadı.',
          why: 'Kriz anında tanı ve düzeltme sırayla yapılır, ikisi de belirsizdir. Geri dönüş ise bilinen-iyi duruma tek adımda gider. Önce hizmeti kurtar, kök nedeni sonra ara.',
          minutes: 35,
        };
  }
  if (id === 'test') {
    const rolledBack = choices.mimari === 'A';
    if (rolledBack) {
      return c === 'A'
        ? {
            what: 'Smoke test 5 dakikada geçti: randevu al, iptal et, SMS onayı.',
            why: 'Geri döndüğün sürüm bilinen-iyi, ama ortam (config, şema) değişmiş olabilir. Kısa test bunu kanıtladı; artık "çalışıyor" demek için bir dayanağın var.',
            minutes: 5,
          }
        : {
            what: 'Doğrudan yayına aldın; bu kez sorun çıkmadı.',
            why: 'Bilinen-iyi sürüme dönmek riski düşürür ama sıfırlamaz. Şanslıydın: doğrulamadığın şeyin çalıştığını bilmiyorsun, sadece umuyorsun.',
            minutes: 0,
          };
    }
    return c === 'A'
      ? {
          what: 'Smoke test, yamanın saat dilimi hatası yaptığını yakaladı: randevular 3 saat kaymıştı. Düzeltip tekrar test ettin (+10 dk).',
          why: 'Baskı altında yazılan yama en riskli koddur. Test, hatayı hastadan önce gördü.',
          minutes: 10,
        }
      : {
          what: 'Yama yayına çıktı ve 08:35\'te sistem yeniden çöktü: randevu saatleri 3 saat kaymıştı. 30 dakika daha kayıp.',
          why: 'Test edilmemiş yama ikinci bir olay yarattı. Hız kazanmak için atladığın test, toplam kesintiyi uzattı.',
          minutes: 30,
        };
  }
  return c === 'A'
    ? {
        what: 'Logdaki ad ve TC kimlik numarasını maskeledin (patient_name="A*** Y***", tckn="*******8901"), sonra paylaştın. Ekip hatayı yine buldu.',
        why: 'Hatayı ayıklamak için hasta kimliği gerekmez; istek kimliği ve zaman damgası yeter. Veri minimizasyonu hem KVKK gereği hem iyi mühendislik.',
        minutes: 0,
      }
    : {
        what: 'Logu olduğu gibi ekip kanalına attın. 40 kişilik kanalda hastanın adı ve TC numarası artık açık.',
        why: 'Sağlık verisi özel nitelikli kişisel veridir (KVKK m.6) ve veri sorumlusu güvenlik tedbiri almakla yükümlüdür (m.12). Ekip içinde bile "bilmesi gereken" ilkesi geçerli; mesaj silinse de kopyalar kalabilir.',
        minutes: 0,
      };
}

export const DEEP_DIVE: Record<DecisionId, string> = {
  mimari:
    'Expand/contract migration: önce yeni kolonu ekle (geriye uyumlu), kod ikisini de okusun, eski kolonu ancak bir sonraki sürümde kaldır. Böylece her sürüm geri alınabilir kalır. Dağıtımı şema değişikliğinden ayırmak bir mimari karardır.',
  test:
    'Kriz anında tam regresyon koşulmaz; en değerli 3–5 senaryodan oluşan bir smoke suite koşulur. O suite\'i krizden önce yazmak, test piramidinin tepesine yapılan yatırımdır.',
  kvkk:
    'Loglama da kişisel veri işlemedir. Maskeleme, alan bazlı redaksiyon ve log erişiminin kısıtlanması m.12\'deki "teknik ve idari tedbir"lerdendir. En iyisi: hassas alanı loga hiç yazmamak.',
};

export const ENDINGS = {
  A: { title: 'SON A · İYİ', headline: (time: string) => `${time} sistem ayakta, veri güvende.` },
  B: { title: 'SON B · KÖTÜ', headline: (_time: string) => 'Sistem ayakta ama KVKK ihlali.' },
};

export const TIMEOUT_NOTE = 'Süre doldu, karar veremedin: ekip en hızlı görünen yolu (B) seçti.';
