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
    console.log('[upload-pdf] START recordId:', recordId, 'filename:', filename, 'dataLen:', (data||'').length);
    if (!filename||!data||!recordId) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'eksik parametre'})};

    const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;
    const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    const KEY   = process.env.CLOUDINARY_API_KEY;
    const SEC   = process.env.CLOUDINARY_API_SECRET;
    const base64 = data.includes(',') ? data : 'data:application/pdf;base64,' + data;

    // ── ADIM 1: Cloudinary'ye yukle ──
    console.log('[upload-pdf] ADIM 1: Cloudinary yukleniyor...');
    const timestamp = Math.floor(Date.now()/1000);
    const publicId = 'teknik-resim/' + recordId + '_' + filename.replace(/\s/g,'_');
    const crypto = require('crypto');
    const signature = crypto.createHash('sha256').update(`public_id=${publicId}&timestamp=${timestamp}${SEC}`).digest('hex');

    const fd = new URLSearchParams();
    fd.append('file', base64);
    fd.append('api_key', KEY);
    fd.append('timestamp', String(timestamp));
    fd.append('public_id', publicId);
    fd.append('signature', signature);

    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`, {method:'POST', body: fd});
    const upData = await upRes.json();
    console.log('[upload-pdf] Cloudinary status:', upRes.status, JSON.stringify(upData).substring(0,300));
    if (upData.error) throw new Error('Cloudinary: ' + upData.error.message);

    const cloudinaryUrl = upData.secure_url;
    console.log('[upload-pdf] Cloudinary URL:', cloudinaryUrl);

    // ── ADIM 2: serve-pdf proxy URL'yi PDF Data alanina kaydet ──
    const serveUrl = '/.netlify/functions/serve-pdf?url=' + encodeURIComponent(cloudinaryUrl);
    console.log('[upload-pdf] ADIM 2: Airtable PDF Data kaydediliyor:', serveUrl);

    const patchRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
      {method:'PATCH', headers:{'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'},
       body:JSON.stringify({fields:{'PDF Data': serveUrl}})}
    );
    const patchData = await patchRes.json();
    if (patchData.error) throw new Error('Airtable: ' + JSON.stringify(patchData.error));
    console.log('[upload-pdf] BASARILI');

    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true, url:serveUrl})};
  } catch(e) {
    console.log('[upload-pdf] ERROR:', e.message);
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
