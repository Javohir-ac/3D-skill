# PROGRESS — ish jurnali

> **Yangi agent uchun:** avval shu faylni to'liq o'qing. Keyin `README.md` (tuzilish) va `research/` papkasi. Oxirgi yozuv — eng yangi holat.

## 🎯 Maqsad
Claude Code uchun skill: **Awwwards darajasidagi hikoyali (storytelling) 3D veb-saytlar** yasash. Asosiy namuna — **why.zero.university** (foydalanuvchiga eng yoqqani: dizayn + hikoya), ikkinchisi — **palmo.co.in**.

## 👤 Foydalanuvchi haqida (muhim)
- O'zbek tilida gaplashadi — javoblar o'zbekcha.
- Ikki qurilmada ishlaydi: **Fedora** (Linux) va **Windows** — ikkalasida alohida Claude agent. Shu repo — umumiy xotira. **Har muhim qadamdan keyin shu faylni yangilab, commit + push qiling.**
- Tahlilda **hech bir lahzani o'tkazib yubormaslik** muhim (kadrma-kadr). Tez skrinshotlar yetmaydi — `research/analysis-method.md` dagi video usulini ishlating.
- Saytlarning kodini so'zma-so'z ko'chirish shart emas — texnikani o'z so'zimiz bilan tasvirlaymiz.
- Repo joyi Fedora'da: `~/3D-skill` (foydalanuvchi tasdiqlagan). GitHub: https://github.com/Javohir-ac/3D-skill (public).

## ✅ Qilingan ishlar
| Sana | Ish |
|---|---|
| 2026-09-23 | Awwwards nominees'dan 3 sayt texnologiyasi aniqlandi (Palmo, Zero, Overworld) → `research/other-sites.md` |
| 2026-09-23 | Stek tavsiyasi → `research/stack.md` |
| 2026-09-23 | **Zero to'liq tahlil qilindi** (boshidan oxirigacha, ikkala TAP HOLD kadrma-kadr, qo'l→dollar o'tishi, parallaks, bulutlar kodi) → `research/zero-university/story-analysis.md`, `tech-analysis.md`, `review.md` |
| 2026-09-23 | Tahlil usuli hujjatlashtirildi → `research/analysis-method.md` |
| 2026-09-23 | Skill rejasi → `skill/PLAN.md` |
| 2026-09-23 | GitHub repo ulandi, birinchi push |
| 2026-09-23 | **Zero to'liq videoga yozildi** (headless Chrome + puppeteer, haqiqiy GPU): `research/zero-university/video/zero-960.mp4` (348 s) + `marks.json`; 228 skrinshot (`frames/shots/`), kadr jadvallari (`frames/sheets/`: umumiy + 4 ta asosiy o'tish kadrma-kadr). Yozuvchi skript → `tools/site-recorder/` |
| 2026-09-23 | Yangi detallar tahlilga qo'shildi: qo'l → gips haykal → Franklin (bitiruvchi shapkada); 1-hold o'tishi haqiqiy sichqoncha bilan ~1.2 s da boshlanadi |
| 2026-09-23 | Qaror: skill nomi **`story-3d-site`**, stek **Next.js 16 + R3F 9 + drei 10 + postprocessing + GSAP + Lenis + zustand** (foydalanuvchi: "nima texnologiya kerak bo'lsa foydalanaver") |
| 2026-09-23 | **Shablon yozildi**: `skill/story-3d-site/template/` — 7 bobli demo hikoya, scroll dvigateli (Lenis), gate/TAP HOLD tizimi, 4 ta kinematik o'tish, color-grade postFX, effektlar kutubxonasi (bulutlar, zarrachalar, halqalar, ekran sinishi, shisha, yonish, nur ustunlari, shahar), HUD (progress, XP, boblar navigatsiyasi, CTA, motion toggle, hotspot kartochka), loader |
| 2026-09-23 | Foydalanuvchi sinovi bo'yicha tuzatishlar: (1) gate'da cheksiz rekursiya (Maximum call stack) → re-entry guard; (2) scroll bilan gate'ni aylanib o'tish → barcha tugallanmagan gate'lar bo'yicha "qattiq devor"; (3) TAP HOLD ko'rinmas edi (oq fonda oq) → qorong'i shisha disk, progress halqa, ripple, "Press & hold / Space" ishorasi, fon xiralashadi; (4) **oq juda ko'p, ko'zni og'ritadi** → och boblar o'rta tonlarga, bloom threshold 0.85, oq chaqnashlar o'rniga yumshoq yalpiz rang, bulutlar kulrangroq. Test: headless Chrome (`gate-test.js`) — gate'ni o'tib bo'lmaydi, hold ishlaydi, xatolar yo'q |
| 2026-09-23 | Foydalanuvchi so'rovi: "Zero darajasiga 3D modelsiz nima yetishmaydi — hammasini bajar, tugagach xabar ber". **Ovoz — kerak emas** (keyin kerak bo'lsa qo'shiladi). 3 bosqich bajarildi ↓ |
| 2026-09-23 | **1-bosqich**: davomli qahramon obyekt (bitta shader: suyuq/yorilgan/shisha/nur, bob bo'yicha keyframe), kamera rejissyori (keyframe + "nafas" + shake), beat'lar (pulse/shake/flash/burst), harfma-harf tipografiya (script bosh harf "yoziladi"), kalendar teksturasi |
| 2026-09-23 | **2-bosqich**: "Draw a circle" kirish (doira tanish), maxsus kursor + magnit tugmalar, har bobga shader fon (gradient/aurora/god rays/yulduzlar), yangi o'tishlar: `drain` (sepiya+grain), `burn` (ekran kuyadi), gate'lar uchun `drainCut`, `burnThrough` |
| 2026-09-23 | **3-bosqich**: DOF (qahramonga fokus), linza iflosligi, radial rang siljishi, statistika 3D shisha ustida (+ SR ro'yxat, ko'rinadigan manbalar), barabanli loader, telefon giroskopi, hotspot'lar fixed qatlamda (oldin body'da scroll bo'lib ketardi), tik ekranda gorizontal kadrni saqlash |
| 2026-09-23 | QA: walkthrough 1440×810 va 390×844 — kirish, 2 gate, final kartochka ishlaydi, konsol toza. `skill/story-3d-site/template/README.md` yozildi |
| 2026-09-23 | Foydalanuvchi: Zero bilan solishtirganda **kirish "wow" emas** va **1→2 bob o'rtasida mantiqiy bog'liqlik yo'q**. Zero'ni nusxalash shart emas — o'z uslubimiz. Sinovdan o'tgan g'oyalar: (a) **zarrachalar tili** (26k zarracha shakldan shaklga oqadi) + **bildirishnomalar devori** kirishi — foydalanuvchiga **yoqmadi** ("oldingi mavzu yaxshi edi"); (b) **muz (frost) kirishi** — **tanlandi** |
| 2026-09-23 | Yakuniy holat: 3-bosqichdagi hikoya (qahramon shar, bulutlar, yorilish, shisha, halqalar, shahar) tiklandi + **frost kirish**: ekran muzli shisha, chizish muzni artadi (ingichka ~10px chiziq — foydalanuvchi qalin chiziqni yoqtirmadi), doira → soat siferblati (strelkalar aylanadi), qahramon shishaga bosiladi → shisha sinib uchadi. Zarrachalar tizimi (`three/particles/`) va bildirishnomalar devori (`components/ui/NotificationWall.tsx`) **muqobil variant** sifatida kutubxonada qoldi |
| 2026-09-23 | **1→2 bob uzluksiz kadr**: shar ("Time") ko'tariladi, kamera unga ergashib bulutlar ichidan o'tadi (chegara = bulut ichining kulrang rangi `#c3d3d8`), 2-bob o'sha osmonda o'sha shar bilan boshlanadi; matn ko'prigi "there would be *T*ime" → "*T*ime for the trip". Qoida (skill uchun): **har bob o'tishida sabab → oqibat ko'rinsin; obyekt / kamera / so'z keyingi bobga "olib o'tilsin"** |
| 2026-09-23 | **3D modellar (o'zimiz yasadik, Blender 5.2 headless skriptlari `tools/models/`, gltf-transform meshopt bilan siqilgan, ~20–70 KB)**: (1) **qo'llar** `hand.py` — metaball "loy" qo'l, 4 poza (reach/open/point/fist), matcap material; 2-bobda inson qo'li sharga cho'ziladi (Mikelanjelo), 3-bobda qizil qo'l yorilgan sharga yetolmaydi; (2) **qum soati** `hourglass.py` — shisha + yong'oq ramka, qum three.js'da animatsiya (shader clip), 1-bobda "there would be *T*ime" satrida paydo bo'ladi, qum tusha boshlaydi; (3) **kalendar varag'i** — BurnPlane endi haqiqiy qog'oz (egilish, issiqdan burchak qayrilishi, tebranish, orqa tomoni bo'sh); (4) **shisha siniqlari** — transmission o'rniga aks ettiruvchi tana + yaltiroq qirralar (qorong'i fonda qora bo'lib qolmaydi); (5) **shahar to'plami** `city_kit.py` — minora/ofis/uy/dumaloq minora/daraxt, InstancedMesh; derazalar shaderda chiziladi: reveal'da kunduz (o'chiq), finalda tun — derazalar scroll bo'yicha birin-ketin yonadi ("har bir chiroq — qaytarib olingan soat"). Tuzatish: hotspot yorliqlari faqat final bobda ko'rinadi. QA rasmlari `tools/models/qa_*.jpg`, `preview_*.png` |
| 2026-09-24 | Foydalanuvchi: "qo'l va shahar real chiqmagan" → tanlov: **Blender'da qaytadan, "premium haykal" uslubi**. (1) **Qo'l v2** `tools/models/hand_sculpt.py`: anatomik primitivlar (kvadratroq kaft, oval kesimli falangalar, bo'g'im do'mboqlari, yostiqchalar, thenar/hypothenar, metakarp chiziqlari, bilak, tirnoqlar) → voxel remesh bilan birlashtirish → silliqlash; 4 poza, ~75 KB; saytda chinni/gips material (sheen + clearcoat, sahna yorug'ligiga ta'sirchan). (2) **Shahar v2** `tools/models/city_kit.py`: me'moriy maket — deraza o'yiqlari haqiqiy geometriya, 8 tur (art-deko minora, shisha minora, dumaloq, ofis, balkonli turar-joy, uy, **soat minorasi** markaziy maydonda, daraxt); derazalar vertex rang orqali tunda yonadi; kamera pastroq burchakda |

## 📍 Hozirgi holat
Shablon: 3-bosqich hikoyasi + frost kirish. Foydalanuvchi ko'rib chiqmoqda.
3D modellar bosqichi **tugadi** (qo'llar, qum soati, qog'oz kalendar, shisha siniqlari, shahar). **Keyingi katta qadam:** `SKILL.md` + `references/` yozish.
Eslatmalar: oq/yorqin joylarni ko'paytirmang; TAP HOLD aylanib o'tilmasin; ovoz hozircha yo'q; frost chizig'i ingichka bo'lsin; har bob o'tishida mantiqiy bog'liqlik bo'lsin (sabab → oqibat).

Ishga tushirish: `cd skill/story-3d-site/template && npm install && npx next dev --port 3100`
(Fedora'da npm ENETUNREACH bersa: `NODE_OPTIONS=--dns-result-order=ipv4first npm install`)
Vizual QA: `tools/site-recorder/walkthrough.js http://localhost:3100 ./qa [w] [h]` (puppeteer-core kerak; Windows'da Chrome yo'lini `CHROME` env bilan bering). Testlar frost / draw-circle / notifications kirishlarini avtomatik yechadi.

## ⏭️ Keyingi qadamlar
1. [x] Muhim kadrlarni rasm sifatida saqlash.
2. [x] Skill nomi (`story-3d-site`) va stek (Next.js + R3F) tasdiqlandi.
3. [x] `skill/story-3d-site/template/` — ishlaydigan shablon.
4. [x] "Zero darajasi" yaxshilanishlari (3 bosqich) — bajarildi.
5. [x] Walkthrough + gate testlari `tools/site-recorder/` da.
5b. [x] Kirish "wow" + boblar mantiqi → frost kirish (tanlandi); zarrachalar/bildirishnomalar → muqobil variantlar.
5c. [x] **3D modellar**: kerakli modellarni topish (CC0: Poly Haven, Kenney, Quaternius va h.k. — yuklab olishdan oldin foydalanuvchi ruxsati) yoki yasash (Blender skript / three.js prosedural), sinab ko'rish, shablonga ulash.
6. [ ] `SKILL.md` (ish tartibi: brif → ssenariy → shablondan loyiha → sahnalar → sayqal) + `references/*.md` (storytelling, transitions, effects, interactions, design-system, performance, accessibility).
7. [ ] Test promptlar bilan sinov (skill bilan/skillsiz), foydalanuvchi bahosi, iteratsiya.
8. [ ] `~/.claude/skills/story-3d-site/` ga o'rnatish (Fedora va Windows).

## 🗒️ Qarorlar va eslatmalar
- Zero'ning kamchiliklarini skillda tuzatamiz: qisqa loader, aniq TAP HOLD progressi, boblar navigatsiyasi, HTML matn (SEO/a11y), reduced-motion, statistikaga manba.
- Maxsus 3D modellar/AI rasmlar tashqaridan keladi — skill buni aniq so'rashi kerak.
- Zero bulutlari = sprite atlas + instancing (volumetrik emas) — oson takrorlanadi.
