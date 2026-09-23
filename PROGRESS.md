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

## 📍 Hozirgi holat
Shablon (dvigatel) ishlaydi va foydalanuvchi sinovidan o'tmoqda. Foydalanuvchi fikri: "qolganlari oddiy elementlar bilan — yaxshi" (placeholder sahnalar hozircha qabul qilindi). Eslatma foydalanuvchidan: **oq/yorqin joylarni ko'paytirmang — ko'zni charchatadi**; TAP HOLD aniq ko'rinishi va aylanib o'tib bo'lmasligi kerak.

Ishga tushirish: `cd skill/story-3d-site/template && npm install && npx next dev --port 3100`
(Fedora'da npm ENETUNREACH bersa: `NODE_OPTIONS=--dns-result-order=ipv4first npm install`)

## ⏭️ Keyingi qadamlar
1. [x] Muhim kadrlarni rasm sifatida saqlash.
2. [x] Skill nomi (`story-3d-site`) va stek (Next.js + R3F) tasdiqlandi.
3. [x] `skill/story-3d-site/template/` — ishlaydigan shablon.
4. [ ] Foydalanuvchi shablonni sinab bo'lishini kutish / qo'shimcha tuzatishlar.
5. [ ] To'liq walkthrough testi (`tools/` ga `walkthrough.js` + `gate-test.js` ko'chirish) — skill ichida vizual QA uchun.
6. [ ] `SKILL.md` (ish tartibi: brif → ssenariy → shablondan loyiha → sahnalar → sayqal) + `references/*.md` (storytelling, transitions, effects, interactions, design-system, performance, accessibility).
7. [ ] Test promptlar bilan sinov (skill bilan/skillsiz), foydalanuvchi bahosi, iteratsiya.
8. [ ] `~/.claude/skills/story-3d-site/` ga o'rnatish (Fedora va Windows).

## 🗒️ Qarorlar va eslatmalar
- Zero'ning kamchiliklarini skillda tuzatamiz: qisqa loader, aniq TAP HOLD progressi, boblar navigatsiyasi, HTML matn (SEO/a11y), reduced-motion, statistikaga manba.
- Maxsus 3D modellar/AI rasmlar tashqaridan keladi — skill buni aniq so'rashi kerak.
- Zero bulutlari = sprite atlas + instancing (volumetrik emas) — oson takrorlanadi.
