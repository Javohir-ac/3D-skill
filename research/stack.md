# Texnologiya tanlovi (skill uchun)

## Tavsiya etilgan asosiy stek
| Texnologiya | Vazifasi | Nega |
|---|---|---|
| **Next.js** (App Router) | Framework | Palmo shunday; SEO uchun HTML matn, oson deploy (Vercel) |
| **React Three Fiber** + **drei** | 3D | Three.js'ni React ichida; drei'da tayyor yordamchilar (useGLTF, Instances, MeshTransmissionMaterial, …) |
| **Three.js** | 3D poydevor | Hamma Awwwards 3D saytlarining asosi |
| **GSAP** + ScrollTrigger | Animatsiya, scroll | Timeline, easing, scrub — sanoat standarti (endi bepul) |
| **Lenis** | Silliq scroll | Awwwards saytlarida deyarli har doim |
| **@react-three/postprocessing** | Bloom, color grade, noise, glitch | Zero'dagi "wow"ning katta qismi |
| **GLSL shaderlar** | Maxsus effektlar | Bulutlar, burn, sindirish, desaturatsiya |
| **Blender** | Modellar, kamera yo'llari | `.glb` + Draco eksport |
| **gltf-transform / KTX2** | Optimizatsiya | Draco + KTX2 siqish |
| Howler.js (ixtiyoriy) | Ovoz | Overworld kabi |

## Alternativalar
- React bilmaydigan holat uchun: **vanilla Three.js + Vite + GSAP** (Zero shunday).
- Kodsiz tez prototip: Spline (cheklangan).
- Kelajak: **WebGPU** (`WebGPURenderer`, TSL) — ixtiyoriy.

## Ochiq qaror
- Next.js + R3F (asosiy) yoki vanilla Three.js + Vite — foydalanuvchi bilan hali yakuniy tasdiqlanmagan (standart: Next.js + R3F).
- Skill nomi taklif: `story-3d-site` — tasdiqlanmagan.
