var ERSAN_MODULES = [
  { id: 'teklif',       label: 'Teklif Yönetimi',        icon: '📋', url: 'ersan_teklif.html',       status: 'active' },
  { id: 'siparis',      label: 'Sipariş Yönetimi',        icon: '📦', url: 'ersan_siparisler.html',    status: 'active' },
  { id: 'satinalma',    label: 'Satınalma',               icon: '🛒', url: 'ersan_satinalma.html',     status: 'active' },
  { id: 'isemri',       label: 'İş Emirleri',             icon: '⚙️', url: 'ersan_isemirleri.html',   status: 'active' },
  { id: 'planlama',     label: 'Planlama',                icon: '📅', url: 'ersan_planlama.html',      status: 'active' },
  { id: 'hesaplama',    label: 'Maliyet Hesaplama',       icon: '🧮', url: 'ersan_hesaplama.html',     status: 'active' },
  { id: 'tedarikciler', label: 'Tedarikçiler',            icon: '🏢', url: 'ersan_tedarikciler.html',  status: 'active' },
  { id: 'uretim',       label: 'Üretim / Atölye',         icon: '🏭', url: 'ersan_uretim.html',        status: 'soon' },
  { id: 'kalite',       label: 'Kalite Kontrol',          icon: '✅', url: 'ersan_kalite.html',        status: 'soon' },
  { id: 'sevkiyat',     label: 'Sevkiyat',                icon: '🚚', url: 'ersan_sevkiyat.html',      status: 'soon' },
  { id: 'musteri',      label: 'Müşteri Geri Bildirimi',  icon: '💬', url: 'ersan_musteri.html',       status: 'soon' },
  { id: 'dokuman',      label: 'Doküman Yönetimi',        icon: '📁', url: 'ersan_dokuman.html',       status: 'soon' },
  { id: 'denetim',      label: 'İç Denetim',              icon: '🔍', url: 'ersan_denetim.html',       status: 'soon' },
  { id: 'duzeltici',    label: 'Düzeltici Faaliyet',      icon: '🔧', url: 'ersan_duzeltici.html',     status: 'soon' },
  { id: 'bakim',        label: 'Ekipman & Bakım',         icon: '🔩', url: 'ersan_bakim.html',         status: 'soon' },
  { id: 'personel',     label: 'Personel Yönetimi',       icon: '👥', url: 'ersan_personel.html',      status: 'soon' },
  { id: 'egitim',       label: 'Eğitim',                  icon: '🎓', url: 'ersan_egitim.html',        status: 'soon' },
  { id: 'risk',         label: 'Risk Yönetimi',           icon: '⚠️', url: 'ersan_risk.html',          status: 'soon' },
  { id: 'isg',          label: 'İSG / Güvenlik',          icon: '🦺', url: 'ersan_isg.html',           status: 'soon' },
  { id: 'ygg',          label: 'Yönetim Gözden Geçirme', icon: '📊', url: 'ersan_ygg.html',           status: 'soon' },
];

function injectNav() {
  if (document.getElementById('ersan-nav')) return;
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  var style = document.createElement('style');
  style.textContent = '#ersan-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:#0f172a;height:48px;display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);font-family:-apple-system,sans-serif}'
    + '#ersan-nav .en-logo{padding:0 14px;font-size:13px;font-weight:600;color:#fff;white-space:nowrap;border-right:1px solid rgba(255,255,255,0.1);height:100%;display:flex;align-items:center;gap:6px;min-width:130px;text-decoration:none}'
    + '#ersan-nav .en-logo small{font-size:9px;color:rgba(255,255,255,0.35);font-weight:400;margin-left:4px}'
    + '#ersan-nav .en-scroll{display:flex;align-items:center;overflow-x:auto;height:100%;scrollbar-width:none;flex:1}'
    + '#ersan-nav .en-scroll::-webkit-scrollbar{display:none}'
    + '#ersan-nav .en-item{padding:0 13px;height:100%;display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent;flex-shrink:0}'
    + '#ersan-nav .en-item:hover{color:rgba(255,255,255,0.85)}'
    + '#ersan-nav .en-active{color:#fff!important;border-bottom-color:#3b82f6!important}'
    + '#ersan-nav .en-soon{opacity:0.35;pointer-events:none}'
    + 'body{padding-top:48px!important}';
  document.head.appendChild(style);
  var nav = document.createElement('nav');
  nav.id = 'ersan-nav';
  var logo = document.createElement('a');
  logo.href = 'index.html';
  logo.className = 'en-logo';
  logo.innerHTML = '&#9881; Ersan MES<small>AS9100</small>';
  nav.appendChild(logo);
  var scroll = document.createElement('div');
  scroll.className = 'en-scroll';
  ERSAN_MODULES.forEach(function(m) {
    var isActive = currentFile === m.url.split('#')[0];
    var a = document.createElement('a');
    a.href = m.status === 'active' ? m.url : '#';
    a.className = 'en-item' + (isActive ? ' en-active' : '') + (m.status === 'soon' ? ' en-soon' : '');
    a.title = m.status === 'soon' ? m.label + ' (yakında)' : '';
    a.innerHTML = '<span style="font-size:12px">' + m.icon + '</span>' + m.label;
    scroll.appendChild(a);
  });
  nav.appendChild(scroll);
  document.body.insertBefore(nav, document.body.firstChild);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNav);
} else {
  injectNav();
}
