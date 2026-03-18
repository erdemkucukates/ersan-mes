exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};

  const url = (event.queryStringParameters || {}).url;
  if (!url || !url.startsWith('https://res.cloudinary.com/')) {
    return {statusCode:400,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({error:'geçersiz URL'})};
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Cloudinary ' + res.status + ': ' + res.statusText);

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'application/pdf';

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="teknik-resim.pdf"',
        'Cache-Control': 'public, max-age=86400',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch(e) {
    console.log('[serve-pdf] ERROR:', e.message);
    return {statusCode:502,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({error:e.message})};
  }
};
