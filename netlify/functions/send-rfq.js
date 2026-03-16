exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const BASE_URL = process.env.BASE_URL || 'https://ersan-mes.netlify.app';
  const BASE_ID = 'app5LDgJMgocw79Ix';
  const RFQ_TABLE = process.env.RFQ_TABLE_ID;

  if (!AIRTABLE_TOKEN) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'AIRTABLE_TOKEN eksik' }) };
  }
  if (!RESEND_API_KEY) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'RESEND_API_KEY eksik — resend.com den API key alın ve Netlify env e ekleyin' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { seNo, parcaAdi, parcaNo, miktar, birim, malzeme, olcu, tedarikciler } = body;

    if (!tedarikciler?.length) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Tedarikçi listesi boş' }) };
    }

    const results = [];

    for (const tedarikci of tedarikciler) {
      try {
        const token = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        let recordId = null;

        // Airtable'a RFQ kaydı oluştur (tablo varsa)
        if (RFQ_TABLE) {
          const atRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                'Token': token,
                'SE No': seNo || '',
                'Parça Adı': parcaAdi || '',
                'Parça No': parcaNo || '',
                'Miktar': miktar || 0,
                'Birim': birim || 'Adet',
                'Tedarikçi Adı': tedarikci.adi || '',
                'Tedarikçi Email': tedarikci.email || '',
                'Durum': 'Beklemede',
              }
            })
          });
          if (atRes.ok) {
            const atData = await atRes.json();
            recordId = atData.id;
          } else {
            console.error('Airtable RFQ error:', await atRes.text());
          }
        }

        const rfqUrl = recordId
          ? `${BASE_URL}/ersan_rfq.html?token=${token}&rid=${recordId}`
          : `${BASE_URL}/ersan_rfq.html?token=${token}`;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Ersan Endüstriyel <satin.alma@ersanmakine.com.tr>',
            to: [tedarikci.email],
            subject: `Fiyat Teklif Talebi — ${seNo} / ${parcaAdi}`,
            html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
    <div style="background:#1e1b4b;padding:24px;text-align:center;">
      <div style="color:white;font-size:22px;font-weight:700;">ERSAN ENDÜSTRİYEL</div>
      <div style="color:#a5b4fc;font-size:13px;margin-top:4px;">Makine ve Makine Parçaları İmalatı | Kocaeli</div>
    </div>
    <div style="padding:28px;">
      <h2 style="color:#1e1b4b;margin-top:0;">Fiyat Teklif Talebiniz</h2>
      <p style="color:#555;">Sayın <strong>${tedarikci.adi}</strong>,</p>
      <p style="color:#555;">Aşağıdaki malzeme/hizmet için fiyat teklifinizi bekliyoruz.</p>
      <div style="background:#f8f8ff;border:1px solid #e0e0f0;border-radius:8px;padding:16px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#666;width:140px;">Sipariş No</td><td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${seNo||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Parça Adı</td><td style="padding:6px 0;font-weight:600;">${parcaAdi||'—'}</td></tr>
          ${parcaNo?`<tr><td style="padding:6px 0;color:#666;">Parça No</td><td style="padding:6px 0;">${parcaNo}</td></tr>`:''}
          <tr><td style="padding:6px 0;color:#666;">Miktar</td><td style="padding:6px 0;font-weight:600;">${miktar||0} ${birim||'Adet'}</td></tr>
          ${malzeme?`<tr><td style="padding:6px 0;color:#666;">Malzeme</td><td style="padding:6px 0;">${malzeme}</td></tr>`:''}
          ${olcu?`<tr><td style="padding:6px 0;color:#666;">Ölçü / Spec</td><td style="padding:6px 0;">${olcu}</td></tr>`:''}
        </table>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${rfqUrl}" style="background:#6366f1;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
          📋 Teklif Formunu Aç
        </a>
      </div>
      <p style="color:#888;font-size:12px;">Bu link size özeldir. Lütfen üçüncü şahıslarla paylaşmayın.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="color:#aaa;font-size:11px;text-align:center;">
        Ersan Endüstriyel Makine San. Tic. Ltd. Şti.<br>
        Başiskele Sanayi Sitesi 12.Blok No:2, Kocaeli<br>
        Kalite Sorumlusu: Erdem Küçükateş | AS9100 Rev.D
      </p>
    </div>
  </div>
</body>
</html>`
          })
        });

        if (emailRes.ok) {
          results.push({ tedarikci: tedarikci.adi, status: 'sent', recordId });
        } else {
          const err = await emailRes.json().catch(()=>({message:'Email gönderilemedi'}));
          results.push({ tedarikci: tedarikci.adi, status: 'failed', error: err.message||JSON.stringify(err) });
        }
      } catch(innerErr) {
        results.push({ tedarikci: tedarikci.adi||'?', status: 'failed', error: innerErr.message });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, results })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const BASE_URL = process.env.BASE_URL || 'https://ersan-mes.netlify.app';
  const BASE_ID = 'app5LDgJMgocw79Ix';
  const RFQ_TABLE = process.env.RFQ_TABLE_ID; // Satınalma Teklifleri table ID

  if (!AIRTABLE_TOKEN || !RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Eksik ortam değişkeni' }) };
  }

  try {
    const { seNo, parcaAdi, parcaNo, miktar, birim, tedarikciler } = JSON.parse(event.body);
    // tedarikciler = [{ id, adi, email }]

    const results = [];

    for (const tedarikci of tedarikciler) {
      // 1. Benzersiz token oluştur
      const token = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // 2. Airtable'a RFQ kaydı oluştur
      const atRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${RFQ_TABLE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Token': token,
            'SE No': seNo,
            'Parça Adı': parcaAdi,
            'Parça No': parcaNo || '',
            'Miktar': miktar || 0,
            'Birim': birim || 'Adet',
            'Tedarikçi Adı': tedarikci.adi,
            'Tedarikçi Email': tedarikci.email,
            'Durum': 'Beklemede',
          }
        })
      });

      if (!atRes.ok) {
        console.error('Airtable error:', await atRes.text());
        continue;
      }

      const atData = await atRes.json();
      const recordId = atData.id;

      // 3. Tedarikçiye mail gönder
      const rfqUrl = `${BASE_URL}/ersan_rfq.html?token=${token}&rid=${recordId}`;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ersan Endüstriyel <satin.alma@ersanmakine.com.tr>',
          to: [tedarikci.email],
          subject: `Fiyat Teklif Talebi — ${seNo} / ${parcaAdi}`,
          html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
    <div style="background: #1e1b4b; padding: 24px; text-align: center;">
      <div style="color: white; font-size: 22px; font-weight: 700;">ERSAN ENDÜSTRİYEL</div>
      <div style="color: #a5b4fc; font-size: 13px; margin-top: 4px;">Makine ve Makine Parçaları İmalatı | Kocaeli</div>
    </div>
    <div style="padding: 28px;">
      <h2 style="color: #1e1b4b; margin-top: 0;">Fiyat Teklif Talebiniz</h2>
      <p style="color: #555;">Sayın <strong>${tedarikci.adi}</strong>,</p>
      <p style="color: #555;">Aşağıdaki malzeme/hizmet için fiyat teklifinizi bekliyoruz. Lütfen aşağıdaki butona tıklayarak online teklif formunu doldurun.</p>
      
      <div style="background: #f8f8ff; border: 1px solid #e0e0f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 140px;">Sipariş No</td><td style="padding: 6px 0; font-weight: 600; color: #1e1b4b;">${seNo}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Parça Adı</td><td style="padding: 6px 0; font-weight: 600;">${parcaAdi}</td></tr>
          ${parcaNo ? `<tr><td style="padding: 6px 0; color: #666;">Parça No</td><td style="padding: 6px 0;">${parcaNo}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; color: #666;">Miktar</td><td style="padding: 6px 0; font-weight: 600;">${miktar} ${birim}</td></tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${rfqUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
          📋 Teklif Formunu Aç
        </a>
      </div>

      <p style="color: #888; font-size: 12px;">Bu link size özeldir. Lütfen üçüncü şahıslarla paylaşmayın.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #aaa; font-size: 11px; text-align: center;">
        Ersan Endüstriyel Makine San. Tic. Ltd. Şti.<br>
        Başiskele Sanayi Sitesi 12.Blok No:2, Kocaeli<br>
        Kalite Sorumlusu: Erdem Küçükateş | AS9100 Rev.D
      </p>
    </div>
  </div>
</body>
</html>`
        })
      });

      if (emailRes.ok) {
        results.push({ tedarikci: tedarikci.adi, status: 'sent', recordId });
      } else {
        const err = await emailRes.json();
        results.push({ tedarikci: tedarikci.adi, status: 'failed', error: err });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, results })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
