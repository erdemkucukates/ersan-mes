const fetch = require('node-fetch');
const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;
const CORS  = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
const ATH   = {'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};
  try {
    // POST — iki format destekleniyor
    if (event.httpMethod === 'POST' && event.body) {
      const p = JSON.parse(event.body || '{}');
      // Eski format: {method, path, body}
      if (p.method === 'TOKEN') return {statusCode:200,headers:CORS,body:JSON.stringify({token:TOKEN})};
      if (p.method && p.path) {
        const r = await fetch('https://api.airtable.com/v0' + p.path, {
          method: p.method, headers: ATH,
          body: (p.body && p.method !== 'GET') ? JSON.stringify(p.body) : undefined,
        });
        return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
      }
      // Yeni format: {table, fields, id}
      const {table, fields, id} = p;
      if (!table) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'table gerekli'})};
      const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}${id?'/'+id:''}`;
      const r = await fetch(url, {method:'POST',headers:ATH,body:JSON.stringify({fields})});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    // PATCH
    if (event.httpMethod === 'PATCH') {
      const {table,id,fields} = JSON.parse(event.body||'{}');
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`,
        {method:'PATCH',headers:ATH,body:JSON.stringify({fields})});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    // DELETE
    if (event.httpMethod === 'DELETE') {
      const {table,id} = JSON.parse(event.body||'{}');
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`,
        {method:'DELETE',headers:ATH});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    // GET
    const q = event.queryStringParameters || {};
    if (!q.table) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'table gerekli'})};
    const params = new URLSearchParams();
    if (q.filter)   params.append('filterByFormula', q.filter);
    if (q.sort)     params.append('sort[0][field]', q.sort);
    if (q.dir)      params.append('sort[0][direction]', q.dir);
    if (q.pageSize) params.append('pageSize', q.pageSize);
    if (q.offset)   params.append('offset', q.offset);
    if (q.view)     params.append('view', q.view);
    const url = q.id
      ? `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(q.table)}/${q.id}`
      : `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(q.table)}?${params}`;
    const r = await fetch(url, {headers:ATH});
    return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
