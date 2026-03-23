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
      var res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          path: '/v0/' + BASE_ID + '/' + encodeURIComponent(table) + '?' + query
        })
      });
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

    throw new Error('Bilinmeyen action: ' + action);
  };
})();
