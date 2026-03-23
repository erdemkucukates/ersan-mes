// netlify/functions/gunluk-ozet.js
// Scheduled: Her gün 08:00 UTC (11:00 Türkiye)
// Teams Genel kanalına + yöneticilere e-posta

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

async function atList(table, filter) {
  var token  = process.env.AIRTABLE_TOKEN;
  var baseId = process.env.AIRTABLE_BASE_ID || 'app5LDgJMgocw79Ix';
  var url    = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(table) + '?filterByFormula=' + encodeURIComponent(filter) + '&maxRecords=50';
  var r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  var d = await r.json();
  return d.records || [];
}

exports.handler = async (event) => {
  try {
    var sonuclar = await Promise.all([
      atList('NCR Kayitlari',       "{Durum}='Acik'"),
      atList('Satinalma Talepleri', "{Durum}='Bekleyen'"),
    ]);

    var ncrSayi = sonuclar[0].length;
    var prSayi  = sonuclar[1].length;
    var bugun   = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Teams — Genel kanala
    var teamsUrl = process.env.TEAMS_GENEL_URL;
    if (teamsUrl) {
      await fetch(teamsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          attachments: [{
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              type: 'AdaptiveCard', version: '1.4',
              body: [
                { type: 'TextBlock', text: '\uD83D\uDCCA Ersan MES \u2014 G\u00FCnl\u00FCk \u00D6zet', weight: 'Bolder', size: 'Medium' },
                { type: 'TextBlock', text: bugun, color: 'Accent', size: 'Small' },
                { type: 'FactSet', facts: [
                  { title: '\u26D4 A\u00E7\u0131k NCR',     value: String(ncrSayi) },
                  { title: '\uD83D\uDCDD Bekleyen PR',      value: String(prSayi) },
                ]},
              ],
              actions: [{ type: 'Action.OpenUrl', title: 'Dashboard \u2192', url: 'https://ersan-mes.netlify.app/ersan_anasayfa.html' }]
            }
          }]
        })
      });
    }

    // E-posta — Yöneticilere
    var sgKey = process.env.SENDGRID_API_KEY;
    if (sgKey) {
      var ozet = '<h3>G\u00FCnl\u00FCk \u00D6zet \u2014 ' + bugun + '</h3>'
        + '<table style="border-collapse:collapse;width:100%;font-size:13px">'
        + '<tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e5e7eb">\u26D4 A\u00E7\u0131k NCR</td><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;color:#dc2626">' + ncrSayi + '</td></tr>'
        + '<tr><td style="padding:8px 12px;border:1px solid #e5e7eb">\uD83D\uDCDD Bekleyen PR</td><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;color:#2563eb">' + prSayi + '</td></tr>'
        + '</table>'
        + '<p style="margin-top:14px"><a href="https://ersan-mes.netlify.app/ersan_anasayfa.html" style="color:#1a2b47;font-weight:600">Dashboard\'a git \u2192</a></p>';

      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + sgKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'erdem@ersanmakine.com.tr' }] }],
          from: { email: process.env.SENDGRID_FROM || 'noreply@ersanmes.com', name: 'Ersan MES' },
          subject: '\uD83D\uDCCA G\u00FCnl\u00FCk \u00D6zet \u2014 ' + new Date().toLocaleDateString('tr-TR'),
          content: [{ type: 'text/html', value: ozet }],
        })
      });
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, ncr: ncrSayi, pr: prSayi }) };
  } catch (err) {
    console.error('Gunluk ozet hatasi:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
