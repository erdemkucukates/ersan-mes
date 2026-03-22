/* ERSAN MES — sidebar.js v1.1
   Injects sidebar into <div id="sb-mount"></div>
   Requires: utils/sidebar.css */

(function () {
  var GROUPS = [
    { id: 'satinalma', title: 'Sat\u0131nalma', iso: '\u00A78.4', icon: '\uD83D\uDCE6', dot: '#3b82f6', items: [
      { page: 'satinalma-pr', file: 'ersan_satinalma_pr.html', label: 'Sat\u0131nalma Talepleri (PR)', ic: '\uD83D\uDCCB' },
      { page: 'satinalma-rfq', file: 'ersan_satinalma_rfq.html', label: 'Teklifler (RFQ)', ic: '\uD83D\uDCE8' },
      { page: 'satinalma-po', file: 'ersan_satinalma_po.html', label: 'Sipari\u015Fler (PO)', ic: '\uD83D\uDCC4' },
      { page: 'satinalma-grn', file: 'ersan_satinalma_grn.html', label: '\u00D6n Kabul (GRN)', ic: '\u2705' },
      { page: 'tedarikciler', file: 'ersan_tedarikciler.html', label: 'Tedarik\u00E7iler', ic: '\uD83C\uDFED' },
      { page: 'satinalma-fatura', file: 'ersan_satinalma_fatura.html', label: 'Sat\u0131nalma Faturalar\u0131', ic: '\uD83E\uDDFE' }
    ]},
    { id: 'satis', title: 'Sat\u0131\u015F', iso: '\u00A78.2', icon: '\uD83D\uDCB0', dot: '#10b981', items: [
      { page: 'teklif', file: 'ersan_teklif.html', label: 'Teklifler', ic: '\uD83D\uDCC3' },
      { page: 'siparisler', file: 'ersan_siparisler.html', label: 'Sipari\u015Fler', ic: '\uD83D\uDCE6' },
      { page: 'musteriler', file: 'ersan_musteriler.html', label: 'M\u00FC\u015Fteriler', ic: '\uD83D\uDC64' },
      { page: 'sevkiyat', file: 'ersan_sevkiyat.html', label: 'Sevkiyat', ic: '\uD83D\uDE9A' }
    ]},
    { id: 'crm', title: 'CRM', iso: '', icon: '\uD83D\uDCC8', dot: '#e879f9', items: [
      { page: 'pipeline', file: 'ersan_pipeline.html', label: 'Pipeline', ic: '\uD83D\uDD04' },
      { page: 'takip', file: 'ersan_takip.html', label: 'Takip Listesi', ic: '\uD83D\uDCCC' },
      { page: 'tahmin', file: 'ersan_tahmin.html', label: 'Sat\u0131\u015F Tahmini', ic: '\uD83D\uDCCA' }
    ]},
    { id: 'stok', title: 'Stok & Depo', iso: '\u00A78.5.2', icon: '\uD83D\uDCE6', dot: '#f59e0b', items: [
      { page: 'stok', file: 'ersan_stok.html', label: 'Stok Durumu', ic: '\uD83D\uDCCA' },
      { page: 'stok-hareketleri', file: 'ersan_stok_hareketleri.html', label: 'Stok Hareketleri', ic: '\uD83D\uDD04' },
      { page: 'sayim', file: 'ersan_sayim.html', label: 'Say\u0131m', ic: '\uD83D\uDD22' },
      { page: 'atolye-harita', file: 'ersan_atolye_harita.html', label: 'At\u00F6lye Haritas\u0131', ic: '\uD83D\uDDFA\uFE0F' },
      { page: 'qr', file: 'ersan_qr.html', label: 'QR Etiketler', ic: '\uD83D\uDCF1' },
      { page: 'palet', file: 'ersan_palet.html', label: 'Palet / Traveler', ic: '\uD83D\uDEE4\uFE0F' }
    ]},
    { id: 'uretim', title: '\u00DCretim', iso: '\u00A78.5.1', icon: '\u2699\uFE0F', dot: '#3b82f6', items: [
      { page: 'isemirleri', file: 'ersan_isemirleri.html', label: '\u0130\u015F Emirleri', ic: '\uD83D\uDCC4' },
      { page: 'planlama', file: 'ersan_planlama.html', label: 'Planlama', ic: '\uD83D\uDCC5' },
      { page: 'atolye', file: 'ersan_atolye.html', label: 'At\u00F6lye', ic: '\uD83D\uDD27' }
    ]},
    { id: 'kalite', title: 'Kalite', iso: '\u00A78.4-10.2', icon: '\u2714\uFE0F', dot: '#10b981', items: [
      { page: 'kalite-iqc', file: 'ersan_kalite_iqc.html', label: 'Girdi Kalite (IQC)', ic: '\uD83D\uDD0D' },
      { page: 'kalite-fai', file: 'ersan_kalite_fai.html', label: '\u0130lk Par\u00E7a (FAI)', ic: '\uD83C\uDFC6' },
      { page: 'kalite-ipqc', file: 'ersan_kalite_ipqc.html', label: 'S\u00FCre\u00E7 \u0130\u00E7i (IPQC)', ic: '\uD83D\uDCCF' },
      { page: 'kalite-ncr', file: 'ersan_kalite_ncr.html', label: 'NCR', ic: '\u26A0\uFE0F' },
      { page: 'kalite-capa', file: 'ersan_kalite_capa.html', label: 'CAPA (8D)', ic: '\uD83D\uDD27' },
      { page: 'kalite-kalibrasyon', file: 'ersan_kalite_kalibrasyon.html', label: 'Kalibrasyon', ic: '\uD83D\uDCCF' }
    ]},
    { id: 'risk', title: 'Risk & FMEA', iso: '\u00A76.1', icon: '\u26A0\uFE0F', dot: '#ef4444', items: [
      { page: 'risk-fmea', file: 'ersan_risk_fmea.html', label: 'Risk & FMEA', ic: '\uD83D\uDCCA' }
    ]},
    { id: 'denetim', title: '\u0130\u00E7 Denetim', iso: '\u00A79.2', icon: '\uD83D\uDD0E', dot: '#ef4444', items: [
      { page: 'denetim-panel', file: 'ersan_denetim_panel.html', label: 'Denetim Paneli', ic: '\uD83D\uDCCA' },
      { page: 'denetim-plan', file: 'ersan_denetim_plan.html', label: 'Denetim Plan\u0131', ic: '\uD83D\uDCC5' },
      { page: 'denetim-yurutme', file: 'ersan_denetim_yurutme.html', label: 'Denetim Y\u00FCr\u00FCtme', ic: '\u25B6\uFE0F' },
      { page: 'bulgular', file: 'ersan_bulgular.html', label: 'Bulgular', ic: '\uD83D\uDCCB' },
      { page: 'denetim-capa', file: 'ersan_denetim_capa.html', label: 'CAPA', ic: '\uD83D\uDD27' },
      { page: 'denetim-raporlar', file: 'ersan_denetim_raporlar.html', label: 'Raporlar', ic: '\uD83D\uDCC4' }
    ]},
    { id: 'ygg', title: 'YGG', iso: '\u00A79.3', icon: '\uD83D\uDCCB', dot: '#8b5cf6', items: [
      { page: 'ygg', file: 'ersan_ygg.html', label: 'YGG', ic: '\uD83D\uDCCB' }
    ]},
    { id: 'kpi', title: 'KPI Dashboard', iso: '\u00A79.1', icon: '\uD83D\uDCCA', dot: '#f59e0b', items: [
      { page: 'kpi-dashboard', file: 'ersan_anasayfa.html', label: 'KPI Dashboard', ic: '\uD83D\uDCCA' }
    ]},
    { id: 'ekipman', title: 'Ekipman & Bak\u0131m', iso: '\u00A77.1.3', icon: '\uD83D\uDD29', dot: '#8b5cf6', items: [
      { page: 'ekipman-dashboard', file: 'ersan_ekipman_dashboard.html', label: 'Dashboard', ic: '\uD83D\uDCCA' },
      { page: 'ekipman-defteri', file: 'ersan_ekipman_defteri.html', label: 'Ekipman Defteri', ic: '\uD83D\uDCD6' },
      { page: 'ekipman-bakim', file: 'ersan_ekipman_bakim.html', label: 'Bak\u0131m Plan\u0131', ic: '\uD83D\uDCC5' },
      { page: 'ekipman-ariza', file: 'ersan_ekipman_ariza.html', label: 'Ar\u0131za Kayd\u0131', ic: '\uD83D\uDEA8' },
      { page: 'ekipman-bwo', file: 'ersan_ekipman_bwo.html', label: 'Bak\u0131m \u0130\u015F Emirleri', ic: '\uD83D\uDCCB' }
    ]},
    { id: 'dms', title: 'Dok\u00FCman Y\u00F6netimi', iso: '\u00A77.5', icon: '\uD83D\uDCC1', dot: '#3b82f6', items: [
      { page: 'dms-master', file: 'ersan_dms_master.html', label: 'Master Liste', ic: '\uD83D\uDCC4' },
      { page: 'dms-onay', file: 'ersan_dms_onay.html', label: 'Onay Bekleyenler', ic: '\u23F3' },
      { page: 'dms-revizyon', file: 'ersan_dms_revizyon.html', label: 'Revizyon Takibi', ic: '\uD83D\uDD04' },
      { page: 'dms-dagitim', file: 'ersan_dms_dagitim.html', label: 'Da\u011F\u0131t\u0131m Listesi', ic: '\uD83D\uDCE4' }
    ]},
    { id: 'ik', title: '\u0130K & Yetkinlik', iso: '\u00A77.2', icon: '\uD83D\uDC65', dot: '#f59e0b', items: [
      { page: 'ik-personel', file: 'ersan_ik_personel.html', label: 'Personel Defteri', ic: '\uD83D\uDCD3' },
      { page: 'ik-matris', file: 'ersan_ik_matris.html', label: 'Yetkinlik Matriksi', ic: '\uD83D\uDCCA' },
      { page: 'ik-egitim', file: 'ersan_ik_egitim.html', label: 'E\u011Fitim Plan\u0131', ic: '\uD83C\uDF93' },
      { page: 'ik-sertifika', file: 'ersan_ik_sertifika.html', label: 'Sertifikalar', ic: '\uD83C\uDFC5' },
      { page: 'ik-gap', file: 'ersan_ik_gap.html', label: 'Gap Analizi', ic: '\uD83D\uDCC9' }
    ]},
    { id: 'finans', title: 'Finans', iso: '', icon: '\uD83D\uDCB5', dot: '#10b981', items: [
      { page: 'finans-panel', file: 'ersan_finans_panel.html', label: 'Finans Paneli', ic: '\uD83D\uDCCA' },
      { page: 'musteri-fatura', file: 'ersan_musteri_fatura.html', label: 'M\u00FC\u015Fteri Faturalar\u0131', ic: '\uD83E\uDDFE' },
      { page: 'tedarikci-fatura', file: 'ersan_tedarikci_fatura.html', label: 'Tedarik\u00E7i Faturalar\u0131', ic: '\uD83E\uDDFE' },
      { page: 'nakit-akis', file: 'ersan_nakit_akis.html', label: 'Nakit Ak\u0131\u015F\u0131', ic: '\uD83D\uDCB8' },
      { page: 'mutabakat', file: 'ersan_mutabakat.html', label: 'Mutabakat', ic: '\u2696\uFE0F' }
    ]}
  ];

  /* ── Navigate ── */
  window.sbGit = function (file) { window.location.href = file; };

  /* ── Toggle group ── */
  window.sbToggle = function (id) {
    var ch = document.getElementById('sbc-' + id);
    var grp = document.getElementById('sbg-' + id);
    if (!ch || !grp) return;
    var closing = !ch.classList.contains('closed');
    if (closing) { ch.classList.add('closed'); grp.classList.remove('open'); }
    else { ch.classList.remove('closed'); grp.classList.add('open'); }
    try { localStorage.setItem('sb_' + id, closing ? '0' : '1'); } catch (e) {}
  };

  /* ── Search filter ── */
  window.sbSearch = function (val) {
    var q = (val || '').toLowerCase();
    var items = document.querySelectorAll('.sb-ni');
    var groups = document.querySelectorAll('.sb-children');
    for (var i = 0; i < items.length; i++) {
      var txt = (items[i].getAttribute('data-label') || '').toLowerCase();
      items[i].style.display = (!q || txt.indexOf(q) > -1) ? '' : 'none';
    }
    for (var j = 0; j < groups.length; j++) {
      if (q) groups[j].classList.remove('closed');
      else {
        var gid = groups[j].id.replace('sbc-', '');
        var saved = null;
        try { saved = localStorage.getItem('sb_' + gid); } catch (e) {}
        if (saved === '0') groups[j].classList.add('closed');
      }
    }
  };

  /* ── Build HTML ── */
  function buildHTML() {
    var user = { name: 'Kullan\u0131c\u0131', role: 'Operat\u00F6r' };
    try {
      var u = sessionStorage.getItem('sb_user');
      if (u) { var p = JSON.parse(u); user.name = p.name || user.name; user.role = p.role || user.role; }
    } catch (e) {}
    var initials = user.name.split(' ').map(function (w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();

    var h = '';
    // Logo
    h += '<div class="sb-logo" onclick="sbGit(\'ersan_anasayfa.html\')" style="cursor:pointer">';
    h += '<div class="sb-logo-ic">E</div>';
    h += '<div><div class="sb-logo-t">Ersan MES</div><div class="sb-logo-s">AS9100 \u00B7 \u00DCretim</div></div></div>';
    // User
    h += '<div class="sb-user">';
    h += '<div class="sb-user-ava">' + initials + '</div>';
    h += '<div><div class="sb-user-n">' + user.name + '</div><div class="sb-user-r">' + user.role + '</div></div></div>';
    // Search
    h += '<div class="sb-srch"><span class="srch-ic">\uD83D\uDD0D</span>';
    h += '<input type="text" placeholder="Ara\u2026" oninput="sbSearch(this.value)"></div>';
    // Status
    h += '<div class="sb-status"><span class="st-dot"></span><span class="st-txt">\u00C7evrim i\u00E7i</span><span class="st-val" id="sb-clock"></span></div>';
    h += '<div class="sb-div"></div>';

    // Groups
    for (var g = 0; g < GROUPS.length; g++) {
      var grp = GROUPS[g];
      var open = true;
      try { var sv = localStorage.getItem('sb_' + grp.id); if (sv === '0') open = false; } catch (e) {}
      h += '<div class="sb-grp' + (open ? ' open' : '') + '" id="sbg-' + grp.id + '" onclick="sbToggle(\'' + grp.id + '\')">';
      h += '<span class="sb-grp-ic">' + grp.icon + '</span>';
      h += '<span>' + grp.title + '</span>';
      if (grp.iso) h += '<span class="sb-grp-ct">' + grp.iso + '</span>';
      h += '<span class="sb-grp-dot" style="background:' + grp.dot + '"></span>';
      h += '<span class="sb-grp-arr">\u25B6</span></div>';
      h += '<div class="sb-children' + (open ? '' : ' closed') + '" id="sbc-' + grp.id + '">';
      for (var i = 0; i < grp.items.length; i++) {
        var it = grp.items[i];
        h += '<div class="sb-ni" data-page="' + it.page + '" data-label="' + it.label + '" onclick="sbGit(\'' + it.file + '\')">';
        h += '<span class="sb-ni-ic">' + it.ic + '</span>';
        h += '<span class="sb-ni-txt">' + it.label + '</span></div>';
      }
      h += '</div>';
    }

    // Bottom actions
    h += '<div class="sb-bot">';
    h += '<div class="sb-bot-item" onclick="sbGit(\'ersan_sistem.html\')"><span>\u2699\uFE0F</span> Sistem Ayarlar\u0131</div>';
    h += '<div class="sb-bot-item" onclick="sbGit(\'ersan_bildirimler.html\')"><span>\uD83D\uDD14</span> Bildirimler</div>';
    h += '<div class="sb-bot-item" onclick="sbGit(\'ersan_yardim.html\')"><span>\u2753</span> Yard\u0131m</div>';
    h += '<div class="sb-bot-item" onclick="sbCikis()"><span>\uD83D\uDEAA</span> \u00C7\u0131k\u0131\u015F</div>';
    h += '</div>';
    return h;
  }

  /* ── Logout ── */
  window.sbCikis = function () {
    try { sessionStorage.clear(); } catch (e) {}
    window.location.href = 'index.html';
  };

  /* ── Clock ── */
  function sbClock() {
    var el = document.getElementById('sb-clock');
    if (!el) return;
    var d = new Date();
    el.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  /* ── Highlight active page ── */
  function sbHighlight() {
    var bodyPage = (document.body.dataset && document.body.dataset.page) || '';
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    var items = document.querySelectorAll('.sb-ni');
    for (var i = 0; i < items.length; i++) {
      var ni = items[i];
      var dp = ni.getAttribute('data-page') || '';
      var onclick = ni.getAttribute('onclick') || '';
      var match = onclick.match(/sbGit\('([^']+)'\)/);
      var fileMatch = match && match[1] === currentFile;
      var pageMatch = bodyPage && dp === bodyPage;
      if (fileMatch || pageMatch) {
        ni.classList.add('active');
        var parent = ni.closest('.sb-children');
        if (parent) {
          parent.classList.remove('closed');
          var gid = parent.id.replace('sbc-', 'sbg-');
          var grpEl = document.getElementById(gid);
          if (grpEl) grpEl.classList.add('open');
        }
      }
    }
  }

  /* ── Badge DOM setup ── */
  window.sbBadge = function (page, count, color) {
    if (!count || count <= 0) return;
    var ni = document.querySelector('.sb-ni[data-page="' + page + '"]');
    if (!ni) return;
    var old = ni.querySelector('.sb-nb');
    if (old) old.remove();
    var b = document.createElement('span');
    b.className = 'sb-nb ' + (color || 'b');
    b.textContent = count > 99 ? '99+' : count;
    ni.appendChild(b);
  };

  /* ── Init ── */
  function sbInit() {
    var mount = document.getElementById('sb-mount');
    if (!mount) return;
    mount.className = 'sb';
    mount.innerHTML = buildHTML();
    mount.style.cssText = 'width:210px!important;min-width:210px!important;flex-shrink:0!important;height:100vh!important;overflow-y:scroll!important;overflow-x:hidden!important;';

    var appEl = mount.parentElement;
    if (appEl) {
      appEl.style.cssText = 'display:flex!important;flex-direction:row!important;height:100vh!important;width:100vw!important;overflow:hidden!important;';
    }
    var mainEl = appEl ? (appEl.querySelector('.main') || appEl.querySelector('.icerik-alani')) : null;
    if (mainEl) {
      mainEl.style.cssText = 'flex:1 1 0!important;min-width:0!important;height:100vh!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;';
      var children = Array.from(mainEl.children).filter(function(c){ return c.tagName!=='SCRIPT' && c.tagName!=='STYLE'; });
      children.forEach(function(child, i) {
        var isTb = child.classList.contains('tb') || child.className.indexOf('topbar')>=0 || child.tagName==='NAV';
        if (isTb) { child.style.flexShrink='0'; }
        else { child.style.flex='1 1 0'; child.style.minHeight='0'; child.style.overflowY='auto'; }
      });
    }
    document.querySelectorAll('.sb-ni').forEach(function(ni){ var t=ni.querySelector('.sb-ni-txt'); if(t) ni.title=t.textContent.trim(); });

    sbHighlight();
    sbClock();
    setInterval(sbClock, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sbInit);
  } else {
    sbInit();
  }
})();
