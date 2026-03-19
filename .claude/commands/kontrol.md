Tüm sistemi kontrol et:

1. Tüm .js dosyalarında `node --check` çalıştır (ersan_*.js + netlify/functions/*.js)
2. Hatalı dosyaları listele
3. ersan_config.json geçerli JSON mı kontrol et: `node -e "JSON.parse(require('fs').readFileSync('ersan_config.json','utf8')); console.log('OK')"`
4. CLAUDE.md var mı kontrol et
5. CONTEXT_OZET.md var mı kontrol et
6. ersan_styles.css var mı kontrol et
7. ersan_nav.js var mı kontrol et
8. Raporu şu formatta yazdır:

```
=== SİSTEM KONTROL RAPORU ===
JS Syntax: [OK / X hatalı dosya]
Config JSON: [OK / HATA]
CLAUDE.md: [VAR / YOK]
CONTEXT_OZET.md: [VAR / YOK]
ersan_styles.css: [VAR / YOK]
ersan_nav.js: [VAR / YOK]
==============================
```
