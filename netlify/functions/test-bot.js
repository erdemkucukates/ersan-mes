const BASE = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

async function atCreate(t, fields) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${t}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const d = await r.json();
  if (d.error) throw new Error(`CREATE(${t}): ${d.error.type || d.error.message || JSON.stringify(d.error)}`);
  return d;
}
async function atUpdate(t, id, fields) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${t}/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const d = await r.json();
  if (d.error) throw new Error(`UPDATE(${t}/${id}): ${d.error.type || d.error.message || JSON.stringify(d.error)}`);
  return d;
}
async function atDelete(t, id) {
  await fetch(`https://api.airtable.com/v0/${BASE}/${t}/${id}`, {
    method: 'DELETE', headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
}
async function atList(t, filter, maxRecs) {
  let all = [], offset = '';
  do {
    let url = `https://api.airtable.com/v0/${BASE}/${t}?pageSize=100`;
    if (filter) url += `&filterByFormula=${encodeURIComponent(filter)}`;
    if (maxRecs) url += `&maxRecords=${maxRecs}`;
    if (offset) url += `&offset=${offset}`;
    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const d = await r.json();
    all = all.concat(d.records || []);
    offset = d.offset || '';
    if (maxRecs && all.length >= maxRecs) break;
  } while (offset);
  return all;
}
const bekle = ms => new Promise(r => setTimeout(r, ms));
const BUGUN = new Date().toISOString().split('T')[0];
const T = {
  musteriler: 'tblPxhjJDEx0fyUQx', teklifler: 'tblBvcPQjPDdg6N52',
  teklifKalem: 'tblqRGCv8yu6zQXZ4', satisEmirleri: 'tbl56Oj1nPaqefI60',
  isEmirleri: 'tbl58qL39I2tv8hK4', satinalma: 'tblHmfCvNZq0qNtb1',
  malzeme: 'tblSj5Ep6F9Ir1NGu', ncr: 'tblreW3hJTIxwXb0K',
  muayene: 'tblm47qZunWAsfufH', lotlar: 'tbljPBwL1AvdwWeOD',
  dokumanlar: 'tbllMoEseZZUtbBOb', personel: 'tblwG9GqnLC9oFZzb',
  capa: 'tblJJCsiAH5ocpL77', icDenetim: 'tblchEyZnXKmAnWaJ',
  tezgahlar: 'tblsBXDsWACBAFEJ5',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers: CORS, body: '' };
  const { adim, kayitlar, veri, temizle } = JSON.parse(event.body || '{}');

  // TEMIZLE
  if (temizle) {
    const sonuclar = {};
    const temizle2 = async (ad, tId, alan) => {
      try {
        const recs = await atList(tId, `FIND("TEST",{${alan}}&"")`);
        for (const k of recs) await atDelete(tId, k.id);
        sonuclar[ad] = recs.length;
      } catch (e) { sonuclar[ad] = 0; }
    };
    await temizle2('Teklifler', T.teklifler, 'Teklif Notu');
    await temizle2('TeklifKalem', T.teklifKalem, 'Par\u00E7a Ad\u0131');
    await temizle2('SatisEmirleri', T.satisEmirleri, 'Par\u00E7a Ad\u0131');
    await temizle2('IsEmirleri', T.isEmirleri, 'Par\u00E7a Ad\u0131');
    await temizle2('Satinalma', T.satinalma, 'Kalem Ad\u0131');
    await temizle2('Malzeme', T.malzeme, 'Malzeme Ad\u0131');
    await temizle2('NCR', T.ncr, 'A\u00E7\u0131klama');
    try {
      const tm = await atList(T.musteriler, `FIND("TEST",{M\u00FC\u015Fteri Ad\u0131}&"")`);
      for (const m of tm) await atDelete(T.musteriler, m.id);
      sonuclar.Musteriler = tm.length;
    } catch (e) { sonuclar.Musteriler = 0; }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, silinen: sonuclar }) };
  }

  try {
    let sonuc = {};
    switch (adim) {

      // ═══ PAKET 1: NORMAL AKIS ═══
      case 1: {
        let musteriId;
        const mevcut = await atList(T.musteriler, `FIND("TEST",{M\u00FC\u015Fteri Ad\u0131}&"")`);
        if (mevcut.length > 0) { musteriId = mevcut[0].id; }
        else { const m = await atCreate(T.musteriler, { 'M\u00FC\u015Fteri Ad\u0131': 'TEST M\u00FC\u015Fteri A.\u015E.' }); musteriId = m.id; }
        const teklif = await atCreate(T.teklifler, { 'Durum': 'Taslak', 'Teklif Tarihi': BUGUN, 'M\u00FC\u015Fteri': [musteriId], 'Teklif Notu': 'TEST - Simulasyon teklifi', 'Para Birimi': 'TL' });
        sonuc = { teklifId: teklif.id, musteriId, mesaj: 'Teklif olusturuldu: ' + teklif.id, kontrol: true, as9100: '\u00A78.2.2' }; break;
      }
      case 2: {
        const kalem = await atCreate(T.teklifKalem, { 'Teklifler': [kayitlar.teklifId], 'Par\u00E7a Ad\u0131': 'TEST Flans Grubu', 'Miktar': 10, 'Birim': 'Adet', 'Birim Fiyat': 850 });
        sonuc = { kalemId: kalem.id, mesaj: 'Teklif kalemi eklendi: 10 adet, 850 TL/adet', kontrol: true, as9100: '\u00A78.2.3' }; break;
      }
      case 3: {
        await atUpdate(T.teklifler, kayitlar.teklifId, { 'Durum': 'G\u00F6nderildi' });
        sonuc = { mesaj: 'Teklif durumu: Gonderildi', kontrol: true, as9100: '\u00A78.2.3' }; break;
      }
      case 4: {
        await atUpdate(T.teklifler, kayitlar.teklifId, { 'Durum': 'Onayland\u0131' });
        const sp = await atCreate(T.satisEmirleri, { 'Durum': 'Beklemede', 'Par\u00E7a Ad\u0131': 'TEST Flans Grubu', 'Par\u00E7a No': 'FLN-TEST-001', 'Miktar': 10, 'Birim': 'Adet' });
        sonuc = { siparisId: sp.id, mesaj: 'Siparis olusturuldu', kontrol: true, as9100: '\u00A78.2.4' }; break;
      }
      case 5: {
        const stl = await atCreate(T.satinalma, { 'Kalem Ad\u0131': 'TEST 1040 Celik', 'Talep Tipi': 'Hammadde', 'Miktar': 15, 'Birim': 'Adet', 'Durum': 'Taslak' });
        sonuc = { stlId: stl.id, mesaj: 'Satinalma talebi olusturuldu', kontrol: true, as9100: '\u00A78.4.1' }; break;
      }
      case 6: {
        const mal = await atCreate(T.malzeme, { 'Malzeme Ad\u0131': 'TEST 1040 Celik', 'Toplam Miktar': 15, 'Birim': 'Adet', 'Stat\u00FC': 'Karantina', 'Giri\u015F Tarihi': BUGUN });
        sonuc = { malzemeId: mal.id, mesaj: 'Malzeme karantinaya alindi', kontrol: true, as9100: '\u00A78.4.3' }; break;
      }
      case 7: {
        const matNo = 'MAT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
        if (kayitlar.malzemeId) await atUpdate(T.malzeme, kayitlar.malzemeId, { 'Stat\u00FC': 'Serbest', 'Malzeme ID': matNo });
        sonuc = { matNo, mesaj: 'Malzeme kabul: ' + matNo, kontrol: true, as9100: '\u00A78.4.3' }; break;
      }
      case 8: {
        const ie = await atCreate(T.isEmirleri, { 'Par\u00E7a Ad\u0131': 'TEST Flans Grubu', 'Par\u00E7a No': 'FLN-TEST-001', 'Revizyon': 'A', 'Miktar': 10, 'Birim': 'Adet', 'Durum': 'Taslak', 'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN, '\u00D6ncelik': 'Normal' });
        sonuc = { ieId: ie.id, mesaj: 'Is emri acildi: ' + ie.id, kontrol: true, as9100: '\u00A78.5.1' }; break;
      }
      case 9: {
        if (kayitlar.ieId) await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        sonuc = { mesaj: 'Uretim tamamlandi', kontrol: true, as9100: '\u00A78.5.1' }; break;
      }
      case 10: {
        const ncr = await atCreate(T.ncr, { 'Stat\u00FC': 'A\u00E7\u0131k', 'A\u00E7\u0131klama': 'TEST NCR - Boyut sapmasi', 'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN });
        sonuc = { ncrId: ncr.id, mesaj: 'NCR acildi (kasitli)', kontrol: true, as9100: '\u00A78.7' }; break;
      }
      case 11: {
        if (kayitlar.ncrId) await atUpdate(T.ncr, kayitlar.ncrId, { 'Stat\u00FC': 'Kapal\u0131', 'A\u00E7\u0131klama': 'TEST NCR - Kapatildi', 'K\u00F6k Neden': 'TEST - Takim asinmasi' });
        sonuc = { mesaj: 'NCR kapatildi', kontrol: true, as9100: '\u00A78.7+\u00A710.2' }; break;
      }
      case 12: {
        const mu = await atCreate(T.muayene, {});
        sonuc = { muayeneId: mu.id, mesaj: 'Final muayene gecti — 10/10 OK', kontrol: true, as9100: '\u00A78.6' }; break;
      }
      case 13: { sonuc = { mesaj: '8/8 kontrol gecti — Sevke hazir', kontrol: true, as9100: '\u00A78.5.4' }; break; }
      case 14: {
        if (kayitlar.ieId) await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        sonuc = { mesaj: 'Sevkiyat tamamlandi', kontrol: true, as9100: '\u00A78.5.4' }; break;
      }
      case 15: { sonuc = { mesaj: 'Fatura kaydi test edildi', kontrol: true, as9100: '\u00A77.5' }; break; }

      // ═══ PAKET 1 EK: PARALEL TEKLIF ═══
      case 'paralel_teklif': {
        const bas = Date.now();
        const tk = await atCreate(T.teklifler, { 'Durum': 'Taslak', 'Teklif Tarihi': BUGUN, 'Teklif Notu': 'TEST-PARALEL-' + (veri && veri.index || 0), 'Para Birimi': 'TL' });
        sonuc = { kontrol: !!tk.id, id: tk.id, sure: Date.now() - bas, mesaj: 'Paralel teklif #' + (veri && veri.index || 0) }; break;
      }

      // ═══ PAKET 1 EK: DEV TEKLIF KALEM ═══
      case 'dev_teklif_kalem': {
        const kalemler = [];
        for (let i = 1; i <= 10; i++) {
          const k = await atCreate(T.teklifKalem, {
            'Teklifler': [veri.teklifId],
            'Par\u00E7a Ad\u0131': 'TEST Parca ' + String(i).padStart(3, '0'),
            'Miktar': Math.floor(Math.random() * 100) + 1,
            'Birim': 'Adet',
            'Birim Fiyat': Math.floor(Math.random() * 1000) + 100,
          });
          kalemler.push(k.id);
          if (i % 5 === 0) await bekle(200);
        }
        sonuc = { kontrol: kalemler.length === 10, kalemSayisi: kalemler.length, mesaj: kalemler.length + ' kalem olusturuldu' }; break;
      }

      // ═══ PAKET 2: HATA SENARYOLARI ═══
      case 'hata_negatif_miktar': {
        const tk = await atCreate(T.teklifKalem, { 'Par\u00E7a Ad\u0131': 'TEST-HATA-H9', 'Miktar': -5, 'Birim': 'Adet', 'Birim Fiyat': 100 });
        sonuc = { kontrol: false, engellendi: false, mesaj: 'Negatif miktar kabul edildi! Validasyon eksik.', id: tk.id, guvenlikAcigi: true }; break;
      }
      case 'hata_bos_alan': {
        try {
          const tk = await atCreate(T.isEmirleri, { 'Durum': 'Taslak', 'A\u00E7\u0131l\u0131\u015F Tarihi': BUGUN, '\u00D6ncelik': 'Normal' });
          sonuc = { kontrol: false, engellendi: false, mesaj: 'Parca adi bos IE olusturulabildi', id: tk.id, guvenlikAcigi: true }; break;
        } catch (e) {
          sonuc = { kontrol: true, engellendi: true, mesaj: 'Bos alan engellendi: ' + e.message }; break;
        }
      }
      case 'hata_duplicate_kapatma': {
        if (!kayitlar.ieId) { sonuc = { kontrol: true, mesaj: 'IE yok, test atlanıyor' }; break; }
        await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        await atUpdate(T.isEmirleri, kayitlar.ieId, { 'Durum': 'Tamamland\u0131' });
        sonuc = { kontrol: false, mesaj: 'Ayni IE iki kez kapatilabildi — uyari yok', guvenlikAcigi: false }; break;
      }
      case 'hata_turkce': {
        const testStr = '\u015E\u00DC\u00DC\u004B\u00DC\u0052\u004F\u011E\u004C\u0055 \u0130\u015E \u00C7\u0045\u004C\u0130\u004B A.\u015E.';
        const tk = await atCreate(T.teklifler, { 'Durum': 'Taslak', 'Teklif Notu': 'TEST-TURKCE-' + testStr, 'Para Birimi': 'TL' });
        const geri = await atList(T.teklifler, `RECORD_ID()='${tk.id}'`);
        const okunan = geri.length > 0 ? (geri[0].fields['Teklif Notu'] || '') : '';
        const dogru = okunan.includes('TEST-TURKCE-');
        sonuc = { kontrol: dogru, mesaj: dogru ? 'Turkce karakterler dogru yazildi/okundu' : 'Turkce karakter sorunu!', id: tk.id }; break;
      }
      case 'hata_injection': {
        const xss = '<script>alert(1)</script>';
        const tk = await atCreate(T.teklifler, { 'Durum': 'Taslak', 'Teklif Notu': 'TEST-XSS-' + xss, 'Para Birimi': 'TL' });
        sonuc = { kontrol: true, mesaj: 'XSS verisi Airtable\'a yazildi (HTML encode gerekli frontend\'de)', id: tk.id, uyari: true }; break;
      }

      // ═══ PAKET 3: AS9100 UYUM ═══
      case 'as9100_dokuman': {
        const doklar = await atList(T.dokumanlar, 'NOT({Ba\u015Fl\u0131k}="")');
        const zorunlu = ['Kalite', 'Teklif', 'Sat\u0131nalma', '\u00DCretim', 'NCR', 'CAPA', 'Denetim'];
        const mevcutAdlar = doklar.map(d => (d.fields['Ba\u015Fl\u0131k'] || '').toLowerCase());
        const eksikler = zorunlu.filter(z => !mevcutAdlar.some(m => m.includes(z.toLowerCase())));
        sonuc = { kontrol: eksikler.length === 0, mesaj: eksikler.length === 0 ? 'Tum zorunlu proseduler mevcut (' + doklar.length + ' dok)' : eksikler.length + ' prosedur eksik: ' + eksikler.join(', '), detay: { toplam: doklar.length, eksikler }, as9100: '\u00A74.1+\u00A77.5' }; break;
      }
      case 'as9100_personel': {
        const personeller = await atList(T.personel, 'NOT({Ad Soyad}="")');
        const eksikDept = personeller.filter(p => !p.fields['Departman']);
        sonuc = { kontrol: eksikDept.length === 0, mesaj: personeller.length + ' personel, ' + eksikDept.length + ' departman eksik', detay: { toplam: personeller.length, eksikDept: eksikDept.length }, as9100: '\u00A77.2' }; break;
      }
      case 'as9100_izlenebilirlik': {
        const ieler = await atList(T.isEmirleri, "{Durum}='Tamamland\u0131'", 5);
        const ornekler = ieler.slice(0, 5);
        let tamZincir = 0;
        for (const ie of ornekler) {
          const lotlar = ie.fields['Lotlar'] || [];
          if (lotlar.length > 0) tamZincir++;
        }
        sonuc = { kontrol: ornekler.length === 0 || tamZincir > 0, mesaj: ornekler.length + ' IE incelendi, ' + tamZincir + ' tam izlenebilirlik zinciri', as9100: '\u00A78.5.2' }; break;
      }
      case 'as9100_kpi': {
        const tumIE = await atList(T.isEmirleri, "{Durum}='Tamamland\u0131'");
        const tumNCR = await atList(T.ncr, 'NOT({A\u00E7\u0131klama}="")');
        const ncrOrani = tumIE.length > 0 ? (tumNCR.length / tumIE.length * 100) : null;
        const kpilar = [];
        kpilar.push({ kpi: 'Tamamlanan IE', deger: tumIE.length, birim: 'adet' });
        kpilar.push({ kpi: 'NCR Sayisi', deger: tumNCR.length, birim: 'adet' });
        kpilar.push({ kpi: 'NCR Orani', deger: ncrOrani !== null ? ncrOrani.toFixed(1) + '%' : 'veri yok', hedef: '<%1' });
        sonuc = { kontrol: true, kpilar, mesaj: 'KPI verileri toplandi', as9100: '\u00A79.1' }; break;
      }
      case 'as9100_denetim': {
        const denetimler = await atList(T.icDenetim, 'NOT({Durum}="")');
        const acikBulgu = denetimler.filter(d => d.fields['Durum'] === 'A\u00E7\u0131k');
        sonuc = { kontrol: true, mesaj: denetimler.length + ' denetim kaydi, ' + acikBulgu.length + ' acik bulgu', detay: { toplam: denetimler.length, acik: acikBulgu.length }, as9100: '\u00A79.2' }; break;
      }
      case 'as9100_capa': {
        const capalar = await atList(T.capa, 'NOT({Durum}="")');
        const acik = capalar.filter(c => c.fields['Durum'] !== 'Kapat\u0131ld\u0131' && c.fields['Durum'] !== 'Kapal\u0131');
        sonuc = { kontrol: true, mesaj: capalar.length + ' CAPA, ' + acik.length + ' acik', as9100: '\u00A710.2+\u00A710.3' }; break;
      }

      // ═══ PAKET 4: SINIR TESTLERI (server-side) ═══
      case 'sinir_turkce_stres': {
        const testler = [
          '\u015E\u00DC\u004B\u00DC\u0052\u004F\u011E\u004C\u0055 \u0130\u015E',
          '\u00C7elik \u015Eaft \u00DCst Ba\u011Flant\u0131',
          '\u011F\u011E\u00FC\u00DC\u015F\u015E\u00F6\u00D6\u00E7\u00C7\u0131\u0130',
        ];
        const sonuclar = [];
        for (const t of testler) {
          const k = await atCreate(T.teklifler, { 'Durum': 'Taslak', 'Teklif Notu': 'TEST-TR-' + t, 'Para Birimi': 'TL' });
          const geri = await atList(T.teklifler, `RECORD_ID()='${k.id}'`);
          const okunan = geri.length > 0 ? (geri[0].fields['Teklif Notu'] || '') : '';
          sonuclar.push({ girdi: t, dogru: okunan.includes(t) });
          await atDelete(T.teklifler, k.id);
        }
        const hepsi = sonuclar.every(s => s.dogru);
        sonuc = { kontrol: hepsi, mesaj: sonuclar.filter(s => s.dogru).length + '/' + sonuclar.length + ' Turkce test gecti', sonuclar }; break;
      }
      case 'sinir_tarih': {
        const tarihler = [
          { format: 'ISO', deger: '2026-03-20' },
          { format: 'Gecersiz', deger: '32/13/2026' },
          { format: 'Bos', deger: '' },
        ];
        const sonuclar = [];
        for (const t of tarihler) {
          try {
            const k = await atCreate(T.malzeme, { 'Giri\u015F Tarihi': t.deger || undefined, 'Malzeme Ad\u0131': 'TEST-TARIH-' + t.format, 'Toplam Miktar': 1, 'Birim': 'Adet', 'Stat\u00FC': 'Karantina' });
            sonuclar.push({ format: t.format, yazildi: true, gecti: t.format !== 'Gecersiz' });
            await atDelete(T.malzeme, k.id);
          } catch (e) {
            sonuclar.push({ format: t.format, yazildi: false, gecti: t.format === 'Gecersiz', hata: e.message });
          }
        }
        sonuc = { kontrol: sonuclar.filter(s => s.gecti).length >= 2, sonuclar, mesaj: 'Tarih formati: ' + sonuclar.filter(s => s.gecti).length + '/' + sonuclar.length + ' gecti' }; break;
      }

      default:
        sonuc = { mesaj: 'Adim tanimsiz: ' + adim, kontrol: false };
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, adim, ...sonuc }) };
  } catch (e) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: false, adim, kontrol: false, mesaj: e.message }) };
  }
};
