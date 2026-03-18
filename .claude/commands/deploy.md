Aşağıdaki adımları sırayla uygula:

1. Tüm HTML ve JS dosyalarında syntax kontrolü yap:
   ```
   find . -maxdepth 1 -name "*.html" | xargs -I{} node --check {}
   find ./netlify/functions -name "*.js" 2>/dev/null | xargs -I{} node --check {}
   ```
   Herhangi birinde hata varsa DURDUR ve hatayı bildir.

2. Syntax temizse git pull --rebase origin main yap.

3. Rebase başarılıysa git push origin main yap.

4. Her adımın sonucunu kullanıcıya bildir.
