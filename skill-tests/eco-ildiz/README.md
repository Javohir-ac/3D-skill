# story-3d-site — template

Scroll-driven, cinematic storytelling site (Next.js 16 · React Three Fiber 9 · drei · postprocessing · GSAP · Lenis · zustand). Works with almost no binary assets (a few meshopt GLBs made by the skill's Blender scripts: hands, hourglass, city kit). Demo story: **"Tong"**, a coffee brand, Uzbek copy — replace it with the brief.

```bash
npm install          # Fedora: NODE_OPTIONS=--dns-result-order=ipv4first npm install
npx next dev --port 3100
```

## Edit one file first: `story/story.config.ts`
The whole film is data:

| Field | What it drives |
|---|---|
| `intro` | opening interaction ("draw a circle"), XP reward |
| `chapters[].scene` | which 3D scene component renders the chapter (`three/scenes/index.ts`) |
| `chapters[].lines` | HTML copy (SEO/a11y), `*X*` = script swash capital, `at:[a,b]` visibility window, `anchor` |
| `chapters[].hero` | keyframes of the ONE recurring hero object (liquid / cracked / glass / light, pos, scale, colours) |
| `chapters[].camera` | camera keyframes (pos / look / fov) — scroll is the playhead |
| `chapters[].beats` | one-shot events while scrolling (`pulse`, `shake`, `flash`, `burst`) — keep one every 10–15 % |
| `chapters[].grade` | colour world: exposure, saturation, contrast, tint, bloom, vignette, grain, dof, lens dirt |
| `chapters[].backdrop` | procedural sky: gradient, aurora flow, god rays, stars |
| `chapters[].gate` | press-and-hold gate + cinematic (`breakToDark`, `implodeToLight`, `drainCut`, `burnThrough`, `whiteout`, `blackout`) |
| `chapters[].boundary` | scroll transition to the next chapter (`black`, `white`, `#hex`, `drain`, `burn`, `cut`) |
| `chapters[].stats` | numbers drawn on 3D glass (evidence scene) + visible sources |
| `hotspots` | finale cards anchored to 3D positions |

## Architecture
```
app/                 layout (fonts: serif + script + sans + mono), page, globals.css
components/          Story (root), Chapters (scroll track + HTML copy), ui/* (Loader, DrawIntro, HoldGate, Hud, Cursor)
lib/                 scroll.ts (Lenis → progress, gates, boundaries, beats, copy), live.ts (per-frame state),
                     store.ts (zustand UI state), keys.ts (keyframe sampling), beats.ts, gyro.ts, math.ts, text.tsx
story/               story.config.ts (THE content), types.ts, transitions.ts (gate cinematics)
three/               Experience (Canvas), Backdrop, CameraDirector, CameraRig (parallax), hero/*, scenes/*, fx/*, postfx/*
```
- **Per-frame values** live in `lib/live.ts` (mutated in `useFrame` / GSAP), never React state.
- **Gates**: `lib/scroll.ts` stops Lenis at `gate.at`; nothing can scroll past an unfinished gate. `completeGate()` plays `story/transitions.ts`, which MUST call `jump()` while the screen is hidden (black / light / covered).
- **Scenes** get `useChapter(props, onFrame)` → root group auto-hidden when off-screen + `p()` progress.

## Effects library (`three/fx`)
`CloudField` · `Particles` · `OrbitRings` · `SegmentedRings` · `GlassShard` (reflective body + glinting edges) · `BurnPlane` (curling, burning paper) · `HandModel` (sculpted hands) · `Hourglass` · `CityGrid` (maquette city, windows light up) · `ScreenShatter` · `ScreenBurn` · `FrostPane` · `LightBeams` · procedural `textures.ts`. Full reference: `../references/scenes-and-effects.md`.

## QA
`../scripts/qa/walkthrough.js <url> <outDir> [w] [h]` — headless Chrome drives the whole story (solves the intro, holds gates, opens a hotspot) and screenshots every step; `gate-test.js` hammers gates with fast scrolling. Run both at 1440×810 and 390×844 before shipping.
