# why.zero.university — texnik tahlil

Sayt resurslari, yuklangan fayllar va (minifikatsiya qilingan) JS bundle'ni o'rganish asosida. Kod so'zma-so'z ko'chirilmagan — texnikalar o'z so'zlarimiz bilan tasvirlangan, skillda qayta yozish uchun.

## Stek
| Qism | Topilgan |
|---|---|
| Render | **Three.js** (r160, WebGL; bundle'da WebGPU belgilari ham bor) — React'siz, "vanilla" |
| Animatsiya | **GSAP** (tweenlar, `power2.out` kabi easing) |
| Postprocessing | EffectComposer uslubidagi pass'lar (bloom, color grade, background pass) |
| Siqish | **Draco** (`draco_decoder.wasm`) — .glb modellar; **KTX2/Basis** — teksturalar va atlaslar |
| Video | Oldindan render qilingan mp4 (`star_animation_720.mp4`, `stage2_background_video-desktop.mp4` — 0.6 s loop) |
| Matn | Deyarli barcha sarlavhalar **canvas ichida** — `texts.ktx2` atlasidan (SEO/accessibility yo'q) |
| Holat | `sessionStorage['zero:resume'] = {stage, audioEnabled, t}` — sahifa yangilanganda o'sha bobdan davom etadi |
| Ovoz | `audioEnabled` flagi bor (ovoz tizimi mavjud) |
| Mobil | Alohida yengil assetlar (`clouds-mobile.ktx2` va h.k.), giroskop (DeviceOrientation) qo'llab-quvvatlanadi |

## Asset ro'yxati (bob bo'yicha lazy-load)
```
ui/        cursors_atlas.webp, xp.webp, zero_icon.jpg
textures/  frost.webp, frost_normal.webp (muz), matcap-hand.webp, matcap-certificate.webp,
           stage2_background2.webp, stage3_background1.webp
models/    loader_hand.glb, fancy_hand_2.glb, human_hand_1.glb, human_hand_2.glb,
           camera_1.glb, camera_2.glb (kamera yo'llari animatsiyasi!),
           stage2_glass-shatter.glb, glass_shards.glb, tunnel_new_new.glb
atlases/   human_hands.ktx2, shards-petals-coins.ktx2, texts.ktx2,
           leather-money-shreds.ktx2, board-certificates.ktx2, clouds.ktx2,
           garden-godrays.ktx2, world.ktx2
origami/   cat.glb (+ ao/cat.webp)
videos/    star_animation_720.mp4, stage2_background_video-desktop.mp4
```
**Saboqlar:**
- Kamera harakatlari **Blender'da animatsiya qilinib** `.glb` sifatida eksport qilingan (`camera_1/2.glb`) — scroll esa shu animatsiyaning vaqtini boshqaradi. Bu murakkab kamera yo'llarini qo'lda kodlashdan ancha oson.
- Ko'p kichik elementlar (barglar, tangalar, parchalar, pul, sertifikatlar) — **sprite atlaslar** (bitta rasmda ko'p element) + instancing.
- Qo'llar **matcap** material bilan (yorug'lik hisoblamasdan chiroyli, tez).
- Assetlar **bob (stage) bo'yicha** yuklanadi — birinchi ekran tez ochilishi uchun (baribir loader uzoq).

## Arxitektura: stage (bob) tizimi
Har bir bob — alohida modul, taxminan shunday interfeys bilan:
```
stage = {
  assets: [...]                 // shu bob uchun kerakli fayllar
  setup(ctx)                    // sahnaga obyektlar qo'shish
  scrub(ctx, progress 0..1)     // scroll progressiga qarab holatni o'rnatish
  update(ctx, time, dt)         // har kadrda (animatsiyalar, suzish)
  resize(ctx, w, h)
  teardown(ctx)                 // xotirani tozalash (dispose)
}
```
`scrub` — scroll'ga bog'langan (deterministik), `update` — vaqtga bog'langan (doimiy harakat). Skillda aynan shu naqshni ishlatamiz.

## ☁️ Bulutlar (stage 4) — to'liq retsept
Haqiqiy volumetrik bulut emas — **tekis sprite'lar**, lekin juda puxta tartiblangan:

1. **Atlas:** bitta 2048×2048 KTX2 rasmda 6 xil bulut surati (har biri o'z to'rtburchagida; o'lcham nisbati ~1.7–2.6:1). Mobil uchun alohida yengil atlas.
2. **Geometriya:** 1×1 tekislik (PlaneGeometry); har bir bulut turi uchun alohida **InstancedMesh** (bitta draw call).
3. **Material:** oddiy ShaderMaterial — atlasdan kerakli to'rtburchakni olish uchun `uv * scale + offset`; har bir instansiyaning o'z **shaffofligi** (instanced attribute `aOpacity`); `transparent: true`, `depthWrite: false`, ikki tomonlama.
4. **Qatlamlar:** ~17 qatlam, kameradan z = −1.5 dan −46 gacha. Yaqin qatlamda 1–3 ta kichik bulut, o'rtada (z ≈ −12…−21) 24–27 ta, uzoqda kamroq lekin juda katta (scale 1.5 → 24). Jami ~250 bulut. Har bir bulutning x/y o'rni qatlam chuqurligiga proporsional tasodifiy (uzoqroq — kengroq tarqaladi), z ga ±1 tasodif, kichik tasodifiy Z-burilish.
5. **Harakat (har kadr):**
   - **Drift**: barcha bulutlar X bo'ylab suzadi; tezlik chuqurlikka teskari proporsional (`1 / (|z|·k + 1)`) → **parallaks**.
   - **Wrap**: X koordinata modul bo'yicha o'raladi — ekrandan chiqqan bulut qarama-qarshi tomondan qaytadi (cheksiz bulutlar).
   - **Bob**: har bulut z bo'ylab sinus bilan sekin tebranadi (o'z fazasi, chastotasi 0.25–0.7, amplitudasi 0.2–0.6).
   - **Scroll tezligi**: scroll progressining silliqlangan tezligi drift tezligiga qo'shiladi — tez scroll → bulutlar tezlashadi.
   - **Kamera o'tishi**: scroll progress (smoothstep) bilan barcha bulutlar z bo'ylab ~30 birlik kameraga yaqinlashadi → "bulutlar orasidan tushish".
6. **Fade qoidalari** (keskin chetlar ko'rinmasligi uchun):
   - Kameraga juda yaqin (z > −2) → shaffoflashadi; juda uzoq (z < −10…−62) → asta paydo bo'ladi.
   - Ekran chetiga yaqinlashganda (frustum chegarasidan ~35% ichkarida) → shaffoflashadi.
   - Bob oxirida (progress > 0.9) → hammasi asta yo'qoladi.
7. **Pastdagi shahar** — 3D emas, katta **tekislikdagi rasm** (`cityImage`), scroll bilan masshtabi o'zgaradi (smoothstep). Keyingi bobda unga **bulut soyalari** tushadi: shahar materialining shaderiga qo'shimcha — bulut atlasidan bitta bulutni takrorlanuvchi (`fract`) UV bilan olib, yorqinligidan "zichlik" hisoblab, rangni qoraytiradi; UV offset vaqt bilan siljiydi → soyalar suzadi. (`fract` chegarasida mip xatosini oldini olish uchun `textureGrad` ishlatilgan.)

**Biz ham qila olamizmi?** Ha — ~150 qator kod. Kerakli narsa: 4–8 ta shaffof PNG bulut surati (bepul manbalar yoki AI generatsiya) → atlasga birlashtirish.

## 🖱️ Sichqoncha parallaksi
Kursor pozitsiyasi (−1…1) → kamera yoki sahna guruhi kichik burchakka buriladi, `lerp` bilan silliq. Natija: fon kursorga teskari ~30px siljiydi, qatlamlar chuqurlikka qarab turlicha. Mobilda giroskop bilan ishlaydi (DeviceOrientation; iOS'da HTTPS va ruxsat kerak).

## O'tish texnikalari (skill uchun retseptlar)
| O'tish | Texnika |
|---|---|
| **Glitch/strobe** (o'rta barmoq) | 2–3 kadr davomida color grade'ni oddiy ↔ qorong'i-kontrast almashtirish; model pozasini keskin almashtirish |
| **Color grade cho'kishi** | Postprocessing'da LUT/rang uniformlarini GSAP bilan tween: yashil-oq → qizil-qora → qora |
| **Zulmatni sindirish** | Qora ekranni qoplovchi "shisha" parchalar (pre-fractured .glb, `glass-shatter`) — qo'l harakati bilan parchalar uchib ketadi, orqadan yangi sahna |
| **Desaturatsiya + morf** | Rang → sepiya/gravyura; hard cut; ikki tekstura orasida crossfade (qo'l ↔ portret); kamera zoom-out |
| **Yonish (burn)** | Shader: shovqin (noise) + threshold → shaffof teshik, chegarada oltin emissive "olov" chizig'i, uchqun zarrachalar |
| **Singan shisha kartochkalar** | `MeshPhysicalMaterial` transmission/iridescence yoki fake refraction; ustiga matn teksturasi |
| **Siqilish → portlash → oq** | Halqa guruhini masshtablash (1 → 0.1 → 3), bloom intensivligini oshirish, 1-kadrlik chaqnashlar, full-screen oq fade |
| **Bulutlar orasidan tushish** | Yuqoridagi bulut tizimi + kamera z o'tishi + pastdagi rasm masshtabi |
| **Muzni teshish** | Frost teksturali tekislik + teshik maskasi (radius tween) + glow chegara |

## Interaksiya mexanikalari
- **Draw a zero**: pointer yo'lini yig'ib, yopiq doiraga o'xshashligini tekshirish (markazdan masofalar dispersiyasi + burchak qamrovi ~360°).
- **TAP HOLD**: pointerdown → progress 0→1 (bir necha soniya), pointerup → orqaga qaytadi; 1 ga yetganda o'tish trigger. (Zero'da progress yetarlicha aniq emas — biz yaxshilaymiz.)
- **XP**: har bir bosqich/harakat uchun +100, burchakda hisoblagich, "+100 XP" yulduz animatsiyasi.
- **Scroll**: virtual (sahifa balandligi = viewport; wheel/touch hodisalari o'zi hisoblanadi) — progress bob ichida 0..1.
- **Hotspot kartochkalar**: 3D nuqtani ekran koordinatasiga proyeksiya → HTML kartochka.
- **Xarita boshqaruvi**: joystik (pan), zoom, aylantirish.

## Optimizatsiya saboqlari
- KTX2 teksturalar (GPU'da siqilgan holda qoladi — xotira kam).
- Draco modellar.
- Instancing (bulutlar, barglar, tangalar, parchalar).
- Atlaslar (kam fayl, kam draw call).
- Bob bo'yicha lazy-load + `teardown`/dispose.
- Og'ir fonlar — video yoki oldindan render qilingan rasm.
- Mobil uchun alohida kichik assetlar.
