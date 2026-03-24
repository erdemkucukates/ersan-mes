/* ERSAN MES — airtable.js v1.0
   Lightweight Airtable helper for login/auth pages.
   Usage:
     airtable('list', 'Kullanicilar', { filterByFormula: "..." })
     airtable('update', 'Kullanicilar', { id: 'recXXX', fields: {...} })
*/
(function () {
  var BASE_ID = 'app5LDgJMgocw79Ix';
  var PROXY   = '/.netlify/functions/airtable';

  window.airtable = async function (action, table, opts) {
    opts = opts || {};

    if (action === 'list') {
      var query = 'pageSize=' + (opts.pageSize || 100);
      if (opts.filterByFormula) query += '&filterByFormula=' + encodeURIComponent(opts.filterByFormula);
      if (opts.sort) {
        for (var si = 0; si < opts.sort.length; si++) {
          query += '&sort[' + si + '][field]=' + encodeURIComponent(opts.sort[si].field);
          if (opts.sort[si].direction) query += '&sort[' + si + '][direction]=' + opts.sort[si].direction;
        }
      }
      var listUrl = PROXY + '?table=' + encodeURIComponent(table) + '&' + query;
      var res = await fetch(listUrl);
      if (!res.ok && res.status === 422) {
        console.warn('Airtable 422 list hatasi:', table, '- GET ile tekrar deneniyor');
        res = await fetch(listUrl);
      }
      return res.json();
    }

    if (action === 'update') {
      var res2 = await fetch(PROXY, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: table,
          id: opts.id,
          fields: opts.fields
        })
      });
      return res2.json();
    }

    if (action === 'create') {
      var res3 = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: table,
          fields: opts.fields
        })
      });
      return res3.json();
    }

    throw new Error('Bilinmeyen action: ' + action);
  };

  // Global log helper
  window.logIslem = async function (islem, detay, modul) {
    try {
      await window.airtable('create', 'Sistem_Logu', {
        fields: {
          Tarih:     new Date().toISOString().split('T')[0],
          Kullanici: sessionStorage.getItem('kullanici') || 'Sistem',
          Islem:     islem,
          Detay:     detay || '',
          Durum:     'Bilgi',
          Modul:     modul || ''
        }
      });
    } catch(e) {
      console.warn('Log yazılamadı:', e);
    }
  };
})();
