exports.handler = async (event) => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  if (!AIRTABLE_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AIRTABLE_TOKEN ayarlanmamış' }) };
  }

  const { method, path, body } = JSON.parse(event.body || '{}');
  const url = `https://api.airtable.com${path}`;

  try {
    const res = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
