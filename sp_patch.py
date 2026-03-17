import re, os

fname = 'ersan_teklif.html'
if not os.path.exists(fname):
    print("HATA: ersan_teklif.html bulunamadi"); exit()

with open(fname, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Modal basligini degistir
c = c.replace('Satış Emri Oluştur —', 'Sipariş Oluştur —')
c = c.replace('Satış Emirlerini Oluştur', 'Siparişi Oluştur')
print("OK: Modal basligi")

# 2. SP numaralandirma - kalem sirasi ekle, SP No ayri alan yok
old_se_no = """      const seNoStr = 'SE-' + new Date().getFullYear() + '-' + String(lastNum + i + 1).padStart(3,'0');
      const seFields = {
        'SE No': seNoStr,"""

new_se_no = """      // SP-2026-001-01 formatinda numaralandirma (SE No formula ile uretilecek)
      const spNo = 'SP-' + new Date().getFullYear() + '-' + String(lastNum + 1).padStart(3,'0');
      const seFields = {
        'Kalem Sıra': i + 1,"""

if old_se_no in c:
    c = c.replace(old_se_no, new_se_no)
    print("OK: SP numaralandirma")
else:
    # Try alternative pattern
    old2 = "const seNoStr = 'SE-'"
    if old2 in c:
        idx = c.find(old2)
        line_end = c.find('\n', idx)
        print("Found SE No line:", c[idx:line_end])
    print("WARN: SE No pattern bulunamadi")

# 3. PDF Data kalici kayit
old_pdf = """      // Teknik resim varsa ayrıca yükle
      if (window._trFiles && window._trFiles[i]) {
        try {
          const file = window._trFiles[i];
          const b64 = await fileToBase64(file);
          await api('PATCH', TABLES.satisEmirleri, {fields: {'Teknik Resim': [{url: b64, filename: file.name}]}}, res.id);
        } catch(e2) {
          toast(seNoStr + ': Teknik resim kaydedilemedi (SE oluşturuldu)', 'info');
        }
      }"""

new_pdf = """      // PDF Data olarak kalici kaydet
      if (window._trFiles && window._trFiles[i]) {
        try {
          const file = window._trFiles[i];
          const dataUrl = await fileToBase64(file);
          await api('PATCH', TABLES.satisEmirleri, {fields: {
            'PDF Data': JSON.stringify({filename: file.name, data: dataUrl, size: file.size})
          }}, res.id);
        } catch(e2) {
          toast('PDF kaydedilemedi (siparis olusturuldu)', 'info');
        }
      }"""

if old_pdf in c:
    c = c.replace(old_pdf, new_pdf)
    print("OK: PDF Data kayit")
else:
    print("WARN: PDF save pattern bulunamadi")

# 4. Toast mesaji
c = c.replace(
    "toast(seIds.length + ' adet Satış Emri oluşturuldu ✓', 'success');",
    "toast(seciliItems.length + ' kalem sipariş oluşturuldu (' + spNo + ') ✓', 'success');"
)
print("OK: Toast mesaji")

with open(fname, 'w', encoding='utf-8') as f:
    f.write(c)

print("\nBitti! git add . && git commit -m SP-numaralandirma && git push")
