// Ersan MES — Merkezi Log Sistemi
// Tüm HTML sayfalarına <script src="ersan_log.js"></script> ile eklenir
// Kullanım: await logIslem('Oluşturuldu', 'Sipariş', recId, 'SP-2026-001', null, fields);

window._aktifKullanici = window._aktifKullanici || 'Erdem Küçükateş';

async function logIslem(islemTipi, modul, kayitId, kayitOzeti, eskiDeger, yeniDeger, notlar) {
  try {
    await fetch('/.netlify/functions/log', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        kullanici: window._aktifKullanici,
        islemTipi: islemTipi || '',
        modul: modul || '',
        kayitId: kayitId || '',
        kayitOzeti: kayitOzeti || '',
        eskiDeger: eskiDeger ? JSON.stringify(eskiDeger) : '',
        yeniDeger: yeniDeger ? JSON.stringify(yeniDeger) : '',
        cihaz: navigator.userAgent.substring(0, 50),
        notlar: notlar || ''
      })
    });
  } catch(e) {
    console.warn('[LOG] Hata:', e.message);
  }
}
