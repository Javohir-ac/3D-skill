# site-recorder

3D saytni boshidan oxirigacha avtomatik o'tib, **videoga yozadigan** va **skrinshot oladigan** skript. Tahlilda hech bir lahza tushib qolmasligi uchun.

## O'rnatish
```bash
cd tools/site-recorder
npm init -y && npm i puppeteer-core
```
Tizimda Google Chrome (Linux: `/usr/bin/google-chrome`; Windows'da `executablePath` ni o'zgartiring, masalan `C:\Program Files\Google\Chrome\Application\chrome.exe`) va ffmpeg bo'lishi kerak.

## Ishlatish
```bash
node record-zero.js ./out
```
Natija: `out/zero.webm` (canvas video), `out/marks.json` (hodisalar vaqti), `out/shots/*.jpg`.

## Keyin ffmpeg bilan
```bash
# ixcham mp4
ffmpeg -i out/zero.webm -c:v libx264 -crf 30 -vf "scale=960:-2,fps=30" -an zero-960.mp4
# umumiy kadr jadvali (har 3 s)
ffmpeg -i zero-960.mp4 -vf "drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7,fps=1/3,scale=400:-2,tile=5x4" overview_%02d.jpg
# o'tish detallari (20–29.6 s, 5 fps, absolyut vaqt bilan)
ffmpeg -copyts -ss 20 -to 29.6 -i zero-960.mp4 -vf "drawtext=text='%{pts\:flt}':x=6:y=6:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.7,fps=5,scale=400:-2,tile=6x4" hold1_%02d.jpg
```

## Boshqa saytga moslash
`record-zero.js` Zero'ga xos qismlari: "DRAW A ZERO" kutish, doira chizish, "TAP HOLD" aniqlash, `sessionStorage['zero:resume']`. Boshqa sayt uchun shu qismlarni o'zgartiring; video yozish, skrinshot va blob'ni diskka saqlash qismlari universal.

## Nega shunday
- Agent (Claude) brauzer vositalari chaqiruvlari orasida soniyalar o'tadi → tez o'tishlar tushib qoladi.
- Brauzer ochiq saytdan lokal serverga ma'lumot yuborishni bloklaydi (Local Network Access) → shuning uchun Chrome'ni to'g'ridan-to'g'ri Node'dan boshqaramiz va blob'ni `page.evaluate` orqali olamiz.
- Headless Chrome haqiqiy GPU'ni ishlatadi (`--ignore-gpu-blocklist`) — WebGL to'liq tezlikda.
