const NAV_GRUPLARI = [
  {
    baslik: 'CRM',
    sayfalar: [
      { id: 'crm',          etiket: 'Pipeline',        url: 'ersan_crm.html' },
      { id: 'crm_takip',    etiket: 'Takip Listesi',   url: 'ersan_crm_takip.html' },
      { id: 'satis_tahmini',etiket: 'Satis Tahmini',   url: 'ersan_satis_tahmini.html' },
    ]
  },
  {
    baslik: 'Satis',
    sayfalar: [
      { id: 'teklif',     etiket: 'Teklifler',      url: 'ersan_teklif.html' },
      { id: 'siparisler', etiket: 'Siparisler',      url: 'ersan_siparisler.html' },
      { id: 'musteri',    etiket: 'Musteriler',      url: 'ersan_musteri.html' },
    ]
  },
  {
    baslik: 'Finans',
    sayfalar: [
      { id: 'finans',         etiket: 'Genel Bakis',      url: 'ersan_finans.html' },
      { id: 'siparis_maliyet',etiket: 'Siparis Maliyeti',  url: 'ersan_siparis_maliyet.html' },
      { id: 'alacaklar',      etiket: 'Alacaklar',         url: 'ersan_alacaklar.html' },
      { id: 'borclar',        etiket: 'Borclar',           url: 'ersan_borclar.html' },
      { id: 'kar_analizi',    etiket: 'Kar Analizi',       url: 'ersan_kar_analizi.html' },
      { id: 'nakit_akisi',    etiket: 'Nakit Akisi',       url: 'ersan_nakit_akisi.html' },
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
      { id: 'kalite',     etiket: 'Kalite Hub',      url: 'ersan_kalite.html' },
      { id: 'fai',        etiket: 'FAI',             url: 'ersan_fai.html' },
      { id: 'fod',        etiket: 'FOD Kontrol',     url: 'ersan_fod.html' },
      { id: 'ncr',        etiket: 'NCR',             url: 'ersan_ncr.html' },
      { id: 'kontrol_p',  etiket: 'Kontrol Plani',   url: 'ersan_kontrol_plani.html' },
      { id: 'sapma',      etiket: 'Sapma/Feragat',   url: 'ersan_sapma.html' },
      { id: 'sahte',      etiket: 'Sahte Parca',     url: 'ersan_sahte_parca.html' },
      { id: 'eco',        etiket: 'ECO',             url: 'ersan_eco.html' },
      { id: 'asl',        etiket: 'ASL',             url: 'ersan_asl.html' },
      { id: 'sevkiyat',   etiket: 'Sevkiyat',        url: 'ersan_sevkiyat.html' },
      { id: 'capa',       etiket: 'CAPA',            url: 'ersan_duzeltici.html' },
    ]
  },
  {
    baslik: 'Sistem',
    sayfalar: [
      { id: 'bakim',      etiket: 'Ekipman & Bakim', url: 'ersan_bakim.html' },
      { id: 'personel',   etiket: 'Personel 360',    url: 'ersan_personel.html' },
      { id: 'dept_kpi',   etiket: 'Departman KPI',   url: 'ersan_departman_kpi.html' },
      { id: 'dokuz_kutu', etiket: 'Yetenek Matrisi', url: 'ersan_dokuz_kutu.html' },
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
