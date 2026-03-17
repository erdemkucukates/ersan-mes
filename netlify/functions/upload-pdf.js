const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const { filename, data, recordId } = body;

    if (!filename || !data || !recordId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'filename, data ve recordId gerekli' }) };
    }

    // Base64'ten buffer'a çevir
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64Data, 'base64');

    // Netlify Blobs'a kaydet
    const store = getStore({ name: 'teknik-resimler', consistency: 'strong' });
    const key = `${recordId}/${filename}`;
    await store.set(key, buffer, {
      metadata: { filename, recordId, uploadedAt: new Date().toISOString() }
    });

    // Public URL oluştur
    const siteUrl = process.env.URL || 'https://ersan-mes.netlify.app';
    const publicUrl = `${siteUrl}/.netlify/functions/get-pdf?key=${encodeURIComponent(key)}`;

    // Airtable'a URL yaz
    const BASE = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
    const TOKEN = process.env.AIRTABLE_TOKEN;
    const atRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent('Satış Emirleri')}/${recordId}`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { 'Teknik Resim': [{ url: publicUrl, filename }] } })
      }
    );
    const atData = await atRes.json();
    if (atData.error) throw new Error('Airtable: ' + JSON.stringify(atData.error));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, url: publicUrl, key })
    };

  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
