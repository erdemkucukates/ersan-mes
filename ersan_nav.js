const NAV_GRUPLARI = [
  {
    baslik: 'Satis',
    sayfalar: [
      { id: 'teklif',     etiket: 'Teklifler',      url: 'ersan_teklif.html' },
      { id: 'siparisler', etiket: 'Siparisler',      url: 'ersan_siparisler.html' },
      { id: 'musteri',    etiket: 'Musteriler',      url: 'ersan_musteri.html' },
    ]
  },
  {
    baslik: 'Tedarik',
    sayfalar: [
      { id: 'satinalma',  etiket: 'Satinalma',       url: 'ersan_satinalma.html' },
      { id: 'on_kabul',   etiket: 'On Kabul',        url: 'ersan_on_kabul.html' },
      { id: 'girdi_k',    etiket: 'Girdi Kalite',    url: 'ersan_girdi_kalite.html' },
      { id: 'stok',       etiket: 'Stok',            url: 'ersan_stok.html' },
    ]
  },
  {
    baslik: 'Uretim',
    sayfalar: [
      { id: 'isemirleri', etiket: 'Is Emirleri',     url: 'ersan_isemirleri.html' },
      { id: 'planlama',   etiket: 'Planlama',        url: 'ersan_planlama.html' },
      { id: 'uretim',     etiket: 'Atolye',          url: 'ersan_uretim.html' },
    ]
  },
  {
    baslik: 'Kalite',
    sayfalar: [
      { id: 'kalite',     etiket: 'Kalite',          url: 'ersan_kalite.html' },
      { id: 'ncr',        etiket: 'NCR',             url: 'ersan_ncr.html' },
      { id: 'sevkiyat',   etiket: 'Sevkiyat',        url: 'ersan_sevkiyat.html' },
      { id: 'capa',       etiket: 'CAPA',            url: 'ersan_duzeltici.html' },
    ]
  },
  {
    baslik: 'Sistem',
    sayfalar: [
      { id: 'bakim',      etiket: 'Ekipman & Bakim', url: 'ersan_bakim.html' },
      { id: 'personel',   etiket: 'Personel',        url: 'ersan_personel.html' },
      { id: 'denetim',    etiket: 'Ic Denetim',      url: 'ersan_denetim.html' },
      { id: 'risk',       etiket: 'Risk',            url: 'ersan_risk.html' },
      { id: 'isg',        etiket: 'ISG',             url: 'ersan_isg.html' },
      { id: 'ygg',        etiket: 'YGG Dashboard',   url: 'ersan_ygg.html' },
      { id: 'dokuman',    etiket: 'Dokuman',         url: 'ersan_dokuman.html' },
      { id: 'log',        etiket: 'Sistem Logu',     url: 'ersan_sistem_logu.html' },
      { id: 'mikro',      etiket: 'Mikro Entegrasyon', url: 'ersan_mikro.html' },
      { id: 'test_sim',   etiket: 'Test Simulatoru', url: 'ersan_test_simulasyon.html' },
    ]
  },
];

function navOlustur() {
  var aktifUrl = window.location.pathname.split('/').pop() || 'index.html';
  var html = '<div class="sidebar">'
    + '<a href="ersan_anasayfa.html" style="text-decoration:none">'
    + '<div class="sidebar-logo">'
    + '<div class="sidebar-logo-text">Ersan MES</div>'
    + '<div class="sidebar-logo-sub">AS9100 \u00B7 \u00DCretim Y\u00F6netimi</div>'
    + '</div></a>';

  NAV_GRUPLARI.forEach(function(grup) {
    html += '<div class="nav-grup">'
      + '<div class="nav-grup-baslik">' + grup.baslik + '</div>';
    grup.sayfalar.forEach(function(sayfa) {
      var aktif = aktifUrl === sayfa.url ? ' aktif' : '';
      html += '<a class="nav-item' + aktif + '" href="' + sayfa.url + '">'
        + '<div class="nav-nokta"></div>' + sayfa.etiket + '</a>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// Sayfa yuklenince nav'i yerlestir
document.addEventListener('DOMContentLoaded', function() {
  var navAlan = document.getElementById('nav-alani');
  if (navAlan) {
    navAlan.innerHTML = navOlustur();
  }
});
