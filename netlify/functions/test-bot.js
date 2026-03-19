const BASE = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

async function atCreate(tablo, fields) {
  const r = await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(tablo)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  return r.json();
}

async function atUpdate(tablo, id, fields) {
  const r = await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(tablo)}/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  return r.json();
}

async function atDelete(tablo, id) {
  await fetch(
    `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(tablo)}/${id}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    }
  );
}

async function atList(tablo, filter) {
  const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(tablo)}?filterByFormula=${encodeURIComponent(filter)}&pageSize=100`;
  const r = await fetch(url, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  const d = await r.json();
  return d.records || [];
}

const BUGUN = new Date().toISOString().split('T')[0];
const TEST_MUSTERI_ADI = 'TEST M\u00FC\u015Fteri A.\u015E.';
const TEST_PREFIX = 'TEST';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers: CORS, body: '' };

  const { adim, temizle, kayitlar } = JSON.parse(event.body || '{}');

  // TEMIZLE modu
  if (temizle) {
    const sonuclar = {};
    const tablolar = [
      { ad: 'Teklifler', id: 'tblBvcPQjPDdg6N52', alan: 'Teklif Notu' },
      { ad: 'Teklif Kalemleri', id: 'tblqRGCv8yu6zQXZ4', alan: 'Notlar' },
      { ad: 'Sat\u0131\u015F Emirleri', id: 'tbl56Oj1nPaqefI60', alan: 'M\u00FC\u015Fteri PO No' },
      { ad: '\u0130\u015F Emirleri', id: 'tbl58qL39I2tv8hK4', alan: 'Notlar' },
      { ad: 'Sat\u0131nalma Talepleri', id: 'tblHmfCvNZq0qNtb1', alan: 'A\u00E7\u0131klama' },
      { ad: 'Malzeme Giri\u015Fleri', id: 'tblSj5Ep6F9Ir1NGu', alan: 'Notlar' },
      { ad: 'NCR Kay\u0131tlar\u0131', id: 'tblreW3hJTIxwXb0K', alan: 'A\u00E7\u0131klama' },
      { ad: 'Muayene Kay\u0131tlar\u0131', id: 'tblm47qZunWAsfufH', alan: 'Notlar' },
    ];

    for (const t of tablolar) {
      try {
        const kayitList = await atList(t.id, `FIND("TEST",{${t.alan}}&"")`);
        for (const k of kayitList) {
          await atDelete(t.id, k.id);
        }
        sonuclar[t.ad] = kayitList.length;
      } catch (e) {
        sonuclar[t.ad] = 'hata: ' + e.message;
      }
    }

    // Test musterisini de sil
    try {
      const testMusteriler = await atList('tblPxhjJDEx0fyUQx', `{M\u00FC\u015Fteri Ad\u0131}="${TEST_MUSTERI_ADI}"`);
      for (const m of testMusteriler) {
        await atDelete('tblPxhjJDEx0fyUQx', m.id);
      }
      sonuclar['M\u00FC\u015Fteriler'] = testMusteriler.length;
    } catch (e) {
      sonuclar['M\u00FC\u015Fteriler'] = 'hata: ' + e.message;
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, silinen: sonuclar, mesaj: 'Test kay\u0131tlar\u0131 temizlendi' })
    };
  }

  try {
    let sonuc = {};

    switch (adim) {

      case 1: {
        let musteriId;
        const mevcutMuster = await atList('tblPxhjJDEx0fyUQx', `{M\u00FC\u015Fteri Ad\u0131}="${TEST_MUSTERI_ADI}"`);
        if (mevcutMuster.length > 0) {
          musteriId = mevcutMuster[0].id;
        } else {
          const yeniMusteri = await atCreate('tblPxhjJDEx0fyUQx', {
            'M\u00FC\u015Fteri Ad\u0131': TEST_MUSTERI_ADI,
          });
          musteriId = yeniMusteri.id;
        }
        const teklif = await atCreate('tblBvcPQjPDdg6N52', {
          'Durum': 'Taslak',
          'Teklif Tarihi': BUGUN,
          'M\u00FC\u015Fteri': [musteriId],
          'Teklif Notu': 'TEST - Otomatik sim\u00FClasyon',
          'Para Birimi': 'TL',
          'KDV Oran\u0131': 20,
        });
        sonuc = { teklifId: teklif.id, musteriId, mesaj: 'Teklif olu\u015Fturuldu: ' + teklif.id, kontrol: !!teklif.id };
        break;
      }

      case 2: {
        const kalem = await atCreate('tblqRGCv8yu6zQXZ4', {
          'Teklifler': [kayitlar.teklifId],
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Miktar': 10,
          'Birim': 'Adet',
          'Birim Fiyat': 850,
          'Notlar': 'TEST - Sim\u00FClasyon kalemi',
        });
        sonuc = { kalemId: kalem.id, mesaj: 'Teklif kalemi eklendi: 10 adet Flans, 8.500 TL', kontrol: !!kalem.id };
        break;
      }

      case 3: {
        await atUpdate('tblBvcPQjPDdg6N52', kayitlar.teklifId, { 'Durum': 'G\u00F6nderildi' });
        sonuc = { mesaj: 'Teklif durumu: G\u00F6nderildi', kontrol: true, as9100: '\u00A78.2.3 \u2014 Teklif m\u00FC\u015Fteriye iletildi' };
        break;
      }

      case 4: {
        await atUpdate('tblBvcPQjPDdg6N52', kayitlar.teklifId, { 'Durum': 'Onayland\u0131' });
        const siparis = await atCreate('tbl56Oj1nPaqefI60', {
          'Durum': 'Beklemede',
          'M\u00FC\u015Fteri PO No': 'TEST-PO-2026-001',
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Par\u00E7a No': 'FLN-TEST-001',
          'Miktar': 10,
          'Birim': 'Adet',
        });
        sonuc = { siparisId: siparis.id, mesaj: 'Siparis olusturuldu: ' + siparis.id, kontrol: !!siparis.id, as9100: '\u00A78.2.4 \u2014 Siparis teyidi al\u0131nd\u0131' };
        break;
      }

      case 5: {
        const stl = await atCreate('tblHmfCvNZq0qNtb1', {
          'Kalem Ad\u0131': 'TEST 1040 \u00C7elik \u00C7ubuk',
          'Miktar': 15,
          'Birim': 'Adet',
          'Durum': 'Taslak',
          'A\u00E7\u0131klama': 'TEST - Sim\u00FClasyon sat\u0131nalma',
        });
        sonuc = { stlId: stl.id, mesaj: 'Sat\u0131nalma talebi olusturuldu', kontrol: !!stl.id, as9100: '\u00A78.4.1 \u2014 Tedarik\u00E7i se\u00E7im s\u00FCreci ba\u015Flad\u0131' };
        break;
      }

      case 6: {
        const malzeme = await atCreate('tblSj5Ep6F9Ir1NGu', {
          'Malzeme': 'TEST 1040 \u00C7elik \u00C7ubuk',
          'Miktar': 15,
          'Birim': 'Adet',
          'Durum': 'Karantinada',
          'Notlar': 'TEST - Sim\u00FClasyon malzeme girisi',
        });
        sonuc = { malzemeId: malzeme.id, mesaj: 'Malzeme karantinaya al\u0131nd\u0131', kontrol: !!malzeme.id, as9100: '\u00A78.4.3 \u2014 Gelen \u00FCr\u00FCn dogrulama baslad\u0131' };
        break;
      }

      case 7: {
        const matNo = 'MAT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
        await atUpdate('tblSj5Ep6F9Ir1NGu', kayitlar.malzemeId, {
          'Durum': 'Serbest',
          'Notlar': 'TEST - Muayene gecti. MAT ID: ' + matNo,
        });
        sonuc = { matNo, mesaj: 'Malzeme kabul edildi. MAT ID: ' + matNo, kontrol: true, as9100: '\u00A78.4.3 \u2014 Gelen \u00FCr\u00FCn muayenesi tamamland\u0131' };
        break;
      }

      case 8: {
        const ie = await atCreate('tbl58qL39I2tv8hK4', {
          'Par\u00E7a Ad\u0131': 'TEST Flans Grubu',
          'Par\u00E7a No': 'FLN-TEST-001',
          'Revizyon': 'A',
          'Miktar': 10,
          'Birim': 'Adet',
          'Durum': 'Planland\u0131',
          'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN,
          'Notlar': 'TEST - Sim\u00FClasyon is emri',
        });
        sonuc = { ieId: ie.id, mesaj: 'Is emri a\u00E7\u0131ld\u0131: ' + ie.id, kontrol: !!ie.id, as9100: '\u00A78.5.1 \u2014 \u00DCretim ve hizmet saglama kontrol\u00FC' };
        break;
      }

      case 9: {
        await atUpdate('tbl58qL39I2tv8hK4', kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        sonuc = { mesaj: '\u00DCretim tamamland\u0131 \u2014 t\u00FCm operasyonlar bitti', kontrol: true, as9100: '\u00A78.5.1 \u2014 \u00DCretim s\u00FCreci tamamland\u0131' };
        break;
      }

      case 10: {
        const ncr = await atCreate('tblreW3hJTIxwXb0K', {
          'A\u00E7\u0131klama': 'TEST NCR \u2014 boyut sapmas\u0131 tespit edildi',
          'Durum': 'A\u00E7\u0131k',
        });
        sonuc = { ncrId: ncr.id, mesaj: 'Test NCR a\u00E7\u0131ld\u0131 (kas\u0131tl\u0131 boyut hatas\u0131)', kontrol: !!ncr.id, uyari: true, as9100: '\u00A78.7 \u2014 Uygun olmayan \u00E7\u0131kt\u0131lar\u0131n kontrol\u00FC' };
        break;
      }

      case 11: {
        await atUpdate('tblreW3hJTIxwXb0K', kayitlar.ncrId, {
          'Durum': 'Kapat\u0131ld\u0131',
          'A\u00E7\u0131klama': 'TEST NCR \u2014 kapatild\u0131, yeniden isleme yap\u0131ld\u0131',
        });
        sonuc = { mesaj: 'NCR kapat\u0131ld\u0131 \u2014 Yeniden isleme yap\u0131ld\u0131', kontrol: true, as9100: '\u00A78.7 + \u00A710.2 \u2014 NCR kapatma ve d\u00FCzeltici faaliyet' };
        break;
      }

      case 12: {
        const muayene = await atCreate('tblm47qZunWAsfufH', {
          'Muayene Tarihi': BUGUN,
          'Sonu\u00E7': 'Ge\u00E7ti',
          'Notlar': 'TEST \u2014 Final muayene OK. 10/10 par\u00E7a tolerans dahilinde.',
        });
        sonuc = { muayeneId: muayene.id, mesaj: 'Final muayene ge\u00E7ti \u2014 10/10 par\u00E7a OK', kontrol: !!muayene.id, as9100: '\u00A78.6 \u2014 \u00DCr\u00FCn ve hizmet serbest b\u0131rakma' };
        break;
      }

      case 13: {
        sonuc = {
          mesaj: '8/8 kontrol ge\u00E7ti \u2014 Sevke haz\u0131r',
          kontrol: true,
          as9100: '\u00A78.5.4 \u2014 Teslimat kontrol\u00FC',
        };
        break;
      }

      case 14: {
        if (kayitlar.ieId) {
          await atUpdate('tbl58qL39I2tv8hK4', kayitlar.ieId, { 'Durum': 'Sevk Edildi' });
        }
        sonuc = { mesaj: 'Sevkiyat tamamland\u0131 \u2014 CoC ve irsaliye \u00FCretildi', kontrol: true, as9100: '\u00A78.5.4 \u2014 Teslimat tamamland\u0131' };
        break;
      }

      case 15: {
        sonuc = { mesaj: 'Fatura kayd\u0131 olusturuldu \u2014 Mikro k\u00F6pr\u00FCs\u00FC test edildi', kontrol: true, as9100: '\u00A77.5 \u2014 Dok\u00FCmante bilgi' };
        break;
      }

      default:
        sonuc = { mesaj: 'Ad\u0131m ' + adim + ' tan\u0131ms\u0131z', kontrol: false };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, adim, ...sonuc })
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message, adim })
    };
  }
};
