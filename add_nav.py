"""
Ersan MES — Nav Ekleme + Token Temizleme Scripti
Kullanım: python add_nav.py
Klasörde tüm HTML dosyalarını günceller.
"""
import os, re, glob

TOKEN_PATTERN = r"pati3Jj8YHHdGJWo1\.[a-f0-9]+"
NAV_SCRIPT = '<script src="ersan_nav.js"></script>'

files = glob.glob('*.html')
updated = []

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # 1. Token varsa kaldır
    if re.search(TOKEN_PATTERN, content):
        content = re.sub(TOKEN_PATTERN, 'TOKEN_REMOVED_SEE_NETLIFY_ENV', content)
        changed = True
        print(f"  [TOKEN KALDIRILDI] {fname}")

    # 2. Nav yoksa ekle
    if 'ersan_nav.js' not in content:
        content = content.replace('<body>', f'<body>\n{NAV_SCRIPT}', 1)
        changed = True
        print(f"  [NAV EKLENDİ] {fname}")

    if changed:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        updated.append(fname)
    else:
        print(f"  [ATLANDI - değişiklik yok] {fname}")

print(f"\nToplam {len(updated)} dosya güncellendi.")
print("GitHub'a tüm HTML dosyalarını yükleyin.")
