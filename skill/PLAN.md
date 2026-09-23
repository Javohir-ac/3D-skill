# Skill rejasi

## Joylashuv
Tayyor bo'lgach: `~/.claude/skills/story-3d-site/` (global — har qanday papkada ishlaydi). Ishlab chiqish shu reponing `skill/` papkasida, keyin ko'chiriladi (yoki symlink).

## Tuzilish
```
story-3d-site/
├── SKILL.md                 ← ish tartibi (5 bosqich), description (triggerlar)
├── references/
│   ├── storytelling.md      ← 10 bosqichli hikoya formulasi, burilish nuqtasi, rang-bob, metafora, matn qoidalari
│   ├── transitions.md       ← glitch, zulmatni sindirish, desaturatsiya+morf, siqilish-portlash, bulutlardan tushish (kod bilan)
│   ├── effects.md           ← bulutlar, parallaks, singan shisha, burn, zarrachalar, bloom/color grade
│   ├── interactions.md      ← draw-to-unlock, yaxshilangan TAP HOLD, XP, hotspot kartochkalar
│   ├── design-system.md     ← ranglar, script+serif tipografiya, kompozitsiya (diagonal matn), UI (progress, XP, CTA)
│   ├── performance.md       ← KTX2/Draco, instancing, atlaslar, lazy-load, mobil, loader < 5 s
│   └── accessibility.md     ← HTML matn (SEO), reduced-motion, klaviatura, manbalar
├── template/                ← Next.js + R3F + drei + GSAP + Lenis + postprocessing, stage tizimi
└── scripts/
    └── optimize-assets.sh   ← gltf-transform (Draco, KTX2)
```

## SKILL.md ish tartibi
1. **Brif** — mavzu, auditoriya, his-tuyg'u, mavjud materiallar (logo, rasm, model).
2. **Ssenariy** — boblar, har biriga rang + metafora + o'tish; foydalanuvchiga ko'rsatib tasdiq olish.
3. **Asos** — shablondan loyiha, stage tizimi.
4. **Sahnalar** — bob-bob, har bobdan keyin brauzerda ko'rsatish.
5. **Sayqal** — loader, mobil, tezlik, accessibility.

Kerakli maxsus model/rasm bo'lsa — aniq aytadi ("bu yerga shunday .glb kerak" / AI rasm prompti taklif qiladi).

## Stage (bob) interfeysi — Zero'dan olingan naqsh
`assets`, `setup`, `scrub(progress)`, `update(time, dt)`, `resize`, `teardown`.

## Sinov rejasi (skill-creator jarayoni)
Test promptlar (taklif): "kofe brendi uchun hikoyali 3D sayt", "dasturchi portfoliosi", "ekologiya haqida ijtimoiy loyiha". Skill bilan / skillsiz solishtirish, foydalanuvchi baholaydi, iteratsiya.

## Vaqt taxmini
Birinchi versiya ≈ 2.5–3.5 soat; sinovlar bilan to'liq ≈ 5–7 soat.

## Kirish (intro) variantlari — skill brifga qarab tanlaydi
| `intro.type` | Qachon | Holat |
|---|---|---|
| `frost` | universal, "oyna/vaqt/tuman" metaforasi; eng kuchli birinchi taassurot | ✅ demo'da tanlangan |
| `notifications` | e'tibor / ekran vaqti / shovqin haqidagi hikoyalar | muqobil (foydalanuvchiga demo sifatida yoqmadi) |
| `draw-circle` | minimal, brend shakli doira bo'lsa (Zero "draw a zero") | muqobil |

## Vizual til variantlari
- **Qahramon obyekt** (`three/hero`) — bitta shader obyekt butun hikoya bo'ylab shakl o'zgartiradi. ✅ demo
- **Zarrachalar tili** (`three/particles`, `chapter.particles`) — 26k zarracha belgi/matn/3D shakllar orasida oqadi. Muqobil: mahsulot ikonografiyaga boy bo'lsa yaxshi; och fonlarda to'q "siyoh" zarrachalar (additive: false) kerak.
- Saboq: foydalanuvchi uchun **hikoya mazmuni va mantig'i** uslubdan muhimroq — yangi uslub sinalganda eski hikoyani saqlab qolish kerak.
