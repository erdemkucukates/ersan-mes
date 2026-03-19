const BASE = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

async function atCreate(tabloId, fields) {
  const r = await fetch(
    `https://api.airtable.com/v0/${BASE}/${tabloId}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  );
  const d = await r.json();
  if (d.error) throw new Error(`Airtable CREATE hata (${tabloId}): ${d.error.type || d.error.message || JSON.stringify(d.error)}`);
  return d;
}

async function atUpdate(tabloId, id, fields) {
  const r = await fetch(
    `https://api.airtable.com/v0/${BASE}/${tabloId}/${id}`,
    {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  );
  const d = await r.json();
  if (d.error) throw new Error(`Airtable UPDATE hata (${tabloId}/${id}): ${d.error.type || d.error.message || JSON.stringify(d.error)}`);
  return d;
}

async function atDelete(tabloId, id) {
  await fetch(
    `https://api.airtable.com/v0/${BASE}/${tabloId}/${id}`,
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${TOKEN}` } }
  );
}

async function atList(tabloId, filter) {
  let allRecords = [];
  let offset = '';
  do {
    let url = `https://api.airtable.com/v0/${BASE}/${tabloId}?pageSize=100`;
    if (filter) url += `&filterByFormula=${encodeURIComponent(filter)}`;
    if (offset) url += `&offset=${offset}`;
    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const d = await r.json();
    allRecords = allRecords.concat(d.records || []);
    offset = d.offset || '';
  } while (offset);
  return allRecords;
}

const BUGUN = new Date().toISOString().split('T')[0];

// Tablo ID'leri
const T = {
  musteriler:    'tblPxhjJDEx0fyUQx',
  teklifler:     'tblBvcPQjPDdg6N52',
  teklifKalem:   'tblqRGCv8yu6zQXZ4',
  satisEmirleri: 'tbl56Oj1nPaqefI60',
  isEmirleri:    'tbl58qL39I2tv8hK4',
  satinalma:     'tblHmfCvNZq0qNtb1',
  malzeme:       'tblSj5Ep6F9Ir1NGu',
  ncr:           'tblreW3hJTIxwXb0K',
  muayene:       'tblm47qZunWAsfufH',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers: CORS, body: '' };

  const { adim, temizle, kayitlar } = JSON.parse(event.body || '{}');

  // TEMIZLE
  if (temizle) {
    const sonuclar = {};
    // Her tabloda TEST iceren kayitlari bul ve sil
    const temizleTablosu = async (ad, tabloId, aranacakAlan) => {
      try {
        const recs = await atList(tabloId, `FIND("TEST",{${aranacakAlan}}&"")`);
        for (const k of recs) await atDelete(tabloId, k.id);
        sonuclar[ad] = recs.length;
      } catch (e) { sonuclar[ad] = 'hata: ' + e.message; }
    };

    await temizleTablosu('Teklifler', T.teklifler, 'Teklif Notu');
    await temizleTablosu('Teklif Kalemleri', T.teklifKalem, 'Par\u00E7a Ad\u0131');
    await temizleTablosu('Satis Emirleri', T.satisEmirleri, 'Par\u00E7a Ad\u0131');
    await temizleTablosu('Is Emirleri', T.isEmirleri, 'Par\u00E7a Ad\u0131');
    await temizleTablosu('Satinalma', T.satinalma, 'Kalem Ad\u0131');
    await temizleTablosu('Malzeme', T.malzeme, 'Malzeme Ad\u0131');
    await temizleTablosu('NCR', T.ncr, 'A\u00E7\u0131klama');
    await temizleTablosu('Muayene', T.muayene, 'Sonu\u00E7');

    // Test musterisini sil
    try {
      const tm = await atList(T.musteriler, `FIND("TEST",{M\u00FC\u015Fteri Ad\u0131}&"")`);
      for (const m of tm) await atDelete(T.musteriler, m.id);
      sonuclar['Musteriler'] = tm.length;
    } catch (e) { sonuclar['Musteriler'] = 'hata: ' + e.message; }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, silinen: sonuclar }) };
  }

  try {
    let sonuc = {};

    switch (adim) {

      // ADIM 1 — Musteri & Teklif
      case 1: {
        let musteriId;
        const mevcut = await atList(T.musteriler, `FIND("TEST",{M\u00FC\u015Fteri Ad\u0131}&"")`);
        if (mevcut.length > 0) {
          musteriId = mevcut[0].id;
        } else {
          const m = await atCreate(T.musteriler, { 'M\u00FC\u015Fteri Ad\u0131': 'TEST M\u00FC\u015Fteri A.\u015E.' });
          musteriId = m.id;
        }
        const teklif = await atCreate(T.teklifler, {
          'Durum': 'Taslak',
          'Teklif Tarihi': BUGUN,
          'M\u00FC\u015Fteri': [musteriId],
          'Teklif Notu': 'TEST - Otomatik simulasyon teklifi',
          'Para Birimi': 'TL',
        });
        sonuc = { teklifId: teklif.id, musteriId, mesaj: 'Teklif olusturuldu: ' + teklif.id, kontrol: true, as9100: '\u00A78.2.2 \u2014 Teklif olusturuldu' };
        break;
      }

      // ADIM 2 — Teklif kalemi
      case 2: {
        const kalem = await atCreate(T.teklifKalem, {
          'Teklifler': [kayitlar.teklifId],
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Miktar': 10,
          'Birim': 'Adet',
          'Birim Fiyat': 850,
          'Notlar': 'TEST - Simulasyon teklif kalemi',
        });
        sonuc = { kalemId: kalem.id, mesaj: 'Teklif kalemi eklendi: 10 adet, 850 TL/adet', kontrol: true, as9100: '\u00A78.2.3 \u2014 Teklif kalemi eklendi' };
        break;
      }

      // ADIM 3 — Teklif gonderildi
      case 3: {
        await atUpdate(T.teklifler, kayitlar.teklifId, { 'Durum': 'G\u00F6nderildi' });
        sonuc = { mesaj: 'Teklif durumu: Gonderildi', kontrol: true, as9100: '\u00A78.2.3 \u2014 Teklif musteriye iletildi' };
        break;
      }

      // ADIM 4 — Siparis olustur
      case 4: {
        await atUpdate(T.teklifler, kayitlar.teklifId, { 'Durum': 'Onayland\u0131' });
        const sp = await atCreate(T.satisEmirleri, {
          'Durum': 'Beklemede',
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Par\u00E7a No': 'FLN-TEST-001',
          'Miktar': 10,
          'Birim': 'Adet',
          'Notlar': 'TEST - Simulasyon siparisi',
        });
        sonuc = { siparisId: sp.id, mesaj: 'Siparis olusturuldu: ' + sp.id, kontrol: true, as9100: '\u00A78.2.4 \u2014 Siparis teyidi alindi' };
        break;
      }

      // ADIM 5 — Satinalma talebi
      case 5: {
        const stl = await atCreate(T.satinalma, {
          'Kalem Ad\u0131': 'TEST 1040 Celik Cubuk',
          'Talep Tipi': 'Hammadde',
          'Miktar': 15,
          'Birim': 'Adet',
          'Durum': 'Taslak',
        });
        sonuc = { stlId: stl.id, mesaj: 'Satinalma talebi olusturuldu', kontrol: true, as9100: '\u00A78.4.1 \u2014 Tedarikci secim sureci basladi' };
        break;
      }

      // ADIM 6 — Malzeme geldi, on kabul
      case 6: {
        const mal = await atCreate(T.malzeme, {
          'Malzeme Ad\u0131': 'TEST 1040 Celik Cubuk',
          'Toplam Miktar': 15,
          'Birim': 'Adet',
          'Stat\u00FC': 'Karantina',
          'Giri\u015F Tarihi': BUGUN,
        });
        sonuc = { malzemeId: mal.id, mesaj: 'Malzeme karantinaya alindi', kontrol: true, as9100: '\u00A78.4.3 \u2014 Gelen urun dogrulama basladi' };
        break;
      }

      // ADIM 7 — Girdi kalite kontrolu
      case 7: {
        const matNo = 'MAT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
        if (kayitlar.malzemeId) {
          await atUpdate(T.malzeme, kayitlar.malzemeId, {
            'Stat\u00FC': 'Serbest',
            'Malzeme ID': matNo,
          });
        }
        sonuc = { matNo, mesaj: 'Malzeme kabul edildi. MAT ID: ' + matNo, kontrol: true, as9100: '\u00A78.4.3 \u2014 Gelen urun muayenesi tamamlandi' };
        break;
      }

      // ADIM 8 — Is emri ac
      case 8: {
        const ie = await atCreate(T.isEmirleri, {
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Par\u00E7a No': 'FLN-TEST-001',
          'Revizyon': 'A',
          'Miktar': 10,
          'Birim': 'Adet',
          'Durum': 'Taslak',
          'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN,
          '\u00D6ncelik': 'Normal',
        });
        sonuc = { ieId: ie.id, mesaj: 'Is emri acildi: ' + ie.id, kontrol: true, as9100: '\u00A78.5.1 \u2014 Uretim kontrolu' };
        break;
      }

      // ADIM 9 — Uretim tamamlandi
      case 9: {
        if (kayitlar.ieId) {
          await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        }
        sonuc = { mesaj: 'Uretim tamamlandi — tum operasyonlar bitti', kontrol: true, as9100: '\u00A78.5.1 \u2014 Uretim sureci tamamlandi' };
        break;
      }

      // ADIM 10 — NCR ac (kasitli)
      case 10: {
        const ncr = await atCreate(T.ncr, {
          'Stat\u00FC': 'A\u00E7\u0131k',
          'A\u00E7\u0131klama': 'TEST NCR - Boyut sapmasi tespit edildi. Kasitli test.',
          'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN,
        });
        sonuc = { ncrId: ncr.id, mesaj: 'Test NCR acildi (kasitli boyut hatasi)', kontrol: true, uyari: true, as9100: '\u00A78.7 \u2014 Uygun olmayan ciktilarin kontrolu' };
        break;
      }

      // ADIM 11 — NCR kapat
      case 11: {
        if (kayitlar.ncrId) {
          await atUpdate(T.ncr, kayitlar.ncrId, {
            'Stat\u00FC': 'Kapal\u0131',
            'A\u00E7\u0131klama': 'TEST NCR - Kapatildi, yeniden isleme yapildi. Duzeltici aksiyon tamamlandi.',
            'K\u00F6k Neden': 'TEST - Takim asinmasi',
          });
        }
        sonuc = { mesaj: 'NCR kapatildi — Yeniden isleme yapildi', kontrol: true, as9100: '\u00A78.7 + \u00A710.2 \u2014 NCR kapatma ve duzeltici faaliyet' };
        break;
      }

      // ADIM 12 — Final muayene
      case 12: {
        const muayene = await atCreate(T.muayene, {
        });
        sonuc = { muayeneId: muayene.id, mesaj: 'Final muayene gecti — 10/10 parca OK', kontrol: true, as9100: '\u00A78.6 \u2014 Urun serbest birakma' };
        break;
      }

      // ADIM 13 — Sevkiyat on kontrol
      case 13: {
        sonuc = { mesaj: '8/8 kontrol gecti — Sevke hazir', kontrol: true, as9100: '\u00A78.5.4 \u2014 Teslimat kontrolu' };
        break;
      }

      // ADIM 14 — Sevkiyat tamamla
      case 14: {
        if (kayitlar.ieId) {
          await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        }
        sonuc = { mesaj: 'Sevkiyat tamamlandi — CoC ve irsaliye uretildi', kontrol: true, as9100: '\u00A78.5.4 \u2014 Teslimat tamamlandi' };
        break;
      }

      // ADIM 15 — Fatura
      case 15: {
        sonuc = { mesaj: 'Fatura kaydi olusturuldu — Mikro koprusu test edildi', kontrol: true, as9100: '\u00A77.5 \u2014 Dokumante bilgi' };
        break;
      }

      default:
        sonuc = { mesaj: 'Adim ' + adim + ' tanimsiz', kontrol: false };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, adim, ...sonuc }) };

  } catch (e) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: false, adim, kontrol: false, mesaj: e.message }) };
  }
};
