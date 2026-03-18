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
    // Cloudinary API credentials ile authenticated download
    const KEY = process.env.CLOUDINARY_API_KEY;
    const SEC = process.env.CLOUDINARY_API_SECRET;
    const auth = Buffer.from(KEY + ':' + SEC).toString('base64');

    const res = await fetch(url, {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    console.log('[serve-pdf] Cloudinary fetch status:', res.status, 'url:', url.substring(0, 80));

    if (!res.ok) {
      // Basic auth calismadiysa, API token ile dene
      const res2 = await fetch(url);
      if (!res2.ok) throw new Error('Cloudinary ' + res.status + ' / ' + res2.status);
      const buffer2 = Buffer.from(await res2.arrayBuffer());
      return {
        statusCode:200,
        headers:{...CORS,'Content-Type':'application/pdf','Cache-Control':'public, max-age=86400'},
        body:buffer2.toString('base64'),
        isBase64Encoded:true
      };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
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
