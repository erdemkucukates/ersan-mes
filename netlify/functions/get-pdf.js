const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    const key = decodeURIComponent(event.queryStringParameters?.key || '');
    if (!key) return { statusCode: 400, body: 'key gerekli' };

    const store = getStore({ name: 'teknik-resimler', consistency: 'strong' });
    const blob = await store.get(key, { type: 'arrayBuffer' });
    if (!blob) return { statusCode: 404, body: 'Dosya bulunamadı' };

    const ext = key.split('.').pop().toLowerCase();
    const mime = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': mime,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000'
      },
      body: Buffer.from(blob).toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
