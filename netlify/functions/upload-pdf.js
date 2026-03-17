const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers:CORS,body:JSON.stringify({error:'POST only'})};

  try {
    const {filename, data, recordId} = JSON.parse(event.body||'{}');
    if (!filename||!data||!recordId) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'eksik parametre'})};

    const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;

    // Step 1: Airtable upload URL al
    const upReq = await fetch(
      `https://content.airtable.com/v0/${BASE}/${recordId}/uploadAttachment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          filename: filename,
          field: 'Teknik Resim'
        })
      }
    );

    if (!upReq.ok) {
      // Fallback: Airtable content API desteklemiyorsa PATCH ile dene
      const base64 = data.includes(',') ? data.split(',')[1] : data;
      // Airtable attachment URL olarak data URL kabul etmez
      // Sadece Airtable'ın desteklediği: public URL
      // Bu yüzden PDF Data long text alanına kaydet
      const patchRes = await fetch(
        `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
        {
          method: 'PATCH',
          headers: {'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
          body: JSON.stringify({fields: {'PDF Data': JSON.stringify({filename, data: base64.substring(0, 99000), truncated: base64.length > 99000})}})
        }
      );
      const pd = await patchRes.json();
      if (pd.error) throw new Error('Patch: ' + JSON.stringify(pd.error));
      return {statusCode:200,headers:CORS,body:JSON.stringify({success:true,method:'longtext'})};
    }

    const upData = await upReq.json();
    // Step 2: Dosyayı upload et
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');

    const putRes = await fetch(upData.uploadUrl, {
      method: 'PUT',
      headers: {'Content-Type': upData.contentType || 'application/pdf'},
      body: buffer
    });

    if (!putRes.ok) throw new Error('Upload PUT failed: ' + putRes.status);

    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true,method:'airtable-native'})};

  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
