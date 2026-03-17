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

    const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    const KEY   = process.env.CLOUDINARY_API_KEY;
    const SEC   = process.env.CLOUDINARY_API_SECRET;

    // Cloudinary upload (unsigned base64)
    const base64 = data.includes(',') ? data : 'data:application/pdf;base64,' + data;
    const formData = new URLSearchParams();
    formData.append('file', base64);
    formData.append('upload_preset', 'ml_default');
    formData.append('public_id', 'teknik-resim/' + recordId + '_' + filename.replace(/\s/g,'_'));
    formData.append('resource_type', 'raw');

    // Signed upload
    const timestamp = Math.floor(Date.now()/1000);
    const publicId = 'teknik-resim/' + recordId + '_' + filename.replace(/\s/g,'_');
    const crypto = require('crypto');
    const sigStr = `public_id=${publicId}&timestamp=${timestamp}&upload_preset=ml_default${SEC}`;
    const signature = crypto.createHash('sha256').update(sigStr).digest('hex');

    const fd = new URLSearchParams();
    fd.append('file', base64);
    fd.append('api_key', KEY);
    fd.append('timestamp', timestamp);
    fd.append('public_id', publicId);
    fd.append('signature', signature);
    fd.append('resource_type', 'raw');

    const upRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`,
      {method:'POST', body: fd}
    );
    const upData = await upRes.json();
    if (upData.error) throw new Error('Cloudinary: ' + upData.error.message);

    const url = upData.secure_url;

    // Airtable attachment guncelle
    const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;
    const at = await fetch(
      'https://api.airtable.com/v0/'+BASE+'/'+encodeURIComponent('Satış Emirleri')+'/'+recordId,
      {method:'PATCH', headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'},
       body:JSON.stringify({fields:{'Teknik Resim':[{url, filename}]}})}
    );
    const atd = await at.json();
    if (atd.error) throw new Error('Airtable: '+JSON.stringify(atd.error));

    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true,url})};
  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
