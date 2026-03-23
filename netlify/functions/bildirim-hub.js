// netlify/functions/bildirim-hub.js
// Airtable Webhook → Teams + E-posta + MES Bildirimi

const TEAMS = {
  kalite:    process.env.TEAMS_KALITE_URL,
  satinalma: process.env.TEAMS_SATINALMA_URL,
  uretim:    process.env.TEAMS_URETIM_URL,
  genel:     process.env.TEAMS_GENEL_URL,
};

const SENDGRID_KEY  = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@ersanmes.com';
const BASE_URL      = 'https://ersan-mes.netlify.app';

// ── Airtable yardımcı ──
async function at(method, table, data) {
  var token  = process.env.AIRTABLE_TOKEN;
  var baseId = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
  var url    = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(table);
  var opts   = {
    method: method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
  };
  if (data && (method === 'POST' || method === 'PATCH')) opts.body = JSON.stringify(data);
  var res = await fetch(url, opts);
  return res.json();
}

// ── Teams Adaptive Card gönder ──
async function teamsGonder(webhookUrl, kart) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kart),
    });
  } catch (e) { console.warn('Teams gonderim hatasi:', e.message); }
}

// ── E-posta gönder (SendGrid) ──
async function epostaGonder(opts) {
  if (!SENDGRID_KEY || !opts.kime) return;
  var toList = Array.isArray(opts.kime) ? opts.kime.map(function(e) { return { email: e }; }) : [{ email: opts.kime }];
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + SENDGRID_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: toList }],
        from: { email: SENDGRID_FROM, name: 'Ersan MES' },
        subject: opts.konu,
        content: [{ type: 'text/html', value: opts.html }],
      }),
    });
  } catch (e) { console.warn('E-posta gonderim hatasi:', e.message); }
}

// ── MES içi bildirim ──
async function mesIciBildirim(opts) {
  try {
    await at('POST', 'Bildirimler', {
      fields: {
        Baslik:           opts.baslik,
        Mesaj:            opts.mesaj || '',
        Tip:              opts.tip || 'sistem',
        Okundu:           false,
        Hedef_Kullanici:  opts.hedef || '',
        Kaynak_Sayfa:     opts.kaynakSayfa || '',
        Kaynak_No:        opts.kaynakNo || '',
        Olusturma_Tarihi: new Date().toISOString().split('T')[0],
      }
    });
  } catch (e) { console.warn('MES bildirim hatasi:', e.message); }
}

// ── E-posta HTML şablonu ──
function emailSablon(opts) {
  var renkMap = { ncr:'#dc2626', capa:'#7c3aed', kalibrasyon:'#d97706', bakim:'#f97316', pr:'#2563eb', sistem:'#1a2b47' };
  var renk = renkMap[opts.tip] || '#1a2b47';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f2f5;font-family:\'Segoe UI\',sans-serif">'
    + '<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">'
    + '<div style="background:' + renk + ';padding:18px 24px;display:flex;align-items:center;gap:12px">'
    + '<div style="font-size:20px;font-weight:800;color:#fff">ERSAN MES</div>'
    + '<div style="font-size:10px;color:rgba(255,255,255,.6);border-left:1px solid rgba(255,255,255,.3);padding-left:12px">AS9100 Rev.D</div></div>'
    + '<div style="padding:24px">'
    + '<h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 12px">' + opts.baslik + '</h2>'
    + '<div style="font-size:13px;color:#374151;line-height:1.7">' + opts.icerik + '</div>'
    + (opts.linkUrl ? '<div style="margin-top:20px"><a href="' + opts.linkUrl + '" style="display:inline-block;padding:10px 20px;background:' + renk + ';color:#fff;text-decoration:none;border-radius:7px;font-size:13px;font-weight:600">' + (opts.linkMetin || 'Git \u2192') + '</a></div>' : '')
    + '</div>'
    + '<div style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af">'
    + 'Ersan MES v7.0 \u00B7 Bu otomatik bir bildirimdir</div></div></body></html>';
}

// ══════════════════════════════════════════════
// OLAY İŞLEYİCİLER
// ══════════════════════════════════════════════

async function ncrOlusturuldu(fields, recordId) {
  var no    = fields.NCR_No   || fields['NCR No'] || recordId.slice(0, 8);
  var parca = fields.Parca    || fields['Parca Adi'] || '\u2014';
  var kat   = fields.Kategori || '\u2014';
  var url   = BASE_URL + '/ersan_kalite_ncr.html?id=' + recordId;

  await teamsGonder(TEAMS.kalite, {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard', version: '1.4',
        body: [
          { type: 'TextBlock', text: '\u26D4 Yeni NCR A\u00E7\u0131ld\u0131', weight: 'Bolder', color: 'Attention', size: 'Medium' },
          { type: 'FactSet', facts: [
            { title: 'NCR No',   value: no },
            { title: 'Par\u00E7a',    value: parca },
            { title: 'Kategori', value: kat },
            { title: 'A\u00E7an',     value: fields.Acan || '\u2014' },
          ]},
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'NCR\'a Git \u2192', url: url }]
      }
    }]
  });

  await epostaGonder({
    kime: ['kalite@ersanmakine.com.tr', 'erdem@ersanmakine.com.tr'],
    konu: '\u26D4 Yeni NCR: ' + no + ' \u2014 ' + parca,
    html: emailSablon({ baslik: 'Yeni NCR A\u00E7\u0131ld\u0131: ' + no, icerik: '<b>Par\u00E7a:</b> ' + parca + '<br><b>Kategori:</b> ' + kat, linkUrl: url, tip: 'ncr' }),
  });

  await mesIciBildirim({ baslik: 'Yeni NCR: ' + no, mesaj: parca + ' \u2014 ' + kat, tip: 'ncr', kaynakSayfa: 'ersan_kalite_ncr.html', kaynakNo: no });
}

async function capaTermin(fields, recordId) {
  var no   = fields.CAPA_No || fields['CAPA No'] || recordId.slice(0, 8);
  var konu = fields.Konu    || '\u2014';
  var url  = BASE_URL + '/ersan_kalite_capa.html?id=' + recordId;

  await teamsGonder(TEAMS.kalite, {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard', version: '1.4',
        body: [
          { type: 'TextBlock', text: '\uD83D\uDD27 CAPA Termin Yakla\u015F\u0131yor', weight: 'Bolder', color: 'Warning', size: 'Medium' },
          { type: 'FactSet', facts: [
            { title: 'CAPA No',  value: no },
            { title: 'Konu',     value: konu },
            { title: 'Sorumlu',  value: fields.Sorumlu || '\u2014' },
            { title: 'Termin',   value: fields.Hedef_Tarih || '\u2014' },
          ]},
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'CAPA\'ya Git \u2192', url: url }]
      }
    }]
  });

  await epostaGonder({
    kime: [fields.Sorumlu_Mail || 'kalite@ersanmakine.com.tr'],
    konu: '\uD83D\uDD27 CAPA Termin: ' + no,
    html: emailSablon({ baslik: 'CAPA Termini Yakla\u015F\u0131yor: ' + no, icerik: '<b>Konu:</b> ' + konu + '<br><b>Termin:</b> ' + (fields.Hedef_Tarih || '\u2014'), linkUrl: url, tip: 'capa' }),
  });

  await mesIciBildirim({ baslik: 'CAPA termin: ' + no, tip: 'capa', hedef: fields.Sorumlu || '', kaynakSayfa: 'ersan_kalite_capa.html', kaynakNo: no });
}

async function prOnayBekliyor(fields, recordId) {
  var no   = fields['PR No'] || recordId.slice(0, 8);
  var acik = fields.Aciklama || fields['Malzeme'] || '\u2014';
  var url  = BASE_URL + '/ersan_satinalma_pr.html?id=' + recordId;

  await teamsGonder(TEAMS.satinalma, {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard', version: '1.4',
        body: [
          { type: 'TextBlock', text: '\uD83D\uDCDD Sat\u0131nalma Talebi Onay Bekliyor', weight: 'Bolder', color: 'Accent', size: 'Medium' },
          { type: 'FactSet', facts: [
            { title: 'PR No',      value: no },
            { title: 'A\u00E7\u0131klama',  value: acik },
            { title: 'Aciliyet',   value: fields.Aciliyet || 'Normal' },
          ]},
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'PR\'y\u0131 \u0130ncele \u2192', url: url }]
      }
    }]
  });

  await epostaGonder({
    kime: ['erdem@ersanmakine.com.tr'],
    konu: '\uD83D\uDCDD PR Onay Bekliyor: ' + no,
    html: emailSablon({ baslik: 'Sat\u0131nalma Talebi: ' + no, icerik: '<b>A\u00E7\u0131klama:</b> ' + acik + '<br><b>Aciliyet:</b> ' + (fields.Aciliyet || 'Normal'), linkUrl: url, tip: 'pr' }),
  });

  await mesIciBildirim({ baslik: 'PR onay bekliyor: ' + no, tip: 'sistem', kaynakSayfa: 'ersan_satinalma_pr.html', kaynakNo: no });
}

async function kalibrasyonUyari(fields, recordId) {
  var no = fields.EQP_No || fields['EQP No'] || recordId.slice(0, 8);
  var ad = fields.EQP_Ad || fields['Ekipman Adi'] || '\u2014';
  var url = BASE_URL + '/ersan_kalite_kalibrasyon.html?id=' + recordId;

  await teamsGonder(TEAMS.kalite, {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard', version: '1.4',
        body: [
          { type: 'TextBlock', text: '\uD83D\uDCCF Kalibrasyon S\u00FCresi Dolmak \u00DCzere', weight: 'Bolder', color: 'Warning', size: 'Medium' },
          { type: 'FactSet', facts: [
            { title: 'Ekipman',   value: no + ' \u2014 ' + ad },
            { title: 'Son Tarih', value: fields.Kalibrasyon_Tarihi || '\u2014' },
          ]},
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'Kalibrasyon Planla \u2192', url: url }]
      }
    }]
  });

  await mesIciBildirim({ baslik: 'Kalibrasyon yakla\u015F\u0131yor: ' + no, tip: 'kalibrasyon', kaynakSayfa: 'ersan_kalite_kalibrasyon.html', kaynakNo: no });
}

// ══════════════════════════════════════════════
// ANA HANDLER
// ══════════════════════════════════════════════

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  var tablo    = payload.tablo;
  var olay     = payload.olay;
  var fields   = payload.fields || {};
  var recordId = payload.recordId || '';

  try {
    if (tablo === 'NCR_Kayitlari' && olay === 'created') {
      await ncrOlusturuldu(fields, recordId);
    }
    else if (tablo === 'CAPA_Kayitlari' && olay === 'termin_yaklasti') {
      await capaTermin(fields, recordId);
    }
    else if (tablo === 'Satinalma_Talepleri' && olay === 'onay_bekleniyor') {
      await prOnayBekliyor(fields, recordId);
    }
    else if (tablo === 'EQP_Kalibrasyonlar' && olay === 'suresi_dolmak_uzere') {
      await kalibrasyonUyari(fields, recordId);
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Bildirim hatasi:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
