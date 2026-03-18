const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};

  const key = (event.queryStringParameters || {}).key;
  if (!key) return {statusCode:400,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({error:'key parametresi gerekli'})};

  try {
    const store = getStore('teknik-resimler');
    const blob = await store.get(key, { type: 'arrayBuffer' });
    if (!blob) return {statusCode:404,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({error:'PDF bulunamadı'})};

    const buffer = Buffer.from(blob);
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="' + key.split('/').pop() + '"',
        'Cache-Control': 'public, max-age=86400',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch(e) {
    console.log('[serve-pdf] ERROR:', e.message);
    return {statusCode:500,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({error:e.message})};
  }
};
