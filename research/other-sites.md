# Boshqa ko'rib chiqilgan saytlar

Foydalanuvchi Awwwards nominees (https://www.awwwards.com/websites/nominees/) dan 3 ta namuna berdi. Afzallik tartibi (foydalanuvchi fikri): **1. Zero** (dizayn + hikoya), **2. Palmo**, 3. Overworld Audio.

## Palmo — https://www.palmo.co.in/ (kokos suvi brendi)
| Qism | Topilgan |
|---|---|
| Framework | **Next.js** (Turbopack chunks) |
| 3D | **Three.js** r185 + **React Three Fiber** + **drei** |
| Animatsiya | **GSAP** (ScrollTrigger) |
| Scroll | **Lenis** (`html.lenis` klassi) |
| Modellar | `model/coconut.glb`, `model/can1.glb` |
| Effektlar | custom shaderlar |
| Shriftlar | Inter, Khand, Patrick Hand (next/font) |
| Loader | palma daraxti silueti to'ladi + foiz |

**Sir:** scroll'da GSAP ScrollTrigger mahsulot modellarini (kokos, banka) aylantiradi va kamerani siljitadi. Klassik "mahsulot scroll-story". Texnik jihatdan Zero'dan soddaroq — yaxshi model + scroll + animatsiya.

## Overworld Audio — https://overworldaudio.com/ (o'yinlar uchun musiqa studiyasi)
| Qism | Topilgan |
|---|---|
| 3D | **Three.js** r184 |
| Animatsiya | **GSAP** |
| Ovoz | **Howler.js** (`window.Howler`) + Web Audio API |
| Effektlar | shaderlar |
| Ehtimol | Vue, Theatre.js belgilari bundle'da (tasdiqlanmagan) |

**Sir:** ovoz markazda — sichqoncha va bosishlarga ovoz javob beradi. Kirish tugmasi bosilmaguncha kontent ochilmaydi, shuning uchun to'liq tahlil qilinmadi.

## Umumiy formula (uchala sayt)
1. Blender'da model → `.glb` (Draco).
2. Three.js / R3F bilan saytga.
3. GSAP ScrollTrigger (yoki o'z virtual scroll'i) bilan scroll'ga bog'lash.
4. Shaderlar + postprocessing bilan "wow".
5. Lenis bilan silliq scroll.
6. Ixtiyoriy: ovoz (Howler).
"Wow"ning ~80% — dizayn, model sifati va animatsiya vaqtlari; texnologiya emas.
