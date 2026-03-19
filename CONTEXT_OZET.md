# Ersan MES — Hızlı Özet

**Ne:** AS9100 uyumlu üretim yönetim sistemi
**Stack:** Airtable + Netlify + Vanilla HTML/JS
**Repo:** github.com/erdemkucukates/ersan-mes
**Canlı:** https://ersan-mes.netlify.app

## Aktif modüller
Teklif → Sipariş → Satınalma → Ön Kabul →
Girdi Kalite → İş Emirleri → Planlama → Atölye →
Kalite → NCR → Sevkiyat → CAPA → Stok → Mikro

## Kritik kurallar (asla unutma)
1. IE No, Sıra No, Teklif No = autoNumber → YAZMA
2. Token HTML'e = YASAK → sadece Netlify Functions
3. Airtable linked record = [{id: "recXXX"}] formatı
4. Push öncesi: git pull --rebase origin main
5. Syntax kontrol: node --check dosya.js

## Tablo ID'leri
→ ersan_config.json'dan oku

## Bilinen hatalar
→ CLAUDE.md "## Öğrenilen Dersler" bölümüne bak

## Dosya yapısı
/                    → HTML sayfaları
/netlify/functions/  → API proxy'leri
/ersan_styles.css    → Yeni açık tema CSS
/ersan_nav.js        → Gruplu navigasyon
/ersan_log.js        → Merkezi log helper
/ersan_config.json   → Tablo ID'leri + config
/.claude/            → Settings + komutlar
