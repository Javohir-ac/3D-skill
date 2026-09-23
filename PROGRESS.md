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

## 📍 Hozirgi holat
Tadqiqot bosqichi **tugadi**. Skill yozish **hali boshlanmagan**.

Foydalanuvchi bilan kelishilgan: skill-creator jarayoni (qoralama → test promptlar → skill bilan/skillsiz solishtirish → foydalanuvchi bahosi → yaxshilash). Vaqt taxmini: birinchi versiya ≈ 2.5–3.5 soat, to'liq ≈ 5–7 soat.

## ⏭️ Keyingi qadamlar
1. [x] Muhim kadrlarni rasm sifatida saqlash → `research/zero-university/frames/` (qarang: `frames/README.md`).
2. [ ] Foydalanuvchidan yakuniy tasdiq: skill nomi (`story-3d-site`?), stek (Next.js + R3F — standart), sinov mavzulari.
3. [ ] Hujjatlarni tekshirish: Three.js, R3F, drei, GSAP, Lenis, postprocessing — joriy versiyalar/API.
4. [ ] `skill/template/` — Next.js + R3F + GSAP + Lenis + postprocessing, stage tizimi; brauzerda ishlashini tekshirish.
5. [ ] Effektlar: bulutlar, parallaks, glitch, color grade o'tishi, singan shisha, burn, siqilish-portlash, TAP HOLD (yaxshilangan), XP, hotspot.
6. [ ] `SKILL.md` + `references/*.md`.
7. [ ] Test promptlar bilan sinov, foydalanuvchi bahosi, iteratsiya.
8. [ ] `~/.claude/skills/` ga o'rnatish (Fedora va Windows).

## 🗒️ Qarorlar va eslatmalar
- Zero'ning kamchiliklarini skillda tuzatamiz: qisqa loader, aniq TAP HOLD progressi, boblar navigatsiyasi, HTML matn (SEO/a11y), reduced-motion, statistikaga manba.
- Maxsus 3D modellar/AI rasmlar tashqaridan keladi — skill buni aniq so'rashi kerak.
- Zero bulutlari = sprite atlas + instancing (volumetrik emas) — oson takrorlanadi.
