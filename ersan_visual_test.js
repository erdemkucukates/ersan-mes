#!/usr/bin/env node
/**
 * Ersan MES — Gorsel Regresyon Test Motoru
 * Canli sayfalardan baseline alir, degisiklikleri tespit eder.
 * Kullanim:
 *   node ersan_visual_test.js --baseline        → Referans screenshot kaydet
 *   node ersan_visual_test.js                   → Karsilastirma yap
 *   node ersan_visual_test.js --sayfa=rfq_talepler  → Tek sayfa test
 */

var playwright  = require('playwright');
var fs          = require('fs');
var path        = require('path');
var PNG         = require('pngjs').PNG;
var pixelmatch  = require('pixelmatch');

var CONFIG = JSON.parse(fs.readFileSync('ersan_visual_config.json', 'utf8'));
var ARGS   = process.argv.slice(2);
var BASELINE = ARGS.indexOf('--baseline') >= 0;
var SAYFA_ID = null;
for (var a = 0; a < ARGS.length; a++) {
  if (ARGS[a].indexOf('--sayfa=') === 0) SAYFA_ID = ARGS[a].split('=')[1];
}

// Klasorleri olustur
[CONFIG.referansKlasor, CONFIG.ekrangoruntusKlasor, CONFIG.raporKlasor].forEach(function(d) {
  fs.mkdirSync(d, { recursive: true });
});

// ── YARDIMCILAR ──

function log(mesaj, tip) {
  tip = tip || 'info';
  var renkler = { info:'\x1b[36m', ok:'\x1b[32m', warn:'\x1b[33m', err:'\x1b[31m', reset:'\x1b[0m' };
  var zaman = new Date().toLocaleTimeString('tr-TR');
  console.log((renkler[tip]||'') + '[' + zaman + '] ' + mesaj + renkler.reset);
}

// ── SCREENSHOT ──

async function ekranGoruntusu(browser, sayfaKonfig, ciktiYolu) {
  var sayfa = await browser.newPage();
  await sayfa.setViewportSize(sayfaKonfig.viewport || { width: 1280, height: 900 });

  await sayfa.goto(CONFIG.baseUrl + sayfaKonfig.canliUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Sekme tiklama
  if (sayfaKonfig.sekme) {
    try {
      await sayfa.click('[onclick*="' + sayfaKonfig.sekme + '"]');
      await sayfa.waitForTimeout(800);
    } catch(e) { /* sekme bulunamadi */ }
  }

  // Element bekleme
  if (sayfaKonfig.bekle) {
    try { await sayfa.waitForSelector(sayfaKonfig.bekle, { timeout: 10000 }); }
    catch(e) { /* element bulunamadi */ }
  }

  // Sidebar + veri yuklenmesi icin ekstra bekleme
  await sayfa.waitForTimeout(2000);

  await sayfa.screenshot({ path: ciktiYolu, fullPage: false });
  await sayfa.close();
  return ciktiYolu;
}

// ── PIXEL KARSILASTIRMA ──

function pixelKarsilastir(referansYol, canliYol, farkYol) {
  try {
    var refBuf = fs.readFileSync(referansYol);
    var canBuf = fs.readFileSync(canliYol);
    var ref = PNG.sync.read(refBuf);
    var can = PNG.sync.read(canBuf);

    var genislik  = Math.min(ref.width, can.width);
    var yukseklik = Math.min(ref.height, can.height);
    var fark = new PNG({ width: genislik, height: yukseklik });

    var farkSayisi = pixelmatch(
      ref.data, can.data, fark.data,
      genislik, yukseklik,
      { threshold: 0.1, includeAA: false }
    );

    fs.writeFileSync(farkYol, PNG.sync.write(fark));
    var toplamPixel = genislik * yukseklik;
    var farkYuzdesi = toplamPixel > 0 ? parseFloat((farkSayisi / toplamPixel * 100).toFixed(2)) : 100;
    return { farkYuzdesi: farkYuzdesi, farkSayisi: farkSayisi, toplamPixel: toplamPixel };
  } catch(e) {
    return { farkYuzdesi: 100, farkSayisi: -1, toplamPixel: 0, hata: e.message };
  }
}

// ── HTML RAPOR ──

function htmlRaporOlustur(sonuclar, zaman) {
  var raporYolu = path.join(CONFIG.raporKlasor, 'rapor_' + zaman + '.html');

  var gecen = 0;
  var toplam = sonuclar.length;
  var toplamFark = 0;
  for (var s = 0; s < sonuclar.length; s++) {
    if (sonuclar[s].gecti) gecen++;
    toplamFark += sonuclar[s].farkYuzdesi;
  }
  var ortFark = toplam > 0 ? (toplamFark / toplam).toFixed(1) : '0';

  var kartlarHtml = '';
  for (var i = 0; i < sonuclar.length; i++) {
    var r = sonuclar[i];
    var refRel = r.referansYol ? path.relative(CONFIG.raporKlasor, r.referansYol).replace(/\\/g,'/') : '';
    var canRel = r.canliYol ? path.relative(CONFIG.raporKlasor, r.canliYol).replace(/\\/g,'/') : '';
    var frkRel = r.farkYol ? path.relative(CONFIG.raporKlasor, r.farkYol).replace(/\\/g,'/') : '';
    var sinif = r.gecti ? 'gecti' : 'kaldi';
    var farkCls = r.farkYuzdesi < 5 ? 'iyi' : r.farkYuzdesi < 15 ? 'orta' : 'kotu';

    kartlarHtml += '<div class="kart ' + sinif + '">' +
      '<div class="kh"><span class="kid">' + r.sayfaId + '</span>' +
      '<span class="kyuz ' + farkCls + '">%' + r.farkYuzdesi + ' fark</span>' +
      '<span class="kson">' + (r.gecti ? '✓ GECTI' : '✗ KALDI') + '</span></div>' +
      '<div class="gorseller">' +
      '<div class="gkol"><div class="gb">Referans</div>' + (refRel ? '<img src="' + refRel + '">' : '<div class="yok">—</div>') + '</div>' +
      '<div class="gkol"><div class="gb">Canli</div>' + (canRel ? '<img src="' + canRel + '">' : '<div class="yok">—</div>') + '</div>' +
      '<div class="gkol"><div class="gb">Fark Haritasi</div>' + (frkRel ? '<img src="' + frkRel + '">' : '<div class="yok">—</div>') + '</div>' +
      '</div></div>';
  }

  var html = '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">' +
    '<title>Ersan MES — Gorsel Test Raporu</title><style>' +
    'body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;margin:0}' +
    'h1{font-size:20px;color:#f8fafc;margin-bottom:4px}' +
    '.ozet{display:flex;gap:16px;margin-bottom:20px;padding:12px 16px;background:#1e293b;border-radius:8px;border:1px solid #334155}' +
    '.oz label{font-size:10px;color:#64748b;text-transform:uppercase;display:block}.oz .val{font-size:24px;font-weight:700}' +
    '.iyi{color:#10b981}.orta{color:#f59e0b}.kotu{color:#ef4444}' +
    '.kart{background:#1e293b;border-radius:10px;border:1px solid #334155;overflow:hidden;margin-bottom:16px}' +
    '.kart.gecti{border-left:4px solid #10b981}.kart.kaldi{border-left:4px solid #ef4444}' +
    '.kh{display:flex;align-items:center;gap:12px;padding:10px 16px;background:#0f172a;border-bottom:1px solid #334155}' +
    '.kid{font-size:13px;font-weight:700;color:#f8fafc;font-family:monospace}' +
    '.kyuz{font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px;background:#1e293b}' +
    '.kson{margin-left:auto;font-size:11px;font-weight:600}' +
    '.gorseller{display:grid;grid-template-columns:repeat(3,1fr)}' +
    '.gkol{padding:12px;border-right:1px solid #334155}.gkol:last-child{border-right:none}' +
    '.gb{font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:8px}' +
    '.gkol img{width:100%;border-radius:4px;border:1px solid #334155}' +
    '.yok{color:#475569;font-size:12px;padding:20px;text-align:center}' +
    '</style></head><body>' +
    '<h1>Ersan MES — Gorsel Test Raporu</h1>' +
    '<p style="color:#64748b;font-size:12px;margin-bottom:16px">' + new Date().toLocaleString('tr-TR') + '</p>' +
    '<div class="ozet">' +
    '<div class="oz"><label>Test Edilen</label><div class="val">' + toplam + '</div></div>' +
    '<div class="oz"><label>Gecti</label><div class="val iyi">' + gecen + '</div></div>' +
    '<div class="oz"><label>Kaldi</label><div class="val kotu">' + (toplam - gecen) + '</div></div>' +
    '<div class="oz"><label>Ort. Fark</label><div class="val ' + (ortFark < 5 ? 'iyi' : ortFark < 15 ? 'orta' : 'kotu') + '">%' + ortFark + '</div></div>' +
    '</div>' + kartlarHtml + '</body></html>';

  fs.writeFileSync(raporYolu, html);
  return raporYolu;
}

// ── ANA PROGRAM ──

async function main() {
  log('Ersan MES Gorsel Test Motoru baslatiliyor...', 'info');
  log('Mod: ' + (BASELINE ? 'BASELINE KAYDET' : 'KARSILASTIRMA'), 'info');
  log('URL: ' + CONFIG.baseUrl, 'info');

  var browser = await playwright.chromium.launch({ headless: true });

  var sayfalar = CONFIG.sayfalar;
  if (SAYFA_ID) {
    sayfalar = sayfalar.filter(function(s) { return s.id === SAYFA_ID; });
    if (!sayfalar.length) { log('Sayfa bulunamadi: ' + SAYFA_ID, 'err'); process.exit(1); }
  }

  var zaman = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  var sonuclar = [];

  for (var i = 0; i < sayfalar.length; i++) {
    var sk = sayfalar[i];
    log('');
    log('=== ' + sk.id + ' ===', 'info');

    try {
      if (BASELINE) {
        // Baseline kaydet
        var blYol = path.join(CONFIG.referansKlasor, sk.id + '.png');
        await ekranGoruntusu(browser, sk, blYol);
        log('Baseline kaydedildi: ' + blYol, 'ok');
        sonuclar.push({ sayfaId: sk.id, gecti: true, farkYuzdesi: 0, referansYol: blYol, canliYol: '', farkYol: '' });
      } else {
        // Karsilastirma
        var refYol = path.join(CONFIG.referansKlasor, sk.id + '.png');
        if (!fs.existsSync(refYol)) {
          log('Referans yok, once --baseline calistirin: ' + refYol, 'warn');
          sonuclar.push({ sayfaId: sk.id, gecti: false, farkYuzdesi: 100, referansYol: '', canliYol: '', farkYol: '' });
          continue;
        }

        var canYol = path.join(CONFIG.ekrangoruntusKlasor, sk.id + '_canli_' + zaman + '.png');
        var frkYol = path.join(CONFIG.ekrangoruntusKlasor, sk.id + '_fark_' + zaman + '.png');

        await ekranGoruntusu(browser, sk, canYol);
        var piksel = pixelKarsilastir(refYol, canYol, frkYol);

        var gecti = piksel.farkYuzdesi <= CONFIG.esikYuzdesi;
        log((gecti ? '✓ ' : '✗ ') + sk.id + ': %' + piksel.farkYuzdesi + ' fark', gecti ? 'ok' : 'err');

        sonuclar.push({
          sayfaId: sk.id,
          gecti: gecti,
          farkYuzdesi: piksel.farkYuzdesi,
          referansYol: refYol,
          canliYol: canYol,
          farkYol: frkYol
        });
      }
    } catch(e) {
      log(sk.id + ' hata: ' + e.message, 'err');
      sonuclar.push({ sayfaId: sk.id, gecti: false, farkYuzdesi: 100, referansYol: '', canliYol: '', farkYol: '', hata: e.message });
    }
  }

  await browser.close();

  // Rapor
  if (!BASELINE) {
    var raporYolu = htmlRaporOlustur(sonuclar, zaman);
    log('');
    log('Rapor: ' + raporYolu, 'ok');
  }

  // Ozet
  var gecenSay = 0;
  for (var s = 0; s < sonuclar.length; s++) { if (sonuclar[s].gecti) gecenSay++; }
  log('');
  log('════════════════════════════════════════', 'info');
  log('SONUC: ' + gecenSay + '/' + sonuclar.length + (BASELINE ? ' baseline kaydedildi' : ' gecti'), gecenSay === sonuclar.length ? 'ok' : 'err');
  for (var s = 0; s < sonuclar.length; s++) {
    log('  ' + (sonuclar[s].gecti ? '✓' : '✗') + ' ' + sonuclar[s].sayfaId + ': %' + sonuclar[s].farkYuzdesi, sonuclar[s].gecti ? 'ok' : 'err');
  }
  log('════════════════════════════════════════', 'info');

  if (!BASELINE) {
    process.exit(gecenSay === sonuclar.length ? 0 : 1);
  }
}

main().catch(function(e) {
  log('Kritik hata: ' + e.message, 'err');
  process.exit(1);
});
