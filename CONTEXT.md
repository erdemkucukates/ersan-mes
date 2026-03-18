# Ersan MES - Claude Code Bağlam Dosyası

## Proje Özeti
Ersan Endüstriyel Makine San. Tic. Ltd. Şti. için QR tabanlı MES (Manufacturing Execution System) + AS9100 kalite yönetim sistemi.

**Şirket:** Ersan Endüstriyel, Başiskele Sanayi Sitesi 12.Blok No:2, Kocaeli  
**Kalite Sorumlusu:** Erdem Küçükateş  
**Hedef:** AS9100 Rev.D sertifikasyonu, sıfır ekstra personel, QR ile tam izlenebilirlik  
**Sektör:** High Mix / Low Volume CNC talaşlı imalat, 20 kişilik atölye

---

## Teknik Altyapı

| Bileşen | Detay |
|---------|-------|
| **Veritabanı** | Airtable (Base ID: app5LDgJMgocw79Ix) |
| **Frontend** | Vanilla HTML/CSS/JS — tek dosya sayfalar |
| **Hosting** | Netlify (https://ersan-mes.netlify.app) |
| **Backend** | Netlify Functions (/.netlify/functions/) |
| **Repo** | GitHub: erdemkucukates/ersan-mes |
| **CAD** | Fusion 360 + APS API entegrasyonu (Seviye 2 TAMAMLANDI) |
| **PDF Depolama** | Cloudinary (hesap "untrusted" sorunu var — çözülmeli) |
| **Mail** | Airtable Automations (tedarikçi RFQ mailleri) |

---

## Netlify Functions

| Dosya | İşlev |
|-------|-------|
| `airtable.js` | Airtable API proxy (GET/POST/PATCH/DELETE) |
| `claude.js` | Claude Vision API proxy (teknik resim analizi) |
| `upload-pdf.js` | PDF upload → Cloudinary → Airtable attachment |
| `send-rfq.js` | Tedarikçiye RFQ mail gönder |
| `rfq-submit.js` | Tedarikçi form yanıtı kaydet |

**Airtable proxy kullanımı (tüm sayfalarda):**
```javascript
// GET
fetch('/.netlify/functions/airtable?table=TABLO_ADI&pageSize=100')

// POST (kayıt oluştur)
fetch('/.netlify/functions/airtable', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({method: 'POST', path: '/v0/app5LDgJMgocw79Ix/TABLO_ADI', body: {fields: {...}}})
})

// PATCH (güncelle)
fetch('/.netlify/functions/airtable', {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({table: 'TABLO_ADI', id: 'recXXX', fields: {...}})
})

// DELETE
fetch('/.netlify/functions/airtable', {
  method: 'DELETE',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({table: 'TABLO_ADI', id: 'recXXX'})
})
```

---

## Airtable Tablo Yapısı (20 Tablo)

### Çekirdek Tablolar

| Tablo | ID | Açıklama |
|-------|-----|----------|
| Müşteriler | tblPxhjJDEx0fyUQx | Müşteri bilgileri |
| Tedarikçiler (OTL) | tblEI6683Im5AXj36 | Onaylı tedarikçi listesi |
| Personel | tblwG9GqnLC9oFZzb | Çalışanlar |
| Tezgahlar | tblsBXDsWACBAFEJ5 | CNC makineler |
| Lokasyonlar | tbltaEVWPLUwutn9D | Atölye konumları (QR ile) |

### İş Akışı Tabloları

| Tablo | ID | Açıklama |
|-------|-----|----------|
| Teklifler | tblBvcPQjPDdg6N52 | Müşteri teklifleri |
| Teklif Kalemleri | tblqRGCv8yu6zQXZ4 | Teklif satırları |
| Dosya&Projeler | tbl9tSg6MtTFSuj5w | Müşteri dosya/proje numaraları |
| Satış Emirleri | tbl56Oj1nPaqefI60 | SP-2026-001-01 formatında siparişler |
| İş Emirleri | tbl58qL39I2tv8hK4 | IE-2026-00001 formatında iş emirleri |
| Operasyon Rotaları | tblVECelTUG33EYm8 | Op10, Op20... operasyon sırası |

### Üretim Tabloları

| Tablo | ID | Açıklama |
|-------|-----|----------|
| Malzeme Girişleri | tblSj5Ep6F9Ir1NGu | Gelen malzeme kayıtları |
| Lotlar | tbljPBwL1AvdwWeOD | Palet/lot takibi (QR ile) |
| Traveller/WIP | tbljfjpefe5Z03S0a | Üretim hareketi takibi |
| Muayene Kayıtları | tblm47qZunWAsfufH | Kalite kontrol kayıtları |
| NCR Kayıtları | tblreW3hJTIxwXb0K | Uygunsuzluk raporları |

### Satınalma Tabloları

| Tablo | ID | Açıklama |
|-------|-----|----------|
| Satınalma Talepleri | tblHmfCvNZq0qNtb1 | RFQ talepleri |
| Müzakere Kayıtları | tbl7Odd0ZZnEZ8PRP | Fiyat müzakereleri |

### Sistem Tabloları

| Tablo | ID | Açıklama |
|-------|-----|----------|
| System Config | tbl1buK6696eY324j | Fusion 360 token, sistem ayarları |
| AI Öğrenme Örnekleri | tblaIWnf5pFh5oX2r | Teknik resim okuma hata örnekleri |

---

## Önemli Alan Bilgileri

### Satış Emirleri Numaralandırma
- Format: `SP-2026-001-01` (SP + Yıl + Sipariş No + Kalem No)
- SE No: `singleLineText` — KOD TARAFINDAN üretilir, Airtable formula değil
- Kalem Sıra: kalem sırası (1, 2, 3...)
- Teknik Resim: `multipleAttachments` — Cloudinary URL ile

### İş Emirleri Numaralandırma  
- Format: `IE-2026-00001`
- IE No: `formula` — YAZMA YAPMA, Airtable üretiyor
- Sıra No: `autoNumber` — YAZMA YAPMA

### Sipariş Akışı
```
Teklif → Teklif Kalemleri → Satış Emirleri (SP) → İş Emirleri (IE) → Operasyon Rotaları
```

---

## Mevcut HTML Sayfaları

| Dosya | Açıklama | Durum |
|-------|----------|-------|
| index.html | Ana dashboard | ✅ |
| ersan_teklif.html | Teklif yönetimi + sipariş oluşturma | ✅ |
| ersan_siparisler.html | Sipariş yönetimi + PDF viewer | ✅ (zoom sorunu var) |
| ersan_planlama.html | Planlamacı + satınalma talebi | ✅ |
| ersan_satinalma.html | Satınalma yönetimi + RFQ | ✅ |
| ersan_isemirleri.html | İş emirleri yönetimi | ✅ |
| ersan_hesaplama.html | AI teknik resim analizi + maliyet | ✅ |
| ersan_rfq.html | Tedarikçi teklif formu | ✅ |
| ersan_tedarikciler.html | Tedarikçi listesi | 🔄 Placeholder |
| ersan_uretim.html | Üretim/atölye | 🔄 Placeholder |
| ersan_kalite.html | Kalite kontrol | 🔄 Placeholder |
| ersan_sevkiyat.html | Sevkiyat + CoC | 🔄 Placeholder |
| ersan_musteri.html | Müşteri geri bildirimi | 🔄 Placeholder |
| ersan_dokuman.html | Doküman yönetimi | 🔄 Placeholder |
| ersan_denetim.html | İç denetim | 🔄 Placeholder |
| ersan_duzeltici.html | CAPA | 🔄 Placeholder |
| ersan_bakim.html | Ekipman & bakım | 🔄 Placeholder |
| ersan_personel.html | Personel yönetimi | 🔄 Placeholder |
| ersan_egitim.html | Eğitim takibi | 🔄 Placeholder |
| ersan_risk.html | Risk yönetimi | 🔄 Placeholder |
| ersan_isg.html | İSG | 🔄 Placeholder |
| ersan_ygg.html | Yönetim gözden geçirme | 🔄 Placeholder |

---

## Bilinen Sorunlar / Bekleyen İşler

### Kritik
1. **PDF upload sorunu** — Cloudinary hesabı "untrusted", sipariş oluşturma modalından yükleme çalışmıyor. Sipariş ekranındaki buton lokal blob gösteriyor ama Airtable'a kaydolmuyor.
2. **SP gruplaması** — Siparişler listesinde SP-2026-001-01 ve SP-2026-001-02 ayrı satır görünüyor, tek SP-2026-001 olarak gruplandırılmalı, kalemler sağda listelenmeli.
3. **Satınalma talebi** — Siparişler ekranındaki "Satınalma Talebi Oluştur" butonu satınalma sayfasına yönlendiriyor, modal açmalı.

### Orta Öncelik
4. **PDF Zoom** — ersan_siparisler.html'de pdf.js zoom çalışmıyor, sadece "fit" modunda kalıyor
5. **Siparişler sekmesi** — Teklif sayfasındaki Siparişler sekmesi bazen yükleniyor bazen donuyor
6. **Satınalma talebi listesi** — Oluşturulan talepler planlama ekranında SE altında görünmüyor

### Düşük Öncelik
7. Kaydet/Güncelle butonu — sipariş ekranında değişiklikleri kaydetmek için
8. Revizyon bilgisi sipariş ekranında gösterilmeli
9. Tedarikçi portalı (ersan_rfq.html) — çok kalemli, dinamik ölçü alanları, kg hesabı geliştirilmeli

---

## Fusion 360 Entegrasyonu (Seviye 2 - AKTİF)

- **Hub:** ERSAN-ENDUSTRIYEL-IMALAT (ID: a.YnVzaW51c3M6ZXJzYW5tYWtpbUx)
- **Proje:** IMALAT (ID: b.20200122257874876)
- **Token:** System Config tablosunda `FUSION_REFRESH_TOKEN` key'i altında
- **Airtable Automation 6:** İş emri açılınca Fusion'da klasör oluşturuyor
- **Klasör formatı:** IMALAT / {MUSTERI_ADI_TEXT} / {PARCA_NO} / {REVIZYON}

---

## Navigasyon Sistemi

`ersan_nav.js` dosyası tüm sayfalara otomatik ekleniyor. Modül sırası:
1. Teklif Yönetimi
2. Sipariş Yönetimi  
3. Satınalma
4. İş Emirleri
5. Üretim/Atölye
6. Kalite Kontrol
7. Sevkiyat
8. Müşteri Geri Bildirimi
9. Doküman Yönetimi
10. İç Denetim
11. Düzeltici Faaliyet
12. Ekipman & Bakım
13. Personel Yönetimi
14. Eğitim
15. Risk Yönetimi
16. İSG
17. Yönetim Gözden Geçirme
18. Tedarikçiler

---

## Çevre Değişkenleri (Netlify)

```
AIRTABLE_TOKEN=[Netlify env var olarak saklanıyor]
ANTHROPIC_API_KEY=[Netlify env var olarak saklanıyor]
CLOUDINARY_CLOUD_NAME=dyzeewklc
CLOUDINARY_API_KEY=[Netlify env var olarak saklanıyor]
CLOUDINARY_API_SECRET=[Netlify env var olarak saklanıyor]
AIRTABLE_BASE_ID=app5LDgJMgocw79Ix
```

---

## Tasarım Prensipleri

- Tüm sayfalar tek HTML dosyası (CSS + JS inline)
- IBM Plex Sans / IBM Plex Mono fontları
- Renk paleti: #1a1d23 (koyu), #7c3aed (mor/vurgu), #e2e5ea (border)
- Sol panel liste, sağ panel detay layout
- Tüm değişiklikler Airtable'a anında kaydedilir
- Token veya hassas bilgi HTML içine yazılmaz — Netlify Functions üzerinden

---

## Kodlama Kuralları

1. Airtable'a yazılmayacak alanlar: `IE No` (formula), `Sıra No` (autoNumber), `Teklif No` (formula)
2. SP numarası kod tarafından üretilir: `SP-{YIL}-{SIPARIS_NO_3HANE}-{KALEM_NO_2HANE}`
3. Tüm API çağrıları `/.netlify/functions/airtable` üzerinden
4. `node --check` ile syntax kontrolü yapılır push'tan önce
5. Git push öncesi `git pull --rebase origin main`
