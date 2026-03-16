exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = 'app5LDgJMgocw79Ix';
  const RFQ_TABLE = process.env.RFQ_TABLE_ID || 'tblHmfCvNZq0qNtb1';

  try {
    const { recordId, teklifFiyati, fiyatBirimi, teslimSuresi, tedarikciOlculeri,
            malzemeCinsi, gecerlilikTarihi, tedarikciNotu } = JSON.parse(event.body);

    const today = new Date().toISOString().split('T')[0];

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Teklif Fiyatı': parseFloat(teklifFiyati) || 0,
          'Fiyat Birimi': fiyatBirimi || 'TL/Adet',
          'Teslim Süresi Gün': parseInt(teslimSuresi) || 0,
          'Tedarikçi Ölçüleri': tedarikciOlculeri || '',
          'Malzeme Cinsi': malzemeCinsi || '',
          'Geçerlilik Tarihi': gecerlilikTarihi || null,
          'Tedarikçi Notu': tedarikciNotu || '',
          'Yanıt Tarihi': today,
          'Durum': 'Yanıtlandı',
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: err }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
