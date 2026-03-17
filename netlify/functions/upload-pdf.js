const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers:CORS,body:JSON.stringify({error:'POST only'})};
  try {
    const {filename, data, recordId} = JSON.parse(event.body||'{}');
    if (!filename||!data||!recordId) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'eksik parametre'})};
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');
    const { getStore } = require('@netlify/blobs');
    const store = getStore('teknik-resimler');
    const key = recordId + '_' + filename;
    await store.set(key, buffer);
    const url = (process.env.URL||'https://ersan-mes.netlify.app') + '/.netlify/functions/get-pdf?key=' + encodeURIComponent(key);
    const BASE = process.env.AIRTABLE_BASE_ID||'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;
    const at = await fetch('https://api.airtable.com/v0/'+BASE+'/'+encodeURIComponent('Satış Emirleri')+'/'+recordId,{method:'PATCH',headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'},body:JSON.stringify({fields:{'Teknik Resim':[{url,filename}]}})});
    const atd = await at.json();
    if (atd.error) throw new Error('Airtable: '+JSON.stringify(atd.error));
    return {statusCode:200,headers:CORS,body:JSON.stringify({success:true,url})};
  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
