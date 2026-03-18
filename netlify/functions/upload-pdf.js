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
    const {filename, data, recordId, table, field} = JSON.parse(event.body||'{}');
    console.log('[upload-pdf] START recordId:', recordId, 'filename:', filename, 'table:', table||'Satış Emirleri', 'dataLen:', (data||'').length);
    if (!filename||!data||!recordId) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'eksik parametre'})};

    // ── ADIM 1: Base64 → Buffer ──
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('[upload-pdf] Buffer:', buffer.length, 'bytes');

    // ── ADIM 2: Netlify Blobs'a kaydet ──
    const blobKey = recordId + '_' + filename.replace(/\s/g, '_');
    const siteID = process.env.SITE_ID;
    const token = process.env.NETLIFY_AUTH_TOKEN;
    console.log('[upload-pdf] Blob key:', blobKey, 'siteID:', siteID ? 'OK' : 'YOK', 'token:', token ? 'OK' : 'YOK');

    const store = getStore({ name: 'teknik-resimler', siteID, token });
    await store.set(blobKey, buffer, { metadata: { filename, contentType: 'application/pdf' } });
    console.log('[upload-pdf] Blob kaydedildi');

    // ── ADIM 3: Serve URL'yi Airtable'a kaydet (opsiyonel) ──
    const serveUrl = '/.netlify/functions/serve-pdf?key=' + encodeURIComponent(blobKey);
    const targetTable = table || 'Satış Emirleri';
    const targetField = field || 'PDF Data';

    if (targetField !== 'skip') {
      const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
      const TOKEN_AT = process.env.AIRTABLE_TOKEN;
      try {
        const patchRes = await fetch(
          `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(targetTable)}/${recordId}`,
          {method:'PATCH', headers:{'Authorization':`Bearer ${TOKEN_AT}`,'Content-Type':'application/json'},
           body:JSON.stringify({fields:{[targetField]: serveUrl}})}
        );
        const patchData = await patchRes.json();
        if (patchData.error) console.log('[upload-pdf] Airtable PATCH uyarisi:', JSON.stringify(patchData.error));
        else console.log('[upload-pdf] Airtable BASARILI:', serveUrl);
      } catch(atErr) {
        console.log('[upload-pdf] Airtable PATCH hatasi (dosya yine de yuklendi):', atErr.message);
      }
    } else {
      console.log('[upload-pdf] Airtable PATCH atlanildi (field=skip)');
    }

    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true, url:serveUrl})};
  } catch(e) {
    console.log('[upload-pdf] ERROR:', e.message);
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
