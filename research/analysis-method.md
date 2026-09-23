# Saytni qanday tahlil qildik (qayta ishlatish uchun usul)

Oddiy skrinshotlar tez o'tishlarni ushlay olmaydi (agent chaqiruvlari orasida bir necha soniya tanaffus bo'ladi). Ishlagan usul:

## 1. Texnologiyani aniqlash
Brauzer konsolida (DevTools yoki agent `javascript_tool`):
- `window.__THREE__` → Three.js versiyasi.
- `performance.getEntriesByType('resource')` → yuklangan .glb/.ktx2/.mp4 fayllar.
- JS fayllarni `fetch` qilib, regex bilan qidirish: `gsap|ScrollTrigger`, `__r3f|useFrame`, `lenis`, `gl_FragColor`, `EffectComposer`, `howler`, …
- `document.querySelector('meta[name=generator]')`, `html` klasslari (`lenis`).

## 2. Canvas'ni videoga yozish (asosiy usul ⭐)
```js
const c = [...document.querySelectorAll('canvas')].sort((a,b)=>b.width*b.height-a.width*a.height)[0];
const rec = new MediaRecorder(c.captureStream(30), {mimeType:'video/webm;codecs=vp9', videoBitsPerSecond:6e6});
const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
rec.onstop = () => window.__recBlob = new Blob(chunks, {type:'video/webm'});
rec.start(500);  // ... scroll / hold / interaksiya ... keyin rec.stop()
```
- WebGL canvas `preserveDrawingBuffer`siz ham `captureStream` ishlaydi.
- ⚠️ HTML overlay'lar (masalan "TAP HOLD" yozuvi) canvas yozuvida **yo'q** — ularni alohida skrinshot bilan ko'rish kerak.
- Interaksiyani (bosib turish) **bir xil JS chaqiruvida** `setTimeout` bilan boshlash kerak — shunda tanaffus muammo emas.

## 3. Kadr jadvali (contact sheet)
Yozilgan blob'dan `<video>` yaratib, kerakli vaqtlarga `seek` qilib, har kadrni katta `<canvas>` ga to'r shaklida chizish (ustiga vaqt yozuvi), shu canvas'ni ekranga fixed qilib skrinshot olish.
- MediaRecorder webm'da `duration = Infinity` bo'ladi → `currentTime = 1e9` qilib, `timeupdate` kutish.
- Avval 1–2 s qadam bilan umumiy ko'rinish → o'tish topilgach 0.1–0.4 s qadam.

## 4. Interaksiyalarni simulyatsiya qilish
- Doira chizish: `pointerdown` → 80 ta `pointermove` doira bo'ylab → `pointerup` (canvas'ga dispatch).
- Bosib turish: `pointerdown` + har 100 ms `pointermove`, `setTimeout(pointerup, 15000)`.
- ⚠️ Viewport o'lchami (`innerWidth/Height`) skrinshot koordinatalaridan farq qilishi mumkin — markazni `innerWidth/2` dan oling.

## 5. Tuzoqlar
- Zero `sessionStorage['zero:resume']` bilan joyni eslaydi, sahifadan chiqishda qayta yozadi → toza boshlash uchun **yangi tab**.
- Oynani kichraytirish (minimize) animatsiyani to'xtatadi.
- Bo'lim "tsikl" bo'lsa (statistika), keyingi bobga o'tish uchun ko'proq scroll kerak.
