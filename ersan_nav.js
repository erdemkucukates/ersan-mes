// Ersan MES — Ortak Navigasyon
// Tüm sayfalara <script src="ersan_nav.js"></script> ile dahil edilir

const ERSAN_MODULES = [
  { id: 'teklif',    label: 'Teklif Yönetimi',         icon: '📋', url: 'ersan_teklif.html',      status: 'active' },
  { id: 'siparis',   label: 'Sipariş Yönetimi',         icon: '📦', url: 'ersan_siparisler.html', status: 'active' },
  { id: 'satinalma', label: 'Satınalma',                icon: '🛒', url: 'ersan_satinalma.html',   status: 'active' },
  { id: 'isemri',    label: 'İş Emirleri',              icon: '⚙️', url: 'ersan_isemirleri.html',  status: 'active' },
  { id: 'uretim',    label: 'Üretim / Atölye',          icon: '🏭', url: 'ersan_uretim.html',      status: 'soon' },
  { id: 'kalite',    label: 'Kalite Kontrol',           icon: '✅', url: 'ersan_kalite.html',      status: 'soon' },
  { id: 'sevkiyat',  label: 'Sevkiyat',                 icon: '🚚', url: 'ersan_sevkiyat.html',    status: 'soon' },
  { id: 'musteri',   label: 'Müşteri Geri Bildirimi',   icon: '💬', url: 'ersan_musteri.html',     status: 'soon' },
  { id: 'dokuman',   label: 'Doküman Yönetimi',         icon: '📁', url: 'ersan_dokuman.html',     status: 'soon' },
  { id: 'denetim',   label: 'İç Denetim',               icon: '🔍', url: 'ersan_denetim.html',     status: 'soon' },
  { id: 'duzeltici', label: 'Düzeltici Faaliyet',       icon: '🔧', url: 'ersan_duzeltici.html',   status: 'soon' },
  { id: 'bakim',     label: 'Ekipman & Bakım',          icon: '🔩', url: 'ersan_bakim.html',       status: 'soon' },
  { id: 'personel',  label: 'Personel Yönetimi',        icon: '👥', url: 'ersan_personel.html',    status: 'soon' },
  { id: 'egitim',    label: 'Eğitim',                   icon: '🎓', url: 'ersan_egitim.html',      status: 'soon' },
  { id: 'risk',      label: 'Risk Yönetimi',            icon: '⚠️', url: 'ersan_risk.html',        status: 'soon' },
  { id: 'isg',       label: 'İSG / Güvenlik',           icon: '🦺', url: 'ersan_isg.html',         status: 'soon' },
  { id: 'ygg',       label: 'Yönetim Gözden Geçirme',  icon: '📊', url: 'ersan_ygg.html',         status: 'soon' },
];

function injectNav(activeId) {
  const currentFile = window.location.pathname.split('/').pop();
  
  const navHTML = `
  <style>
    #ersan-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: #0f172a; height: 48px;
      display: flex; align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-family: -apple-system, sans-serif;
    }
    #ersan-nav .nav-logo {
      padding: 0 16px; font-size: 13px; font-weight: 600;
      color: #fff; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.1);
      height: 100%; display: flex; align-items: center; gap: 8px; min-width: 140px;
    }
    #ersan-nav .nav-logo span { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 400; }
    #ersan-nav .nav-scroll {
      display: flex; align-items: center; overflow-x: auto; height: 100%;
      scrollbar-width: none; flex: 1;
    }
    #ersan-nav .nav-scroll::-webkit-scrollbar { display: none; }
    #ersan-nav .nav-item {
      padding: 0 14px; height: 100%; display: flex; align-items: center;
      gap: 6px; font-size: 12px; color: rgba(255,255,255,0.55);
      text-decoration: none; white-space: nowrap; transition: color .15s;
      border-bottom: 2px solid transparent; cursor: pointer;
    }
    #ersan-nav .nav-item:hover { color: rgba(255,255,255,0.85); }
    #ersan-nav .nav-item.active { color: #fff; border-bottom-color: #3b82f6; }
    #ersan-nav .nav-item.soon { opacity: 0.4; pointer-events: none; }
    #ersan-nav .nav-item .nav-icon { font-size: 13px; }
    #ersan-nav .nav-home {
      padding: 0 12px; height: 100%; display: flex; align-items: center;
      color: rgba(255,255,255,0.5); font-size: 18px; text-decoration: none;
      border-right: 1px solid rgba(255,255,255,0.1);
    }
    #ersan-nav .nav-home:hover { color: #fff; }
    body { padding-top: 48px !important; }
  </style>
  <nav id="ersan-nav">
    <div class="nav-logo">
      ⚙ Ersan MES <span>AS9100</span>
    </div>
    <a href="index.html" class="nav-home" title="Ana Sayfa">⌂</a>
    <div class="nav-scroll">
      ${ERSAN_MODULES.map(m => {
        const isActive = activeId ? m.id === activeId : currentFile === m.url.split('#')[0];
        return `<a href="${m.url}" class="nav-item${isActive ? ' active' : ''}${m.status === 'soon' ? ' soon' : ''}" title="${m.label}">
          <span class="nav-icon">${m.icon}</span>${m.label}
        </a>`;
      }).join('')}
    </div>
  </nav>`;

  const container = document.createElement('div');
  container.innerHTML = navHTML;
  document.body.insertBefore(container, document.body.firstChild);
}

// Otomatik inject
document.addEventListener('DOMContentLoaded', () => injectNav());

// Eski sayfalardaki nav'ı gizle ve yenisini ekle
function replaceOldNav() {
  // Eski koyu header varsa gizle (ilk div/header içinde nav-like elementler)
  const oldNavs = document.querySelectorAll('header, .top-bar, nav:not(#ersan-nav)');
  oldNavs.forEach(el => {
    if (el.id !== 'ersan-nav' && !el.closest('#ersan-nav')) {
      // Sadece tam üstteki nav'ları hedef al
      if (el.getBoundingClientRect().top < 100) {
        el.style.display = 'none';
      }
    }
  });
}

// DOMContentLoaded'da hem inject hem replace
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  setTimeout(replaceOldNav, 50);
});
