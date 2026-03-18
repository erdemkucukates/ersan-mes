Kullanıcının belirttiği dosyayı düzelt.

Argüman: $ARGUMENTS (dosya adı veya yolu)

Adımlar:

1. Dosyayı oku ve tüm içeriğini analiz et.

2. Şu sorunları ara:
   - JavaScript syntax hataları
   - Tanımsız değişken veya fonksiyon referansları
   - Airtable alan adı hataları (IE No, Sıra No, Teklif No gibi read-only alanlara yazma girişimi)
   - Token veya API key'in HTML içine yazılması
   - Hatalı API endpoint kullanımı (/.netlify/functions/airtable dışında doğrudan Airtable çağrısı)
   - Kırık event listener'lar veya DOM referansları
   - CSS sorunları (eksik kapatma, geçersiz property)

3. Bulunan her sorunu düzelt.

4. Düzeltme sonrası `node --check <dosya>` ile syntax kontrolü yap.

5. Yapılan değişikliklerin kısa özetini kullanıcıya bildir.
