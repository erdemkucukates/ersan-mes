var ERSAN_NAV = [
  {
    group: 'CRM', collapsed: false,
    items: [
      { label: 'Pipeline', href: 'ersan_crm.html' },
      { label: 'Takip Listesi', href: 'ersan_crm_takip.html' },
      { label: 'Satis Tahmini', href: 'ersan_satis_tahmini.html' },
    ]
  },
  {
    group: 'Satis', collapsed: false,
    items: [
      { label: 'Teklifler', href: 'ersan_teklif.html' },
      { label: 'Siparisler', href: 'ersan_siparisler.html' },
      { label: 'Musteriler', href: 'ersan_musteri.html' },
    ]
  },
  {
    group: 'Finans', collapsed: true,
    items: [
      { label: 'Genel Bakis', href: 'ersan_finans.html' },
      { label: 'Alacaklar', href: 'ersan_alacaklar.html' },
      { label: 'Borclar', href: 'ersan_borclar.html' },
      { label: 'Siparis Maliyeti', href: 'ersan_siparis_maliyet.html' },
      { label: 'Kar Analizi', href: 'ersan_kar_analizi.html' },
      { label: 'Nakit Akisi', href: 'ersan_nakit_akisi.html' },
    ]
  },
  {
    group: 'Satinalma', collapsed: false,
    items: [
      { label: 'Satinalma', href: 'ersan_satinalma.html' },
      { label: 'On Kabul', href: 'ersan_on_kabul.html' },
      { label: 'Girdi Kalite', href: 'ersan_girdi_kalite.html' },
      { label: 'Tedarikciler', href: 'ersan_tedarikciler.html' },
    ]
  },
  {
    group: 'Stok & Depo', collapsed: false,
    items: [
      { label: 'Stok Durumu', href: 'ersan_stok.html' },
      { label: 'Malzeme Girisi', href: 'ersan_malzeme.html' },
    ]
  },
  {
    group: 'Uretim', collapsed: false,
    items: [
      { label: 'Is Emirleri', href: 'ersan_isemirleri.html' },
      { label: 'Planlama', href: 'ersan_planlama.html' },
      { label: 'Atolye', href: 'ersan_uretim.html' },
    ]
  },
  {
    group: 'Kalite', collapsed: false,
    subgroups: [
      {
        label: 'Rutin', collapsed: false,
        items: [
          { label: 'Kalite Hub', href: 'ersan_kalite.html' },
          { label: 'Kontrol Plani', href: 'ersan_kontrol_plani.html' },
          { label: 'FAI', href: 'ersan_fai.html' },
          { label: 'FOD Kontrol', href: 'ersan_fod.html' },
          { label: 'Sevkiyat', href: 'ersan_sevkiyat.html' },
        ]
      },
      {
        label: 'Uygunsuzluk', collapsed: true,
        items: [
          { label: 'NCR', href: 'ersan_ncr.html' },
          { label: 'Sapma / Feragat', href: 'ersan_sapma.html' },
          { label: 'CAPA', href: 'ersan_duzeltici.html' },
          { label: 'Sahte Parca', href: 'ersan_sahte_parca.html' },
        ]
      },
      {
        label: 'Sistem', collapsed: true,
        items: [
          { label: 'Ic Denetim', href: 'ersan_denetim.html' },
          { label: 'ECO', href: 'ersan_eco.html' },
          { label: 'ASL', href: 'ersan_asl.html' },
        ]
      }
    ]
  },
  {
    group: 'Ekipman & Bakim', collapsed: false,
    items: [
      { label: 'Ekipmanlar', href: 'ersan_bakim.html' },
    ]
  },
  {
    group: 'Destek', collapsed: true,
    items: [
      { label: 'Personel 360', href: 'ersan_personel.html' },
      { label: 'Departman KPI', href: 'ersan_departman_kpi.html' },
      { label: 'Yetenek Matrisi', href: 'ersan_dokuz_kutu.html' },
      { label: 'Dokuman', href: 'ersan_dokuman.html' },
      { label: 'Risk', href: 'ersan_risk.html' },
      { label: 'ISG', href: 'ersan_isg.html' },
    ]
  },
  {
    group: 'Yonetim', collapsed: true,
    items: [
      { label: 'YGG Dashboard', href: 'ersan_ygg.html' },
      { label: 'Sistem Logu', href: 'ersan_sistem_logu.html' },
      { label: 'Mikro Entegrasyon', href: 'ersan_mikro.html' },
      { label: 'Test Simulatoru', href: 'ersan_test_simulasyon.html' },
    ]
  }
];

function navOlustur() {
  var aktifUrl = window.location.pathname.split('/').pop() || 'index.html';
  var sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  // Logo
  var logoLink = document.createElement('a');
  logoLink.href = 'ersan_anasayfa.html';
  logoLink.style.textDecoration = 'none';
  logoLink.innerHTML = '<div class="sidebar-logo"><div class="sidebar-logo-text">Ersan MES</div><div class="sidebar-logo-sub">AS9100 \u00B7 \u00DCretim Y\u00F6netimi</div></div>';
  sidebar.appendChild(logoLink);

  ERSAN_NAV.forEach(function(g) {
    var grupDiv = document.createElement('div');
    grupDiv.className = 'nav-grup';

    var key = 'nav_g_' + g.group;
    var saved = localStorage.getItem(key);
    var isCollapsed = saved !== null ? saved === 'true' : g.collapsed;

    // Grup basligi
    var header = document.createElement('div');
    header.className = 'nav-grup-baslik';
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;';
    header.innerHTML = '<span>' + g.group + '</span><span class="nav-group-toggle" style="font-size:11px;color:rgba(255,255,255,0.3);padding-right:4px;">' + (isCollapsed ? '+' : '\u2212') + '</span>';

    var body = document.createElement('div');
    body.style.display = isCollapsed ? 'none' : 'block';

    header.addEventListener('click', function() {
      var nowCollapsed = body.style.display !== 'none';
      body.style.display = nowCollapsed ? 'none' : 'block';
      header.querySelector('.nav-group-toggle').textContent = nowCollapsed ? '+' : '\u2212';
      localStorage.setItem(key, nowCollapsed);
    });

    // Icerik
    if (g.subgroups) {
      g.subgroups.forEach(function(sg) {
        var sgKey = 'nav_sg_' + g.group + '_' + sg.label;
        var sgSaved = localStorage.getItem(sgKey);
        var sgCollapsed = sgSaved !== null ? sgSaved === 'true' : sg.collapsed;

        var sgHeader = document.createElement('div');
        sgHeader.className = 'nav-subgroup-header';
        sgHeader.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 14px 5px 20px;cursor:pointer;font-size:10px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;';
        sgHeader.innerHTML = '<span style="font-size:9px;width:10px;">' + (sgCollapsed ? '\u25B8' : '\u25BE') + '</span><span style="flex:1;">' + sg.label + '</span><span style="font-size:9px;background:rgba(255,255,255,0.06);border-radius:8px;padding:0 5px;">' + sg.items.length + '</span>';

        var sgBody = document.createElement('div');
        sgBody.style.display = sgCollapsed ? 'none' : 'block';

        sgHeader.addEventListener('click', function() {
          var nowC = sgBody.style.display !== 'none';
          sgBody.style.display = nowC ? 'none' : 'block';
          sgHeader.querySelector('span').textContent = nowC ? '\u25B8' : '\u25BE';
          localStorage.setItem(sgKey, nowC);
        });

        sg.items.forEach(function(item) {
          sgBody.appendChild(navItemOlustur(item, aktifUrl, true));
        });

        body.appendChild(sgHeader);
        body.appendChild(sgBody);
      });
    } else if (g.items) {
      g.items.forEach(function(item) {
        body.appendChild(navItemOlustur(item, aktifUrl, false));
      });
    }

    grupDiv.appendChild(header);
    grupDiv.appendChild(body);
    sidebar.appendChild(grupDiv);
  });

  return sidebar.outerHTML;
}

function navItemOlustur(item, aktifUrl, isSubitem) {
  var a = document.createElement('a');
  a.href = item.href;
  a.className = 'nav-item' + (aktifUrl === item.href ? ' aktif' : '');
  if (isSubitem) a.style.paddingLeft = '28px';
  a.innerHTML = '<div class="nav-nokta"></div>' + item.label;
  if (item.badge) {
    a.innerHTML += ' <span style="font-size:8px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);border-radius:3px;padding:1px 4px;margin-left:4px;">' + item.badge + '</span>';
  }
  return a;
}

// Badge guncelle (NCR, CAPA sayilari)
function navBadgeGuncelle() {
  try {
    fetch('/.netlify/functions/airtable?table=NCR%20Kay%C4%B1tlar%C4%B1&filterByFormula=NOT(%7BStat%C3%BC%7D%3D%22Kapal%C4%B1%22)&pageSize=100')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var sayi = (d.records || []).length;
        if (sayi > 0) navBadgeEkle('ersan_ncr.html', sayi);
      }).catch(function() {});
  } catch(e) {}
}

function navBadgeEkle(href, sayi) {
  if (sayi <= 0) return;
  var link = document.querySelector('.nav-item[href="' + href + '"]');
  if (!link) return;
  var badge = document.createElement('span');
  badge.style.cssText = 'font-size:9px;background:#dc2626;color:#fff;border-radius:8px;padding:0 5px;margin-left:auto;min-width:16px;text-align:center;';
  badge.textContent = sayi > 9 ? '9+' : sayi;
  link.appendChild(badge);
}

// Sayfa yuklenince nav'i yerlestir
document.addEventListener('DOMContentLoaded', function() {
  var navAlan = document.getElementById('nav-alani');
  if (navAlan) {
    navAlan.innerHTML = navOlustur();
    setTimeout(navBadgeGuncelle, 1000);
  }
});
