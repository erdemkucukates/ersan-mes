const zlib = require('zlib');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { b64 } = JSON.parse(event.body || '{}');
    if (!b64) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'b64 gerekli' }) };

    const buffer = Buffer.from(b64, 'base64');
    const results = [];

    // Tum zlib stream'leri bul ve decompress et
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(buffer.toString('binary'))) !== null) {
      try {
        const streamData = Buffer.from(match[1], 'binary');
        const decompressed = zlib.inflateSync(streamData);
        const text = decompressed.toString('utf-8');

        // Ilgili icerik var mi?
        var keywords = ['teklif', 'kalem', 'sipari', 'miktar', 'adet', 'malzeme',
                       'musteri', 'firma', 'parça', 'parca', 'fiyat', 'tarih',
                       'quantity', 'material', 'customer', 'order'];
        var lower = text.toLowerCase();
        if (keywords.some(function(k) { return lower.indexOf(k) > -1; })) {
          // XML taglerini temizle
          var clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (clean.length > 50) {
            results.push(clean.substring(0, 5000));
          }
        }
      } catch (e) {
        // Decompress basarisiz — atla
      }
    }

    // FlateDecode olmayan text content'i de tara
    var textMatches = buffer.toString('binary').match(/\(([^)]{10,})\)/g);
    if (textMatches) {
      var textParts = textMatches
        .map(function(m) { return m.slice(1, -1); })
        .filter(function(t) {
          var lower = t.toLowerCase();
          return keywords.some(function(k) { return lower.indexOf(k) > -1; });
        });
      if (textParts.length > 0) {
        results.push(textParts.join(' ').substring(0, 3000));
      }
    }

    console.log('[parse-xfa] Bulunan stream sayisi:', results.length, 'toplam karakter:', results.join('').length);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: results.length > 0,
        text: results.join('\n\n---\n\n').substring(0, 10000),
        stream_count: results.length
      })
    };

  } catch (e) {
    console.error('[parse-xfa] Hata:', e.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message, success: false })
    };
  }
};
