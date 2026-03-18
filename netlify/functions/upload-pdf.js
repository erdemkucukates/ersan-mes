const { getStore } = require('@netlify/blobs');

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

    // ── ADIM 1: Base64 → Buffer ──
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('[upload-pdf] Buffer boyutu:', buffer.length, 'bytes');

    // ── ADIM 2: Netlify Blobs'a kaydet ──
    const blobKey = recordId + '/' + filename.replace(/\s/g, '_');
    console.log('[upload-pdf] Blob key:', blobKey);
    const store = getStore('teknik-resimler');
    await store.set(blobKey, buffer, { metadata: { filename, recordId, contentType: 'application/pdf' } });
    console.log('[upload-pdf] Blob kaydedildi');

    // ── ADIM 3: Serve URL'yi Airtable PDF Data alanina kaydet ──
    const serveUrl = '/.netlify/functions/serve-pdf?key=' + encodeURIComponent(blobKey);
    const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;

    const patchRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
      {method:'PATCH', headers:{'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'},
       body:JSON.stringify({fields:{'PDF Data': serveUrl}})}
    );
    const patchData = await patchRes.json();
    if (patchData.error) throw new Error('Airtable: ' + JSON.stringify(patchData.error));
    console.log('[upload-pdf] Airtable PDF Data kaydedildi:', serveUrl);

    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true, url:serveUrl})};
  } catch(e) {
    console.log('[upload-pdf] ERROR:', e.message, e.stack);
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
