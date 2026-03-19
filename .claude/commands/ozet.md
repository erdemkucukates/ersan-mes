Proje durumu özeti üret:

1. `git log --oneline -10` çalıştır
2. Aktif HTML dosyalarını say (ersan_*.html + index.html)
3. Son push tarihini bul (`git log --format="%ai" -1`)
4. CLAUDE.md'deki "Bilinen Sorunlar" bölümünden açık görevleri oku
5. Şu formatı yazdır:

```
=== ERSAN MES DURUM RAPORU ===
Son 10 commit: [liste]
Toplam HTML sayfa: [sayı]
Son push: [tarih]
Açık görevler (CLAUDE.md'den): [liste]
================================
```
