/* ERSAN MES — yardim.js v1.0
   AI Yardım Paneli — tüm sayfalarda çalışır
   sidebar.js tarafından inject edilir */

(function yardimKur() {
  if (document.getElementById('yardim-panel')) return;

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.yardim-panel{position:fixed;right:0;top:0;bottom:0;width:360px;background:#fff;border-left:1px solid #e5e7eb;display:flex;flex-direction:column;box-shadow:-4px 0 20px rgba(0,0,0,.08);transition:transform .25s cubic-bezier(.22,.68,0,1.1);z-index:9500}',
    '.yardim-panel.kapali{transform:translateX(100%)}',
    '.yp-head{background:#1a2b47;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}',
    '.yp-ht{font-size:13px;font-weight:800;color:#fff}',
    '.yp-hs{font-size:10px;color:rgba(255,255,255,.45);margin-top:1px}',
    '.yp-kapat{margin-left:auto;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.12s}',
    '.yp-kapat:hover{background:rgba(255,255,255,.22)}',
    '.yp-tabs{display:flex;border-bottom:1px solid #e5e7eb;flex-shrink:0}',
    '.yp-tab{flex:1;padding:9px 0;text-align:center;font-size:11.5px;font-weight:600;color:#9ca3af;cursor:pointer;border-bottom:2px solid transparent;transition:.12s}',
    '.yp-tab:hover{color:#374151}',
    '.yp-tab.aktif{color:#1a2b47;border-bottom-color:#F5A623}',
    '.yp-icerik{flex:1;overflow:hidden;display:flex;flex-direction:column}',
    '.yp-tab-ic{display:none;flex:1;flex-direction:column;overflow:hidden}',
    '.yp-tab-ic.goster{display:flex}',
    '.chat-mesajlar{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}',
    '.chat-mesajlar::-webkit-scrollbar{width:3px}',
    '.chat-mesajlar::-webkit-scrollbar-thumb{background:#e5e7eb}',
    '.msg{display:flex;gap:8px;align-items:flex-end;max-width:100%}',
    '.msg.kullanici{flex-direction:row-reverse}',
    '.msg-ava{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;border:2px solid #e5e7eb}',
    '.msg-ava.ai{background:#1a2b47;color:#fff;border-color:#1a2b47}',
    '.msg-ava.usr{background:#F5A623;color:#fff;border-color:#F5A623}',
    '.msg-balon{max-width:80%;padding:9px 12px;border-radius:12px;font-size:12px;line-height:1.6;color:#111827}',
    '.msg-balon.ai{background:#f9fafb;border:1px solid #e5e7eb;border-bottom-left-radius:4px}',
    '.msg-balon.kullanici{background:#1a2b47;color:#fff;border-bottom-right-radius:4px}',
    '.msg-balon code{font-family:monospace;font-size:11px;background:rgba(0,0,0,.08);padding:1px 5px;border-radius:3px}',
    '.msg-balon strong{font-weight:700}',
    '.typing-dots{display:flex;gap:4px;padding:4px 2px}',
    '.typing-dots span{width:7px;height:7px;border-radius:50%;background:#d1d5db;animation:ypTyping .9s infinite ease-in-out}',
    '.typing-dots span:nth-child(2){animation-delay:.2s}',
    '.typing-dots span:nth-child(3){animation-delay:.4s}',
    '@keyframes ypTyping{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}',
    '.quick-sorular{padding:8px 12px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid #f3f4f6;flex-shrink:0;background:#f9fafb}',
    '.quick-soru{padding:5px 10px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;font-size:10.5px;color:#374151;cursor:pointer;transition:.12s;white-space:nowrap;font-family:inherit}',
    '.quick-soru:hover{background:#1a2b47;color:#fff;border-color:#1a2b47}',
    '.chat-input-wrap{padding:10px 12px;border-top:1px solid #e5e7eb;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;background:#fff}',
    '.chat-input{flex:1;border:1.5px solid #e5e7eb;border-radius:10px;padding:8px 12px;font-size:12.5px;font-family:inherit;resize:none;outline:none;min-height:38px;max-height:100px;color:#111827;line-height:1.5;transition:.12s}',
    '.chat-input:focus{border-color:#F5A623;box-shadow:0 0 0 3px rgba(245,166,35,.1)}',
    '.chat-gonder{width:36px;height:36px;border-radius:9px;background:#1a2b47;border:none;color:#fff;font-size:16px;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.chat-gonder:hover{background:#243555}',
    '.chat-gonder:disabled{opacity:.4;cursor:not-allowed}',
    '.mod-scroll{flex:1;overflow-y:auto;padding:10px}',
    '.mod-scroll::-webkit-scrollbar{width:3px}',
    '.mod-grp-t{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;padding:8px 8px 4px;margin-top:4px}',
    '.mod-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;cursor:pointer;transition:.12s}',
    '.mod-item:hover{background:#f9fafb}',
    '.mod-ic{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}',
    '.mod-t{font-size:12px;font-weight:600;color:#111827}',
    '.mod-s{font-size:10px;color:#9ca3af}',
    '.mod-std{margin-left:auto;font-size:8.5px;color:#d1d5db;font-family:monospace}',
    '.ks-scroll{flex:1;overflow-y:auto;padding:10px}',
    '.ks-sec{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;padding:8px 8px 4px}',
    '.ks-row{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:5px;transition:.1s}',
    '.ks-row:hover{background:#f9fafb}',
    '.ks-lbl{font-size:11.5px;color:#374151}',
    '.ks-key{display:flex;gap:3px}',
    '.ks-kbd{font-family:monospace;font-size:9.5px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:3px;padding:2px 6px;color:#6b7280}',
    '.yardim-float-btn{position:fixed;bottom:20px;right:20px;z-index:9400;width:46px;height:46px;border-radius:50%;background:#1a2b47;color:#fff;border:none;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(26,43,71,.35);transition:.2s}',
    '.yardim-float-btn:hover{background:#243555;transform:scale(1.08)}',
    '.yardim-badge-dot{position:absolute;top:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#F5A623;border:2px solid #fff}'
  ].join('\n');
  document.head.appendChild(style);

  // ── PANEL HTML ──
  var panel = document.createElement('div');
  panel.id = 'yardim-panel';
  panel.className = 'yardim-panel kapali';
  panel.innerHTML =
    '<div class="yp-head">'
    + '<svg viewBox="0 0 120 34" style="height:26px;width:auto;flex-shrink:0"><polygon points="5,3 24,3 19,11 0,11" fill="#F5A623"/><polygon points="7,15 22,15 17,23 3,23" fill="#D28A10"/><polygon points="9,27 20,27 15,34 5,34" fill="#A67214"/><text x="30" y="20" font-family="\'Segoe UI\',sans-serif" font-weight="800" font-size="15" fill="#fff">ERSAN</text><text x="31" y="30" font-family="\'Segoe UI\',sans-serif" font-weight="700" font-size="9" fill="#F5A623" letter-spacing="2">MES</text></svg>'
    + '<div style="margin-left:4px"><div class="yp-ht">Yard\u0131m Merkezi</div><div class="yp-hs">AI destekli \u00B7 v7.0</div></div>'
    + '<button class="yp-kapat" onclick="window._yardimKapat()">\u2715</button>'
    + '</div>'
    + '<div class="yp-tabs">'
    + '<div class="yp-tab aktif" onclick="window._yardimTab(\'ai\',this)">\uD83E\uDD16 AI Asistan</div>'
    + '<div class="yp-tab" onclick="window._yardimTab(\'moduller\',this)">\uD83D\uDCE6 Mod\u00FCller</div>'
    + '<div class="yp-tab" onclick="window._yardimTab(\'kisayollar\',this)">\u2328 K\u0131sayollar</div>'
    + '</div>'
    + '<div class="yp-icerik">'

    // AI Chat tab
    + '<div class="yp-tab-ic goster" id="yp-tab-ai">'
    + '<div class="chat-mesajlar" id="yp-mesajlar">'
    + '<div class="msg"><div class="msg-ava ai">\uD83E\uDD16</div><div class="msg-balon ai">Merhaba! Ben Ersan MES yapay zeka asistan\u0131y\u0131m. \uD83E\uDD16<br><br><strong>Sat\u0131nalma, Kalite, \u00DCretim, Stok</strong> ve di\u011Fer t\u00FCm mod\u00FCller hakk\u0131nda yard\u0131mc\u0131 olabilirim.<br><br>Ne \u00F6\u011Frenmek istersiniz?</div></div>'
    + '</div>'
    + '<div class="quick-sorular" id="yp-quick">'
    + '<button class="quick-soru" onclick="window._yardimHizli(this)">NCR nas\u0131l a\u00E7\u0131l\u0131r?</button>'
    + '<button class="quick-soru" onclick="window._yardimHizli(this)">PR olu\u015Fturma ad\u0131mlar\u0131</button>'
    + '<button class="quick-soru" onclick="window._yardimHizli(this)">IQC lot kabul i\u015Flemi</button>'
    + '<button class="quick-soru" onclick="window._yardimHizli(this)">CAPA nedir?</button>'
    + '<button class="quick-soru" onclick="window._yardimHizli(this)">WO nas\u0131l olu\u015Fturulur?</button>'
    + '</div>'
    + '<div class="chat-input-wrap">'
    + '<textarea class="chat-input" id="yp-input" placeholder="Soru sor veya mod\u00FCl ad\u0131 yaz..." rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();window._yardimGonder()}" oninput="this.style.height=\'auto\';this.style.height=Math.min(this.scrollHeight,100)+\'px\'"></textarea>'
    + '<button class="chat-gonder" id="yp-gonder" onclick="window._yardimGonder()">\u2191</button>'
    + '</div></div>'

    // Modüller tab
    + '<div class="yp-tab-ic" id="yp-tab-moduller"><div class="mod-scroll">'
    + '<div class="mod-grp-t">Tedarik Zinciri</div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_satinalma_pr.html\'"><div class="mod-ic" style="background:#dbeafe">\uD83D\uDED2</div><div><div class="mod-t">Sat\u0131nalma</div><div class="mod-s">PR \u00B7 RFQ \u00B7 PO \u00B7 GRN</div></div><span class="mod-std">\u00A78.4</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_siparisler.html\'"><div class="mod-ic" style="background:#e0f2fe">\uD83D\uDCBC</div><div><div class="mod-t">Sat\u0131\u015F</div><div class="mod-s">Teklifler \u00B7 Sipari\u015Fler</div></div><span class="mod-std">\u00A78.2</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_stok.html\'"><div class="mod-ic" style="background:#fef3c7">\uD83D\uDCE6</div><div><div class="mod-t">Stok & Depo</div><div class="mod-s">Stok \u00B7 Lot \u00B7 Say\u0131m</div></div><span class="mod-std">\u00A78.5.2</span></div>'
    + '<div class="mod-grp-t">\u00DCretim</div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_isemirleri.html\'"><div class="mod-ic" style="background:#d1fae5">\u2699</div><div><div class="mod-t">\u0130\u015F Emirleri</div><div class="mod-s">WO \u00B7 Traveller</div></div><span class="mod-std">\u00A78.5.1</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_planlama.html\'"><div class="mod-ic" style="background:#dcfce7">\uD83D\uDCC5</div><div><div class="mod-t">\u00DCretim Planlama</div><div class="mod-s">Kapasite \u00B7 \u00C7izelge</div></div><span class="mod-std">\u00A78.1</span></div>'
    + '<div class="mod-grp-t">Kalite</div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_kalite_iqc.html\'"><div class="mod-ic" style="background:#fee2e2">\uD83D\uDCE5</div><div><div class="mod-t">Girdi Kalite (IQC)</div><div class="mod-s">Lot muayenesi</div></div><span class="mod-std">\u00A78.4</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_kalite_ncr.html\'"><div class="mod-ic" style="background:#fee2e2">\u26D4</div><div><div class="mod-t">NCR</div><div class="mod-s">Uygunsuzluk y\u00F6netimi</div></div><span class="mod-std">\u00A78.7</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_kalite_capa.html\'"><div class="mod-ic" style="background:#ede9fe">\uD83D\uDD27</div><div><div class="mod-t">CAPA (8D)</div><div class="mod-s">D\u00FCzeltici faaliyetler</div></div><span class="mod-std">\u00A710.2</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_kalite_kalibrasyon.html\'"><div class="mod-ic" style="background:#fef3c7">\uD83D\uDCCF</div><div><div class="mod-t">Kalibrasyon</div><div class="mod-s">EQP takibi</div></div><span class="mod-std">\u00A77.1.5</span></div>'
    + '<div class="mod-grp-t">Destek</div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_ekipman_dashboard.html\'"><div class="mod-ic" style="background:#fff7ed">\uD83D\uDD27</div><div><div class="mod-t">Ekipman & Bak\u0131m</div><div class="mod-s">MTBF \u00B7 Ar\u0131za \u00B7 PM</div></div><span class="mod-std">\u00A77.1.3</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_dms_master.html\'"><div class="mod-ic" style="background:#f3e8ff">\uD83D\uDCC2</div><div><div class="mod-t">Dok\u00FCman Y\u00F6netimi</div><div class="mod-s">Pros\u00E9d\u00FCr \u00B7 Form</div></div><span class="mod-std">\u00A77.5</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_ik_personel.html\'"><div class="mod-ic" style="background:#fce7f3">\uD83D\uDC65</div><div><div class="mod-t">\u0130K & Yetkinlik</div><div class="mod-s">E\u011Fitim \u00B7 Matris</div></div><span class="mod-std">\u00A77.2</span></div>'
    + '<div class="mod-item" onclick="location.href=\'ersan_departman_kpi.html\'"><div class="mod-ic" style="background:#ecfdf5">\uD83D\uDCCA</div><div><div class="mod-t">KPI Dashboard</div><div class="mod-s">Performans \u00F6zeti</div></div><span class="mod-std">\u00A79.1</span></div>'
    + '</div></div>'

    // Kısayollar tab
    + '<div class="yp-tab-ic" id="yp-tab-kisayollar"><div class="ks-scroll">'
    + '<div class="ks-sec">Mod\u00FCl Gezinme</div>'
    + '<div class="ks-row"><span class="ks-lbl">Sat\u0131nalma</span><div class="ks-key"><kbd class="ks-kbd">Alt</kbd><kbd class="ks-kbd">S</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">Kalite</span><div class="ks-key"><kbd class="ks-kbd">Alt</kbd><kbd class="ks-kbd">K</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">\u00DCretim</span><div class="ks-key"><kbd class="ks-kbd">Alt</kbd><kbd class="ks-kbd">U</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">Ana Sayfa</span><div class="ks-key"><kbd class="ks-kbd">Alt</kbd><kbd class="ks-kbd">H</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">Yard\u0131m a\u00E7/kapat</span><div class="ks-key"><kbd class="ks-kbd">F1</kbd></div></div>'
    + '<div class="ks-sec">Genel</div>'
    + '<div class="ks-row"><span class="ks-lbl">Yeni kay\u0131t</span><div class="ks-key"><kbd class="ks-kbd">Ctrl</kbd><kbd class="ks-kbd">N</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">Kaydet</span><div class="ks-key"><kbd class="ks-kbd">Ctrl</kbd><kbd class="ks-kbd">S</kbd></div></div>'
    + '<div class="ks-row"><span class="ks-lbl">Arama</span><div class="ks-key"><kbd class="ks-kbd">Ctrl</kbd><kbd class="ks-kbd">F</kbd></div></div>'
    + '<div class="ks-sec">\u0130leti\u015Fim</div>'
    + '<div style="padding:10px 8px"><div style="background:#f9fafb;border-radius:7px;padding:10px 12px">'
    + '<div style="font-size:11.5px;font-weight:700;color:#111827;margin-bottom:4px">Teknik Destek</div>'
    + '<div style="font-size:11px;color:#6b7280">it@ersanmakine.com.tr</div>'
    + '<div style="font-size:10px;color:#9ca3af;margin-top:4px">Ersan MES v7.0 \u00B7 AS9100 Rev.D</div>'
    + '</div></div>'
    + '</div></div>'

    + '</div>'; // /yp-icerik

  document.body.appendChild(panel);

  // ── FLOAT BUTON ──
  var floatBtn = document.createElement('button');
  floatBtn.id = 'yardim-float';
  floatBtn.className = 'yardim-float-btn';
  floatBtn.innerHTML = '\u2753<div class="yardim-badge-dot"></div>';
  floatBtn.onclick = function() { window._yardimToggle(); };
  document.body.appendChild(floatBtn);

  // ── KONTROL ──
  var _acik = false;
  var _sohbet = [];

  window._yardimAc = function() {
    document.getElementById('yardim-panel').classList.remove('kapali');
    floatBtn.innerHTML = '\u2715';
    _acik = true;
    setTimeout(function() { var inp = document.getElementById('yp-input'); if (inp) inp.focus(); }, 300);
  };
  window._yardimKapat = function() {
    document.getElementById('yardim-panel').classList.add('kapali');
    floatBtn.innerHTML = '\u2753<div class="yardim-badge-dot"></div>';
    _acik = false;
  };
  window._yardimToggle = function() { _acik ? window._yardimKapat() : window._yardimAc(); };

  window._yardimTab = function(id, el) {
    var tabs = document.querySelectorAll('.yp-tab');
    var ics = document.querySelectorAll('.yp-tab-ic');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('aktif');
    for (var j = 0; j < ics.length; j++) ics[j].classList.remove('goster');
    el.classList.add('aktif');
    document.getElementById('yp-tab-' + id).classList.add('goster');
  };

  window._yardimHizli = function(el) {
    document.getElementById('yp-input').value = el.textContent;
    window._yardimGonder();
  };

  // ── SİSTEM PROMPT ──
  var SISTEM = 'Sen Ersan End\u00FCstriyel Makine\'nin Ersan MES (Manufacturing Execution System) yapay zeka yard\u0131m asistan\u0131s\u0131n.\n\n'
    + 'G\u00D6REV: Kullan\u0131c\u0131lara ad\u0131m ad\u0131m, pratik yard\u0131m sa\u011Flamak.\n\n'
    + 'ERSAN MES: v7.0, AS9100 Rev.D + ISO 9001:2015\n\n'
    + 'ERSAN END\u00DCSTR\u0130YEL:\n'
    + '- Havac\u0131l\u0131k sekt\u00F6r\u00FC i\u015Fleme par\u00E7alar\u0131 (CNC, ta\u015Flama, kaynak)\n'
    + '- Sertifikasyon: AS9100D\n'
    + '- Tezgahlar: CNC Torna, CNC Freze, Ta\u015Flama, Kaynak\n'
    + '- Malzemeler: Mil (4140/4340), Boru, Lama, Fason operasyonlar\n\n'
    + 'MOD\u00DCLLER:\n'
    + 'SATINALMA (\u00A78.4): PR\u2192ersan_satinalma_pr.html | RFQ\u2192ersan_satinalma_rfq.html | PO\u2192ersan_satinalma_po.html | GRN\u2192ersan_satinalma_grn.html\n'
    + '\u0130\u015E AKI\u015EI: Yeni Talep butonu \u2192 Sipari\u015F kalemi, malzeme, \u00F6l\u00E7\u00FCler, aciliyet \u2192 Kaydet \u2192 RFQ olu\u015Ftur \u2192 Tedarik\u00E7i se\u00E7 \u2192 Teklif kar\u015F\u0131la\u015Ft\u0131r \u2192 Onayla \u2192 PO \u2192 GRN\n\n'
    + 'SATI\u015E (\u00A78.2): Teklif\u2192sipari\u015F\u2192sevkiyat zinciri. CoC otomatik olu\u015Fur.\n\n'
    + '\u00DCRET\u0130M (\u00A78.5.1): WO\u2192ersan_isemirleri.html | \u0130\u015F emri: Yeni WO \u2192 Sipari\u015F ba\u011Fla \u2192 Par\u00E7a/miktar/operasyon \u2192 At\u00F6lye\n'
    + 'Traveller WO\'dan otomatik olu\u015Fur. Her operasyonda imza gerekir.\n\n'
    + 'KAL\u0130TE:\n'
    + '- IQC (\u00A78.4) \u2192 ersan_kalite_iqc.html: Gelen malzeme \u2192 Lot no \u2192 \u00D6l\u00E7\u00FC kontrol \u2192 Kabul/Red/Beklet\n'
    + '- NCR (\u00A78.7) \u2192 ersan_kalite_ncr.html: Yeni NCR \u2192 T\u00FCr se\u00E7 (Malzeme/Boyut/Y\u00FCzey) \u2192 Par\u00E7a/lot \u2192 Karar (\u0130skarta/Tamir/\u0130ade/Devam) \u2192 CAPA gerekiyor mu?\n'
    + '- CAPA (\u00A710.2) \u2192 ersan_kalite_capa.html: 8D: D1 Ekip, D2 Problem, D3 Ge\u00E7ici \u00F6nlem, D4 K\u00F6k neden (5-Why), D5 Kal\u0131c\u0131 aksiyon, D6 Uygula, D7 Do\u011Frula, D8 Kapat\n'
    + '- Kalibrasyon (\u00A77.1.5) \u2192 ersan_kalite_kalibrasyon.html: EQP no \u2192 Tarih \u2192 Sertifika no \u2192 Sonraki tarih\n\n'
    + 'EK\u0130PMAN (\u00A77.1.3): Ar\u0131za bildirimi \u2192 Bak\u0131m teknisyeni atama \u2192 PM plan\u0131\n'
    + 'STOK (\u00A78.5.2): Malzeme kodu ara \u2192 Giri\u015F/\u00C7\u0131k\u0131\u015F/Transfer \u2192 Lot takibi \u2192 Say\u0131m\n'
    + 'DMS (\u00A77.5): Proced\u00FCr ara \u2192 Versiyon kontrol \u2192 Onay ak\u0131\u015F\u0131\n\n'
    + 'KODLAR: NCR-26-XXXXX | CAP-26-XXXXX | PR-26-XXXXX | PO-26-XXXXX | WO-26-XXXXX\n\n'
    + 'CEVAP TARZI:\n'
    + '- K\u0131sa, ad\u0131m ad\u0131m, madde madde\n'
    + '- T\u00FCrk\u00E7e, teknik terimler parantez i\u00E7inde \u0130ngilizce\n'
    + '- Hangi sayfaya gidece\u011Fini belirt\n'
    + '- \u00C7ok uzun olacaksa "Devam m\u0131?" diye sor';

  // ── AI CHAT ──
  window._yardimGonder = async function() {
    var input = document.getElementById('yp-input');
    var metin = input.value.trim();
    if (!metin) return;
    input.value = '';
    input.style.height = 'auto';
    var gonderBtn = document.getElementById('yp-gonder');
    gonderBtn.disabled = true;

    _mesajEkle('kullanici', metin);
    _sohbet.push({role:'user', content:metin});
    document.getElementById('yp-quick').style.display = 'none';

    var yaziyorId = _yaziyorGoster();

    try {
      var res = await fetch('/.netlify/functions/claude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: SISTEM,
          messages: _sohbet.slice(-12)
        })
      });
      var data = await res.json();
      var cevap = (data.content && data.content[0]) ? data.content[0].text : 'Bir hata olu\u015Ftu.';
      _yaziyorKaldir(yaziyorId);
      _mesajEkle('ai', cevap);
      _sohbet.push({role:'assistant', content:cevap});
    } catch(e) {
      _yaziyorKaldir(yaziyorId);
      _mesajEkle('ai', '\u26A0 Ba\u011Flant\u0131 hatas\u0131. \u0130nternet ba\u011Flant\u0131n\u0131z\u0131 kontrol edin veya it@ersanmakine.com.tr ile ileti\u015Fime ge\u00E7in.');
    }
    gonderBtn.disabled = false;
    input.focus();
  };

  function _mesajEkle(tip, metin) {
    var c = document.getElementById('yp-mesajlar');
    var div = document.createElement('div');
    div.className = 'msg' + (tip === 'kullanici' ? ' kullanici' : '');
    var fmt = metin
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n- /g, '<br>\u2022 ')
      .replace(/\n(\d+)\. /g, '<br>$1. ')
      .replace(/\n/g, '<br>');
    var ava = tip === 'ai' ? '\uD83E\uDD16' : (sessionStorage.getItem('kullanici_ava') || 'K');
    div.innerHTML = '<div class="msg-ava ' + (tip === 'ai' ? 'ai' : 'usr') + '">' + ava + '</div>'
      + '<div class="msg-balon ' + (tip === 'ai' ? 'ai' : 'kullanici') + '">' + fmt + '</div>';
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
  }

  function _yaziyorGoster() {
    var c = document.getElementById('yp-mesajlar');
    var div = document.createElement('div');
    div.className = 'msg';
    var id = 'yp-typ-' + Date.now();
    div.id = id;
    div.innerHTML = '<div class="msg-ava ai">\uD83E\uDD16</div><div class="msg-balon ai"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
    return id;
  }

  function _yaziyorKaldir(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  // ── KLAVYE KISAYOLLARI ──
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F1') { e.preventDefault(); window._yardimToggle(); }
    if (e.altKey && !e.ctrlKey) {
      var map = { s:'ersan_satinalma_pr.html', k:'ersan_kalite_ncr.html', u:'ersan_isemirleri.html', h:'ersan_anasayfa.html' };
      var url = map[e.key.toLowerCase()];
      if (url) { e.preventDefault(); location.href = url; }
    }
  });

})();
