const BASE_ID   = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const AT_TOKEN  = process.env.AIRTABLE_TOKEN;
const RFQ_TABLE = process.env.RFQ_TABLE_ID || 'tblHmfCvNZq0qNtb1';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { token, recordId, birimFiyat, fiyatBirimi, teslimSuresi, malzemeCinsi, tedarikciOlculeri, gecerlilikTarihi, tedarikciNotu, vadeTeklifi } = body;

    if (!token || !recordId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'token ve recordId gerekli' }) };
    }

    // Token doğrula
    const getRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}/${recordId}`,
      { headers: { 'Authorization': `Bearer ${AT_TOKEN}` } }
    );
    const record = await getRes.json();

    if (!record.id || record.fields['Token'] !== token) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Geçersiz token' }) };
    }

    // Kaydı güncelle
    const updateRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}/${recordId}`,
      {
        method:  'PATCH',
        headers: {
          'Authorization': `Bearer ${AT_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Teklif Fiyatı':      parseFloat(birimFiyat)  || null,
            'Fiyat Birimi':       fiyatBirimi             || 'TL/adet',
            'Teslim Süresi Gün':  parseInt(teslimSuresi)  || null,
            'Malzeme Cinsi':      malzemeCinsi            || null,
            'Tedarikçi Ölçüleri': tedarikciOlculeri       || null,
            'Geçerlilik Tarihi':  gecerlilikTarihi        || null,
            'Tedarikçi Notu':     tedarikciNotu           || null,
            'Vade Teklifi':       parseInt(vadeTeklifi)   || null,
            'Yanıt Tarihi':       new Date().toISOString().split('T')[0],
            'Durum':              'Yanıtlandı',
          },
        }),
      }
    );

    const updated = await updateRes.json();
    if (updated.error) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: updated.error }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, id: updated.id }) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
