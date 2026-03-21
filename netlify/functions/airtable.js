const BASE  = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
const TOKEN = process.env.AIRTABLE_TOKEN;
const CORS  = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
const ATH = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type':  'application/json',
};

var COUNTER_MAP = {
  'QT':'QT_COUNTER', 'SO':'SO_COUNTER', 'WO':'WO_COUNTER',
  'PO':'PO_COUNTER', 'RFQ':'RFQ_COUNTER', 'NCR':'NCR_COUNTER',
  'FAI':'FAI_COUNTER', 'LOT':'LOT_COUNTER', 'INV':'INV_COUNTER',
  'PR':'PR_COUNTER', 'GRN':'GRN_COUNTER', 'CAR':'CAR_COUNTER',
  'DEV':'DEV_COUNTER', 'WAI':'WAI_COUNTER', 'SINV':'SINV_COUNTER',
  'MUSTERI':'MUSTERI_COUNTER', 'SEVKIYAT':'SEVKIYAT_COUNTER',
};

async function generateCode(prefix, padLength) {
  padLength = padLength || 5;
  var counterKey = COUNTER_MAP[prefix];
  if (!counterKey) throw new Error('Bilinmeyen prefix: ' + prefix);
  var yilSuffix = String(new Date().getFullYear()).slice(-2);
  var BASE_ID = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
  var TOKEN_VAL = process.env.AIRTABLE_TOKEN;
  var headers = { 'Authorization': 'Bearer ' + TOKEN_VAL, 'Content-Type': 'application/json' };

  // Find counter record in System Config
  var configRes = await fetch(
    'https://api.airtable.com/v0/' + BASE_ID + '/tbl1buK6696eY324j?filterByFormula=' + encodeURIComponent("{Key}='" + counterKey + "'") + '&maxRecords=1',
    { headers: headers }
  );
  var configData = await configRes.json();
  var rec = (configData.records || [])[0];

  var mevcutSayac = 0;
  if (rec) {
    // Value format: "YY:COUNT" e.g. "26:5"
    var parts = (rec.fields['Value'] || '').split(':');
    if (parts[0] === yilSuffix) {
      mevcutSayac = parseInt(parts[1]) || 0;
    }
  }

  var yeniSayac = mevcutSayac + 1;
  var yeniDeger = yilSuffix + ':' + yeniSayac;

  if (rec) {
    // Update existing record
    await fetch(
      'https://api.airtable.com/v0/' + BASE_ID + '/tbl1buK6696eY324j/' + rec.id,
      { method: 'PATCH', headers: headers, body: JSON.stringify({ fields: { 'Value': yeniDeger } }) }
    );
  } else {
    // Create new counter record
    await fetch(
      'https://api.airtable.com/v0/' + BASE_ID + '/tbl1buK6696eY324j',
      { method: 'POST', headers: headers, body: JSON.stringify({ fields: { 'Key': counterKey, 'Value': yeniDeger } }) }
    );
  }

  return prefix + '-' + yilSuffix + '-' + String(yeniSayac).padStart(padLength, '0');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};
  try {
    if (event.httpMethod === 'POST' && event.body) {
      const p = JSON.parse(event.body || '{}');

      if (p.action === 'generateCode') {
        try {
          var kod = await generateCode(p.prefix, p.padLength);
          return { statusCode: 200, headers: CORS, body: JSON.stringify({ kod: kod }) };
        } catch(e) {
          return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
        }
      }
      if (p.method === 'TOKEN') return {statusCode:200,headers:CORS,body:JSON.stringify({token:TOKEN})};
      if (p.method && p.path) {
        const r = await fetch('https://api.airtable.com' + p.path, {
          method: p.method, headers: ATH,
          body: (p.body && p.method !== 'GET') ? JSON.stringify(p.body) : undefined,
        });
        return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
      }
      const {table, fields, id} = p;
      if (!table) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'table gerekli'})};
      const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}${id?'/'+id:''}`;
      const r = await fetch(url, {method:'POST',headers:ATH,body:JSON.stringify({fields})});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    if (event.httpMethod === 'PATCH') {
      const {table,id,fields} = JSON.parse(event.body||'{}');
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`,{method:'PATCH',headers:ATH,body:JSON.stringify({fields})});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    if (event.httpMethod === 'DELETE') {
      const {table,id} = JSON.parse(event.body||'{}');
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${id}`,{method:'DELETE',headers:ATH});
      return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
    }
    const q = event.queryStringParameters || {};
    if (!q.table) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'table gerekli'})};
    const params = new URLSearchParams();
    if (q.filter)   params.append('filterByFormula', q.filter);
    if (q.sort)     params.append('sort[0][field]', q.sort);
    if (q.dir)      params.append('sort[0][direction]', q.dir);
    if (q.pageSize) params.append('pageSize', q.pageSize);
    if (q.offset)   params.append('offset', q.offset);
    const url = q.id
      ? `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(q.table)}/${q.id}`
      : `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(q.table)}?${params}`;
    const r = await fetch(url, {headers:ATH});
    return {statusCode:r.status,headers:CORS,body:JSON.stringify(await r.json())};
  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};
