/* ERSAN MES — sidebar.js v2.0
   Injects sidebar into <div id="sb-mount"></div>
   Requires: utils/sidebar.css */

(function () {

  /* ── Oturum kontrolü ── */
  (function() {
    var path = window.location.pathname;
    if (path.indexOf('ersan_giris') > -1 || path.indexOf('ersan_sifre_degistir') > -1) return;
    if (!sessionStorage.getItem('kullanici')) {
      window.location.href = 'ersan_giris.html';
      return;
    }
  })();

  /* ── Navigate ── */
  window.sbGit = function (file) { window.location.href = file; };

  /* ── Toggle group ── */
  window.sbToggle = function (id) {
    if (typeof id === 'object') id = id.id.replace('sbg-', '');
    var ch = document.getElementById('sbc-' + id);
    var grp = document.getElementById('sbg-' + id);
    if (!ch || !grp) return;
    var closing = !ch.classList.contains('closed');
    if (closing) {
      ch.style.overflow = 'hidden';
      ch.style.maxHeight = ch.scrollHeight + 'px';
      requestAnimationFrame(function () {
        ch.style.transition = 'max-height 0.2s ease';
        ch.style.maxHeight = '0px';
      });
      setTimeout(function () {
        ch.classList.add('closed');
        ch.style.transition = '';
        grp.classList.remove('open');
      }, 220);
    } else {
      ch.classList.remove('closed');
      ch.style.overflow = 'visible';
      ch.style.maxHeight = 'none';
      grp.classList.add('open');
    }
    try { localStorage.setItem('sb_' + id, closing ? '0' : '1'); } catch (e) {}
  };

  /* ── Search filter ── */
  window.sbAra = window.sbSearch = function (val) {
    var q = (val || '').toLowerCase();
    var items = document.querySelectorAll('.sb-ni');
    var groups = document.querySelectorAll('.sb-children');
    var sublbls = document.querySelectorAll('.sb-sub-lbl');
    for (var i = 0; i < items.length; i++) {
      var txt = (items[i].getAttribute('data-etiket') || items[i].getAttribute('data-label') || '').toLowerCase();
      items[i].style.display = (!q || txt.indexOf(q) > -1) ? '' : 'none';
    }
    for (var k = 0; k < sublbls.length; k++) {
      sublbls[k].style.display = q ? 'none' : '';
    }
    for (var j = 0; j < groups.length; j++) {
      if (q) {
        groups[j].classList.remove('closed');
        groups[j].style.overflow = 'visible';
        groups[j].style.maxHeight = 'none';
      } else {
        var gid = groups[j].id.replace('sbc-', '');
        var saved = null;
        try { saved = localStorage.getItem('sb_' + gid); } catch (e) {}
        if (saved === '0') {
          groups[j].classList.add('closed');
          groups[j].style.overflow = 'hidden';
          groups[j].style.maxHeight = '0px';
        }
      }
    }
  };

  /* ── Logout ── */
  window.sbCikis = function () {
    if (!confirm('Çıkış yapmak istediğinizden emin misiniz?')) return;
    try { sessionStorage.clear(); } catch (e) {}
    window.location.href = 'ersan_giris.html';
  };

  /* ── Clock ── */
  function sbClock() {
    var el = document.getElementById('sb-clock');
    if (!el) return;
    var d = new Date();
    el.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  /* ── Build sidebar HTML ── */
  function buildHTML() {
    var user = { name: 'Kullan\u0131c\u0131', role: 'Operat\u00F6r', ava: '' };
    try {
      var sName = sessionStorage.getItem('kullanici');
      var sRole = sessionStorage.getItem('kullanici_rol');
      var sAva  = sessionStorage.getItem('kullanici_ava');
      if (sName) user.name = sName;
      if (sRole) user.role = sRole;
      if (sAva)  user.ava  = sAva;
    } catch (e) {}
    var initials = user.ava || user.name.split(' ').map(function (w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();

    var DEFS = [
      { id:'satinalma', title:'Sat\u0131nalma', iso:'\u00A78.4', icon:'\uD83D\uDED2', dot:'#3b82f6', items:[
        {f:'ersan_satinalma_pr.html',    l:'Sat\u0131nalma Talepleri (PR)', i:'\uD83D\uDCDD'},
        {f:'ersan_satinalma_rfq.html',   l:'Teklifler (RFQ)',              i:'\uD83D\uDCCB'},
        {f:'ersan_satinalma_po.html',    l:'Sipari\u015Fler (PO)',         i:'\uD83D\uDCE6'},
        {f:'ersan_satinalma_grn.html',   l:'\u00D6n Kabul (GRN)',          i:'\uD83D\uDE9A'},
        {f:'ersan_tedarikciler.html',    l:'Tedarik\u00E7iler',            i:'\uD83C\uDFED'},
        {f:'ersan_tedarikciler.html',    l:'Tedarik\u00E7i De\u011Ferlendirme', i:'\u2B50'},
        {f:'ersan_satinalma_fatura.html',l:'Sat\u0131nalma Faturalar\u0131',i:'\uD83E\uDDFE'}
      ]},
      { id:'satis', title:'Sat\u0131\u015F', iso:'\u00A78.2', icon:'\uD83D\uDCBC', dot:'#14b8a6', items:[
        {f:'ersan_teklif.html',          l:'Teklifler',            i:'\uD83D\uDCB0'},
        {f:'ersan_siparisler.html',      l:'M\u00FC\u015Fteri Sipari\u015Fleri', i:'\uD83D\uDCCB'},
        {f:'ersan_musteriler.html',      l:'M\u00FC\u015Fteriler', i:'\uD83E\uDD1D'},
        {f:'ersan_sevkiyat.html',        l:'Sevkiyat',             i:'\uD83D\uDCE4'},
        {f:'ersan_musteri_fatura.html',  l:'M\u00FC\u015Fteri Faturalar\u0131', i:'\uD83E\uDDFE'}
      ]},
      { id:'crm', title:'CRM', iso:'\u00A78.2', icon:'\uD83E\uDD1D', dot:'#e879f9', subs:[
        {lbl:'M\u00FC\u015Fteri Y\u00F6netimi', items:[
          {f:'ersan_crm.html',             l:'M\u00FC\u015Fteri Defteri',  i:'\uD83C\uDFE2'},
          {f:'ersan_musteri.html',          l:'Ki\u015Fi Rehberi',         i:'\uD83D\uDC64'},
          {f:'ersan_sozlesmeler.html',      l:'S\u00F6zle\u015Fmeler',    i:'\uD83D\uDCDC'}
        ]},
        {lbl:'F\u0131rsat & Takip', items:[
          {f:'ersan_pipeline.html',         l:'F\u0131rsat Pipeline',      i:'\uD83C\uDFAF'},
          {f:'ersan_crm_takip.html',        l:'G\u00F6r\u00FC\u015Fme Notlar\u0131', i:'\uD83D\uDCDE'},
          {f:'ersan_takip.html',            l:'Ziyaret Plan\u0131',        i:'\uD83D\uDCC5'}
        ]},
        {lbl:'Memnuniyet \u00A79.1.2', items:[
          {f:'ersan_360.html',              l:'Memnuniyet Anketi',         i:'\uD83D\uDCCA'},
          {f:'ersan_sikayet.html',          l:'\u015Eikayet Y\u00F6netimi',i:'\uD83D\uDE0A'},
          {f:'ersan_satis_tahmini.html',    l:'M\u00FC\u015Fteri Skoru',   i:'\uD83D\uDCC8'}
        ]}
      ]},
      { id:'stok', title:'Stok & Depo', iso:'\u00A78.5.2', icon:'\uD83D\uDCE6', dot:'#f59e0b', items:[
        {f:'ersan_stok.html',            l:'Stok Durumu',              i:'\uD83D\uDCCA'},
        {f:'ersan_stok_hareketleri.html',l:'Stok Hareketleri',        i:'\uD83D\uDD04'},
        {f:'ersan_malzeme.html',         l:'Lot & \u0130zlenebilirlik',i:'\uD83C\uDFF7'},
        {f:'ersan_sayim.html',           l:'Say\u0131m',              i:'\uD83D\uDD22'},
        {f:'ersan_atolye_harita.html',   l:'At\u00F6lye & Raf Haritas\u0131', i:'\uD83D\uDDFA'},
        {f:'ersan_palet.html',           l:'QR Etiket & Traveller',   i:'\u25FC'}
      ]},
      { id:'uretim', title:'\u00DCretim', iso:'\u00A78.5.1', icon:'\u2699', dot:'#10b981', items:[
        {f:'ersan_isemirleri.html',      l:'\u0130\u015F Emirleri (WO)', i:'\uD83D\uDCCB'},
        {f:'ersan_planlama.html',        l:'\u00DCretim Planlama',    i:'\uD83D\uDCC5'},
        {f:'ersan_atolye.html',          l:'At\u00F6lye Takibi',      i:'\uD83C\uDFED'}
      ]},
      { id:'kalite', title:'Kalite', iso:'\u00A78.4\u201310.2', icon:'\uD83D\uDD2C', dot:'#ef4444', subs:[
        {lbl:'Muayene', items:[
          {f:'ersan_kalite_iqc.html',      l:'Girdi Kalite (IQC)',     i:'\uD83D\uDCE5'},
          {f:'ersan_kalite_fai.html',      l:'\u0130lk Par\u00E7a (FAI)', i:'\uD83D\uDD2D'},
          {f:'ersan_kalite_ipqc.html',     l:'S\u00FCre\u00E7 \u0130\u00E7i (IPQC)', i:'\uD83C\uDFED'}
        ]},
        {lbl:'Uygunsuzluk & D\u00FCzeltme', items:[
          {f:'ersan_kalite_ncr.html',      l:'NCR Kay\u0131tlar\u0131',i:'\u26D4'},
          {f:'ersan_kalite_capa.html',     l:'CAPA (8D)',              i:'\uD83D\uDD27'}
        ]},
        {lbl:'\u00D6l\u00E7\u00FCm & Kalibrasyon', items:[
          {f:'ersan_kalite_kalibrasyon.html',l:'Kalibrasyon (EQP)',    i:'\uD83D\uDCCF'}
        ]}
      ]},
      { id:'ekipman', title:'Ekipman & Bak\u0131m', iso:'\u00A77.1.3', icon:'\uD83D\uDD27', dot:'#f97316', items:[
        {f:'ersan_ekipman_dashboard.html',l:'Dashboard',               i:'\uD83D\uDCCA'},
        {f:'ersan_ekipman_defteri.html', l:'Ekipman Defteri (MCH)',    i:'\uD83D\uDCCB'},
        {f:'ersan_ekipman_bakim.html',   l:'Bak\u0131m Plan\u0131 (PM)', i:'\uD83D\uDCC5'},
        {f:'ersan_ekipman_ariza.html',   l:'Ar\u0131za Kayd\u0131',   i:'\u26A1'},
        {f:'ersan_ekipman_bwo.html',     l:'Bak\u0131m \u0130\u015F Emirleri (BWO)', i:'\uD83D\uDCDD'}
      ]},
      { id:'dms', title:'Dok\u00FCman Y\u00F6netimi', iso:'\u00A77.5', icon:'\uD83D\uDCC2', dot:'#8b5cf6', items:[
        {f:'ersan_dms_master.html',      l:'Master Liste',            i:'\uD83D\uDCCB'},
        {f:'ersan_dms_onay.html',        l:'Onay Bekleyenler',        i:'\u2705'},
        {f:'ersan_dms_revizyon.html',    l:'Revizyon Takibi',         i:'\uD83D\uDD04'},
        {f:'ersan_dms_dagitim.html',     l:'Da\u011F\u0131t\u0131m Listesi', i:'\uD83D\uDCE4'}
      ]},
      { id:'ik', title:'\u0130K & Yetkinlik', iso:'\u00A77.2', icon:'\uD83D\uDC65', dot:'#ec4899', items:[
        {f:'ersan_ik_personel.html',     l:'Personel Defteri',        i:'\uD83D\uDC64'},
        {f:'ersan_ik_matris.html',       l:'Yetkinlik Matriksi',      i:'\uD83D\uDD22'},
        {f:'ersan_ik_egitim.html',       l:'E\u011Fitim Plan\u0131',  i:'\uD83D\uDCDA'},
        {f:'ersan_ik_sertifika.html',    l:'Sertifikalar',            i:'\uD83C\uDFC6'},
        {f:'ersan_ik_gap.html',          l:'Gap Analizi',             i:'\uD83D\uDCCA'}
      ]},
      { id:'risk', title:'Risk & FMEA', iso:'\u00A76.1', icon:'\u26A0', dot:'#f59e0b', items:[
        {f:'ersan_risk.html',            l:'Risk Kayd\u0131',         i:'\uD83D\uDCCB'},
        {f:'ersan_risk_fmea.html',       l:'FMEA Tablosu',            i:'\uD83D\uDD22'},
        {f:'ersan_risk_fmea.html',       l:'RPN Hesab\u0131',         i:'\uD83D\uDCCA'},
        {f:'ersan_risk.html',            l:'Aksiyon Plan\u0131',      i:'\uD83D\uDCDD'}
      ]},
      { id:'denetim', title:'\u0130\u00E7 Denetim', iso:'\u00A79.2', icon:'\uD83D\uDD0D', dot:'#84cc16', items:[
        {f:'ersan_denetim_panel.html',   l:'Denetim Paneli',          i:'\uD83D\uDCCA'},
        {f:'ersan_denetim_plan.html',    l:'Denetim Plan\u0131',      i:'\uD83D\uDCC5'},
        {f:'ersan_denetim_yurutme.html', l:'Denetim Y\u00FCr\u00FCtme', i:'\u25B6'},
        {f:'ersan_bulgular.html',        l:'Bulgular',                i:'\uD83D\uDCCB'},
        {f:'ersan_denetim_raporlar.html',l:'Raporlar',                i:'\uD83D\uDCC8'}
      ]},
      { id:'ygg', title:'Y\u00F6netim G\u00F6zden Ge\u00E7irme', iso:'\u00A79.3', icon:'\uD83D\uDCCA', dot:'#84cc16', items:[
        {f:'ersan_ygg.html', l:'YGG Toplant\u0131 Kayd\u0131', i:'\uD83D\uDCC5'},
        {f:'ersan_ygg.html', l:'Girdi Matrisi',                 i:'\uD83D\uDCE5'},
        {f:'ersan_ygg.html', l:'Aksiyon Takibi',                i:'\u2705'},
        {f:'ersan_ygg.html', l:'Tutanak & Rapor',               i:'\uD83D\uDCC4'}
      ]},
      { id:'kpi', title:'KPI Dashboard', iso:'\u00A79.1', icon:'\uD83D\uDCC8', dot:'#8b5cf6', items:[
        {f:'ersan_departman_kpi.html',   l:'KPI \u00D6zet Tablosu',   i:'\uD83D\uDCCA'},
        {f:'ersan_departman_kpi.html',   l:'Hedef Y\u00F6netimi',     i:'\uD83C\uDFAF'},
        {f:'ersan_kar_analizi.html',     l:'Trend Grafikleri',         i:'\uD83D\uDCC9'},
        {f:'ersan_maliyet.html',         l:'Kalite Maliyeti (CoQ)',    i:'\uD83D\uDCB0'}
      ]},
      { id:'finans', title:'Finans', iso:'', icon:'\uD83D\uDCB0', dot:'#06b6d4', items:[
        {f:'ersan_finans_panel.html',    l:'Finans Paneli',            i:'\uD83D\uDCCA'},
        {f:'ersan_musteri_fatura.html',  l:'M\u00FC\u015Fteri Faturalar\u0131', i:'\uD83E\uDDFE'},
        {f:'ersan_tedarikci_fatura.html',l:'Tedarik\u00E7i Faturalar\u0131',    i:'\uD83E\uDDFE'},
        {f:'ersan_nakit_akisi.html',     l:'Nakit Ak\u0131\u015F\u0131',        i:'\uD83D\uDCB3'},
        {f:'ersan_mutabakat.html',       l:'Mutabakat',                i:'\u2696'}
      ]}
    ];

    var h = '';
    // Logo
    h += '<div class="sb-logo" onclick="sbGit(\'ersan_anasayfa.html\')" style="cursor:pointer">';
    h += '<div class="sb-logo-ic">\u2699</div>';
    h += '<div><div class="sb-logo-t">ERSAN MES</div><div class="sb-logo-s">v7.0 \u00B7 AS9100 Rev.D</div></div></div>';
    // User
    h += '<div class="sb-user">';
    h += '<div class="sb-user-ava" id="sb-ava">' + initials + '</div>';
    h += '<div><div class="sb-user-n" id="sb-uname">' + user.name + '</div><div class="sb-user-r" id="sb-urol">' + user.role + '</div></div>';
    h += '<span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.25)">\u2304</span></div>';
    // Search
    h += '<div class="sb-srch"><span class="srch-ic">\u2315</span>';
    h += '<input type="text" placeholder="Ara\u2026" id="sb-q" oninput="sbAra(this.value)"></div>';
    // Status
    h += '<div class="sb-status"><span class="st-dot"></span><span class="st-txt">\u00C7evrim i\u00E7i</span><span class="st-val" id="sb-clock"></span></div>';
    h += '<div class="sb-div"></div>';

    // Groups
    for (var g = 0; g < DEFS.length; g++) {
      var grp = DEFS[g];
      var open = true;
      try { var sv = localStorage.getItem('sb_' + grp.id); if (sv === '0') open = false; } catch (e) {}

      h += '<div class="sb-grp' + (open ? ' open' : '') + '" id="sbg-' + grp.id + '" onclick="sbToggle(\'' + grp.id + '\')">';
      h += '<span class="sb-grp-ic">' + grp.icon + '</span>';
      h += '<span>' + grp.title + '</span>';
      if (grp.iso) h += '<span class="sb-grp-ct">' + grp.iso + '</span>';
      h += '<span class="sb-grp-dot" style="background:' + grp.dot + '"></span>';
      h += '<span class="sb-grp-arr">\u203A</span></div>';
      h += '<div class="sb-children' + (open ? '' : ' closed') + '" id="sbc-' + grp.id + '">';

      if (grp.subs) {
        for (var s = 0; s < grp.subs.length; s++) {
          var sub = grp.subs[s];
          h += '<div class="sb-sub-lbl">' + sub.lbl + '</div>';
          for (var si = 0; si < sub.items.length; si++) {
            var it = sub.items[si];
            h += '<div class="sb-ni" data-etiket="' + it.l + '" onclick="sbGit(\'' + it.f + '\')">';
            h += '<span class="sb-ni-ic">' + it.i + '</span><span class="sb-ni-txt">' + it.l + '</span></div>';
          }
        }
      } else if (grp.items) {
        for (var i = 0; i < grp.items.length; i++) {
          var it2 = grp.items[i];
          h += '<div class="sb-ni" data-etiket="' + it2.l + '" onclick="sbGit(\'' + it2.f + '\')">';
          h += '<span class="sb-ni-ic">' + it2.i + '</span><span class="sb-ni-txt">' + it2.l + '</span></div>';
        }
      }
      h += '</div>';
      if (g < DEFS.length - 1) h += '<div class="sb-div"></div>';
    }

    // Bottom actions
    h += '<div class="sb-bot">';
    h += '<div class="sb-bot-item" onclick="sbGit(\'ersan_sistem.html\')"><span>\u2699</span> Sistem Ayarlar\u0131</div>';
    h += '<div class="sb-bot-item"><span>\uD83D\uDD14</span> Bildirimler</div>';
    h += '<div class="sb-bot-item"><span>\u2753</span> Yard\u0131m</div>';
    h += '<div class="sb-bot-item" style="color:rgba(255,100,100,.5)" onclick="sbCikis()"><span>\u21A9</span> \u00C7\u0131k\u0131\u015F</div>';
    h += '</div>';
    return h;
  }

  /* ── Highlight active page ── */
  function sbHighlight() {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    var items = document.querySelectorAll('.sb-ni');
    for (var i = 0; i < items.length; i++) {
      var ni = items[i];
      var onclick = ni.getAttribute('onclick') || '';
      var match = onclick.match(/sbGit\('([^']+)'\)/);
      if (match && match[1] === currentFile) {
        ni.classList.add('active');
        var parent = ni.closest('.sb-children');
        if (parent) {
          parent.classList.remove('closed');
          parent.style.overflow = 'visible';
          parent.style.maxHeight = 'none';
          var gid = parent.id.replace('sbc-', 'sbg-');
          var grpEl = document.getElementById(gid);
          if (grpEl) grpEl.classList.add('open');
        }
      }
    }
  }

  /* ── Badge DOM setup ── */
  window.sbBadge = function (etiket, count, color) {
    if (!count || count <= 0) return;
    var items = document.querySelectorAll('.sb-ni');
    for (var i = 0; i < items.length; i++) {
      if ((items[i].getAttribute('data-etiket') || '') === etiket) {
        var old = items[i].querySelector('.sb-nb');
        if (old) old.remove();
        var b = document.createElement('span');
        b.className = 'sb-nb ' + (color || 'b');
        b.textContent = count > 99 ? '99+' : count;
        items[i].appendChild(b);
        break;
      }
    }
  };

  /* ── Init ── */
  function sbInit() {
    var mount = document.getElementById('sb-mount');
    if (!mount) return;
    mount.className = 'sb';
    mount.innerHTML = buildHTML();
    mount.style.cssText = 'flex:0 0 210px!important;width:210px!important;min-width:210px!important;max-width:210px!important;height:100vh!important;overflow-y:scroll!important;overflow-x:hidden!important;margin:0!important;border-right:none!important;';

    var appEl = mount.parentElement;
    if (appEl) {
      appEl.style.cssText = 'display:flex!important;flex-direction:row!important;height:100vh!important;width:100vw!important;overflow:hidden!important;gap:0!important;padding:0!important;margin:0!important;';
    }
    var mainEl = appEl ? (appEl.querySelector('.main') || appEl.querySelector('.icerik-alani')) : null;
    if (mainEl) {
      mainEl.style.cssText = 'flex:1 1 0!important;min-width:0!important;height:100vh!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;margin:0!important;padding:0!important;';
      var children = Array.from(mainEl.children).filter(function(c){ return c.tagName!=='SCRIPT' && c.tagName!=='STYLE'; });
      children.forEach(function(child) {
        var isTb = child.classList.contains('tb') || child.className.indexOf('topbar')>=0 || child.tagName==='NAV';
        if (isTb) { child.style.flexShrink='0'; }
        else { child.style.flex='1 1 0'; child.style.minHeight='0'; child.style.overflowY='auto'; }
      });
    }

    document.querySelectorAll('.sb-ni').forEach(function(ni){ var t=ni.querySelector('.sb-ni-txt'); if(t) ni.title=t.textContent.trim(); });

    var sbBot = document.querySelector('.sb-bot');
    if (sbBot) sbBot.style.marginTop = '16px';

    document.querySelectorAll('.sb-children:not(.closed)').forEach(function (ch) {
      ch.style.overflow = 'visible';
      ch.style.maxHeight = 'none';
    });

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
