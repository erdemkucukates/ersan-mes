const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;
const CORS  = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
const ATH = {
  'Authorization': 'Bearer ' + TOKEN,
  'Content-Type':  'application/json',
};

// Airtable'dan kayitlari cek (pagination destekli)
async function airtableCek(tablo, filtre) {
  var tumKayitlar = [];
  var offset = '';
  do {
    var url = 'https://api.airtable.com/v0/' + BASE + '/' + encodeURIComponent(tablo) + '?pageSize=100';
    if (filtre) url += '&filterByFormula=' + encodeURIComponent(filtre);
    if (offset) url += '&offset=' + offset;
    var r = await fetch(url, { headers: ATH });
    var d = await r.json();
    if (d.records) tumKayitlar = tumKayitlar.concat(d.records);
    offset = d.offset || '';
  } while (offset);
  return tumKayitlar;
}

// Airtable'a kayit olustur veya guncelle
async function airtableYaz(tablo, fields, id) {
  var url = 'https://api.airtable.com/v0/' + BASE + '/' + encodeURIComponent(tablo);
  var method = 'POST';
  if (id) {
    url += '/' + id;
    method = 'PATCH';
  }
  var r = await fetch(url, {
    method: method,
    headers: ATH,
    body: JSON.stringify({ fields: fields })
  });
  return await r.json();
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  try {
    var body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    var personelId = body.personelId || '';
    var donem = body.donem || '';

    if (!personelId) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'personelId gerekli' })
      };
    }

    if (!donem) {
      // Otomatik donem hesapla
      var simdi = new Date();
      var ceyrek = Math.ceil((simdi.getMonth() + 1) / 3);
      donem = 'Q' + ceyrek + '-' + simdi.getFullYear();
    }

    // 1. Personel bilgisini cek
    var personelKayitlari = await airtableCek('Personel', 'RECORD_ID()="' + personelId + '"');
    if (personelKayitlari.length === 0) {
      return {
        statusCode: 404,
        headers: CORS,
        body: JSON.stringify({ error: 'Personel bulunamadi' })
      };
    }
    var personel = personelKayitlari[0];
    var personelAd = (personel.fields || {})['Ad Soyad'] || (personel.fields || {})['Ad'] || '';

    // 2. Bu personelin is emirlerini cek
    var isEmirleri = [];
    try {
      isEmirleri = await airtableCek('Is Emirleri', 'FIND("' + personelId + '", {Opertor})');
    } catch(e) {
      // Tablo yoksa veya alan yoksa devam et
      isEmirleri = [];
    }

    // 3. Termin uyumu hesapla
    var terminToplam = 0;
    var terminUygun = 0;
    isEmirleri.forEach(function(ie) {
      var f = ie.fields || {};
      if (f['Planlanan Bitis'] && f['Gercek Bitis']) {
        terminToplam++;
        var plan = new Date(f['Planlanan Bitis']);
        var gercek = new Date(f['Gercek Bitis']);
        if (gercek <= plan) terminUygun++;
      }
    });
    var terminUyumu = terminToplam > 0 ? Math.round((terminUygun / terminToplam) * 100) : null;

    // 4. NCR'den hata orani hesapla
    var ncrKayitlari = [];
    try {
      ncrKayitlari = await airtableCek('NCR Kayitlari', 'FIND("' + personelId + '", {Sorumlu})');
    } catch(e) {
      ncrKayitlari = [];
    }

    var toplamIs = isEmirleri.length || 1;
    var hataOrani = ncrKayitlari.length > 0 ? Math.round((ncrKayitlari.length / toplamIs) * 100) : 0;
    var kalitePuani = Math.max(0, 100 - hataOrani);

    // 5. Genel skor hesapla
    var skorlar = [];
    if (terminUyumu !== null) skorlar.push(terminUyumu);
    skorlar.push(kalitePuani);

    // Degerlendirme puanini da ekle
    var degerlendirmeler = [];
    try {
      degerlendirmeler = await airtableCek('Performans Degerlendirmeleri', 'AND({Personel}="' + personelId + '", {Donem}="' + donem + '")');
    } catch(e) {
      degerlendirmeler = [];
    }

    if (degerlendirmeler.length > 0) {
      var degOrt = parseFloat((degerlendirmeler[0].fields || {})['Ortalama']) || 0;
      if (degOrt > 0) skorlar.push(degOrt * 10); // 1-10 olceginden 0-100'e cevir
    }

    var genelSkor = 0;
    if (skorlar.length > 0) {
      var toplam = 0;
      skorlar.forEach(function(s) { toplam += s; });
      genelSkor = Math.round(toplam / skorlar.length);
    }

    // 6. KPI Kayitlari tablosuna yaz
    var kpiFields = {
      'Personel': [personelId],
      'Donem': donem,
      'Termin Uyumu': terminUyumu,
      'Hata Orani': hataOrani,
      'Kalite Puani': kalitePuani,
      'Genel Skor': genelSkor,
      'Is Emri Sayisi': isEmirleri.length,
      'NCR Sayisi': ncrKayitlari.length,
      'Hesaplama Tarihi': new Date().toISOString().split('T')[0]
    };

    // Mevcut kayit var mi kontrol et
    var mevcutKPI = [];
    try {
      mevcutKPI = await airtableCek('KPI Kayitlari', 'AND({Personel}="' + personelId + '", {Donem}="' + donem + '")');
    } catch(e) {
      mevcutKPI = [];
    }

    var kpiSonuc;
    if (mevcutKPI.length > 0) {
      kpiSonuc = await airtableYaz('KPI Kayitlari', kpiFields, mevcutKPI[0].id);
    } else {
      kpiSonuc = await airtableYaz('KPI Kayitlari', kpiFields);
    }

    // 7. Personel tablosundaki genel skoru guncelle
    try {
      await airtableYaz('Personel', { 'Performans Skoru': genelSkor }, personelId);
    } catch(e) {
      // Performans Skoru alani yoksa devam et
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        basarili: true,
        personel: personelAd,
        donem: donem,
        sonuclar: {
          terminUyumu: terminUyumu,
          hataOrani: hataOrani,
          kalitePuani: kalitePuani,
          genelSkor: genelSkor,
          isEmriSayisi: isEmirleri.length,
          ncrSayisi: ncrKayitlari.length
        },
        kpiKayit: kpiSonuc ? kpiSonuc.id : null
      })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message || 'Bilinmeyen hata' })
    };
  }
};
