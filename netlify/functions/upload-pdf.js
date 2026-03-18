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

    // ── ADIM 1: Base64'u PDF Data alanina kaydet (aninda erisim icin) ──
    console.log('[upload-pdf] ADIM 1: PDF Data alanina base64 kaydediliyor...');
    const pdfDataRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
      {method:'PATCH', headers:{'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'},
       body:JSON.stringify({fields:{'PDF Data': base64}})}
    );
    const pdfDataResult = await pdfDataRes.json();
    if (pdfDataResult.error) {
      console.log('[upload-pdf] PDF Data HATA:', JSON.stringify(pdfDataResult.error));
    } else {
      const saved = pdfDataResult.fields?.['PDF Data'];
      console.log('[upload-pdf] PDF Data BASARILI, kayitli uzunluk:', saved ? saved.length : 0);
    }

    // ── ADIM 2: Cloudinary'ye yukle (attachment URL icin) ──
    let cloudinaryUrl = null;
    try {
      console.log('[upload-pdf] ADIM 2: Cloudinary yukleniyor...');
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
      console.log('[upload-pdf] Cloudinary status:', upRes.status, 'response:', JSON.stringify(upData).substring(0,300));

      if (upData.error) {
        console.log('[upload-pdf] Cloudinary HATA (devam ediliyor, PDF Data zaten kayitli):', upData.error.message);
      } else {
        cloudinaryUrl = upData.secure_url;
        console.log('[upload-pdf] Cloudinary BASARILI:', cloudinaryUrl);
      }
    } catch(cloudErr) {
      console.log('[upload-pdf] Cloudinary exception (devam ediliyor):', cloudErr.message);
    }

    // ── ADIM 3: Airtable Teknik Resim attachment (Cloudinary URL varsa) ──
    let attachmentOk = false;
    if (cloudinaryUrl) {
      console.log('[upload-pdf] ADIM 3: Airtable Teknik Resim guncelleniyor, URL:', cloudinaryUrl);
      const atRes = await fetch(
        `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
        {method:'PATCH', headers:{'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'},
         body:JSON.stringify({fields:{'Teknik Resim':[{url: cloudinaryUrl, filename}]}})}
      );
      const atData = await atRes.json();
      console.log('[upload-pdf] Airtable attachment status:', atRes.status);
      console.log('[upload-pdf] Airtable attachment response:', JSON.stringify(atData).substring(0,500));

      if (atData.error) {
        console.log('[upload-pdf] Airtable attachment HATA:', JSON.stringify(atData.error));
      } else {
        const att = atData.fields?.['Teknik Resim'];
        attachmentOk = !!(att && att.length > 0);
        console.log('[upload-pdf] Teknik Resim alani:', attachmentOk ? att[0].url : 'BOŞ');
      }
    }

    console.log('[upload-pdf] SONUC: PDF Data=OK, Cloudinary=' + (cloudinaryUrl ? 'OK' : 'ATLANILDI') + ', Attachment=' + (attachmentOk ? 'OK' : 'ATLANILDI'));
    return {statusCode:200,headers:CORS,body:JSON.stringify({
      success: true,
      url: cloudinaryUrl,
      pdfDataSaved: true,
      attachmentSaved: attachmentOk
    })};
  } catch(e) {
    console.log('[upload-pdf] FATAL ERROR:', e.message, e.stack);
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
