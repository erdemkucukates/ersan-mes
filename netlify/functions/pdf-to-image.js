const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

    const tmpDir  = os.tmpdir();
    const pdfPath = path.join(tmpDir, `pdf_${Date.now()}.pdf`);
    const outBase = path.join(tmpDir, `page_${Date.now()}`);

    fs.writeFileSync(pdfPath, Buffer.from(b64, 'base64'));

    // PDF sayfalarini PNG'ye cevir (150 DPI)
    execSync(`pdftoppm -r 150 -png "${pdfPath}" "${outBase}"`, { timeout: 30000 });

    // Cikan dosyalari bul
    const baseName = path.basename(outBase);
    const files = fs.readdirSync(tmpDir)
      .filter(f => f.startsWith(baseName) && f.endsWith('.png'))
      .sort();

    if (!files.length) throw new Error('Goruntu olusturulamadi');

    const pages = files.map(f => {
      const imgPath = path.join(tmpDir, f);
      const b64img = fs.readFileSync(imgPath).toString('base64');
      try { fs.unlinkSync(imgPath); } catch(e) {}
      return b64img;
    });

    try { fs.unlinkSync(pdfPath); } catch(e) {}

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, pages, count: pages.length })
    };

  } catch(e) {
    console.error('PDF->Goruntu hatasi:', e);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
