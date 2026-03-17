const BASE_ID   = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const AT_TOKEN  = process.env.AIRTABLE_TOKEN;
const RESEND_KEY = process.env.RESEND_API_KEY;
const BASE_URL  = process.env.BASE_URL || 'https://ersan-mes.netlify.app';
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
    const { seNo, parcaAdi, parcaNo, miktar, birim, tedarikciler } = JSON.parse(event.body || '{}');

    if (!tedarikciler || !tedarikciler.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Tedarikçi listesi boş' }) };
    }

    const results = [];

    for (const tedarikci of tedarikciler) {
      // 1. Airtable'a kayıt oluştur
      const token = crypto.randomBytes ? crypto.randomBytes(32).toString('hex') : Math.random().toString(36).slice(2) + Date.now().toString(36);

      let recordId = null;
      try {
        const atRes = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}`,
          {
            method:  'POST',
            headers: {
              'Authorization': `Bearer ${AT_TOKEN}`,
              'Content-Type':  'application/json',
            },
            body: JSON.stringify({
              fields: {
                'SE No':          seNo    || '',
                'Parça Adı':      parcaAdi || '',
                'Parça No':       parcaNo  || '',
                'Miktar':         miktar   || 0,
                'Birim':          birim    || 'Adet',
                'Tedarikçi Adı':  tedarikci.adi   || '',
                'Tedarikçi Email': tedarikci.email || '',
                'Token':          token,
                'Durum':          'Beklemede',
              },
            }),
          }
        );
        const atData = await atRes.json();
        recordId = atData.id || null;
      } catch (atErr) {
        results.push({ tedarikci: tedarikci.adi, status: 'saved', note: 'Airtable hatası: ' + atErr.message });
        continue;
      }

      // 2. Mail gönder (Resend API)
      if (!RESEND_KEY || !tedarikci.email) {
        results.push({ tedarikci: tedarikci.adi, status: 'saved', recordId, note: 'Mail gönderilmedi (API key veya email eksik)' });
        continue;
      }

      const rfqLink = `${BASE_URL}/ersan_rfq.html?token=${token}&rid=${recordId}`;

      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    'Ersan MES <satin-alma@ersanmakine.com.tr>',
            to:      [tedarikci.email],
            subject: `Fiyat Teklif Talebi — ${seNo} / ${parcaAdi}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#1e1b4b;padding:20px;border-radius:8px 8px 0 0;">
                  <h2 style="color:white;margin:0;">Fiyat Teklif Talebi</h2>
                  <p style="color:#a5b4fc;margin:4px 0 0;">Ersan Endüstriyel Makine San. Tic. Ltd. Şti.</p>
                </div>
                <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
                  <p>Sayın <strong>${tedarikci.adi}</strong>,</p>
                  <p>Aşağıdaki malzeme için fiyat teklifinizi bekliyoruz.</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr style="background:#f8fafc;">
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;">Sipariş No</td>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;">${seNo || '—'}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;">Parça Adı</td>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;">${parcaAdi || '—'}</td>
                    </tr>
                    <tr style="background:#f8fafc;">
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;">Parça No</td>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;">${parcaNo || '—'}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;">Miktar</td>
                      <td style="padding:8px 12px;border:1px solid #e2e8f0;">${miktar || 0} ${birim || 'Adet'}</td>
                    </tr>
                  </table>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="${rfqLink}" style="background:#7c3aed;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
                      Teklif Formunu Doldur →
                    </a>
                  </div>
                  <p style="color:#64748b;font-size:13px;">Bu link size özeldir, lütfen üçüncü şahıslarla paylaşmayın.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                  <p style="color:#94a3b8;font-size:12px;">
                    Ersan Endüstriyel Makine San. Tic. Ltd. Şti.<br>
                    Başiskele Sanayi Sitesi 12.Blok No:2, Kocaeli<br>
                    AS9100 Rev.D Kapsamında Üretim
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          results.push({ tedarikci: tedarikci.adi, status: 'sent', recordId });
        } else {
          const errData = await emailRes.json();
          results.push({ tedarikci: tedarikci.adi, status: 'saved', recordId, note: 'Mail hatası: ' + JSON.stringify(errData) });
        }
      } catch (mailErr) {
        results.push({ tedarikci: tedarikci.adi, status: 'saved', recordId, note: 'Mail hatası: ' + mailErr.message });
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, results }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
