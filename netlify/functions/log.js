const BASE = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200, headers:CORS, body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405, headers:CORS, body:JSON.stringify({error:'POST only'})};

  try {
    const body = JSON.parse(event.body || '{}');
    const fields = {
      'Tarih Saat': new Date().toISOString(),
      'Kullanıcı': body.kullanici || 'Bilinmiyor',
      'İşlem Tipi': body.islemTipi || 'Diğer',
      'Modül': body.modul || 'Diğer',
      'Kayıt ID': body.kayitId || '',
      'Kayıt Özeti': (body.kayitOzeti || '').substring(0, 200),
      'Eski Değer': (body.eskiDeger || '').substring(0, 10000),
      'Yeni Değer': (body.yeniDeger || '').substring(0, 10000),
      'IP / Cihaz': (body.cihaz || '').substring(0, 100),
    };
    if (body.notlar) fields['Notlar'] = body.notlar.substring(0, 5000);

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Sistem Logu')}`,
      {
        method: 'POST',
        headers: {'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({fields})
      }
    );
    const data = await res.json();
    if (data.error) {
      console.log('[LOG] Airtable error:', JSON.stringify(data.error));
      return {statusCode:200, headers:CORS, body:JSON.stringify({logged:false, error:data.error})};
    }
    return {statusCode:200, headers:CORS, body:JSON.stringify({logged:true, id:data.id})};
  } catch(e) {
    console.log('[LOG] Error:', e.message);
    return {statusCode:200, headers:CORS, body:JSON.stringify({logged:false, error:e.message})};
  }
};
