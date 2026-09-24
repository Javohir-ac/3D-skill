# QA, performance, accessibility

Look at the site the way a visitor does — frame by frame — before showing it.

## Contents
1. Tools
2. What to check in every chapter
3. Gates & transitions
4. Mobile
5. Performance budget
6. Accessibility & SEO checklist

## 1. Tools (`scripts/qa`, `npm install` once; needs Chrome — set `CHROME=/path` if not `/usr/bin/google-chrome`)

| Script | Does |
|---|---|
| `chapter-shots.js <id> <out> [steps=12] [delta=160] [gates=0] [url]` | skips the intro, passes N gates, scrolls to chapter `id`, one screenshot per wheel step. Use `gates` = number of gates before that chapter. |
| `walkthrough.js <url> <out> [w] [h]` | the whole story: solves the intro with real mouse input, holds every gate, opens a hotspot, screenshots each step |
| `gate-test.js <out> [url]` | for every gate: can fast scrolling skip it? does holding work? what's on screen right after the cinematic without scrolling (catches "stuck on black") |

Tile frames for a quick read:
```bash
ffmpeg -v error -y -pattern_type glob -i 'out/*.jpg' -vf "scale=480:-2,tile=4x4:padding=4" sheet.jpg
```
Then open single frames at full size for details (faces, fingers, text).
Headless Chrome uses the real GPU with `--ignore-gpu-blocklist`; if frames are
black, the dev server may still be compiling — wait and retry.

## 2. Every chapter

- The hero is **readable** (recognisable object, not covered by copy, not clipped).
- Copy windows (`at`) don't overlap; each line readable against its background
  (dark ink on light chapters).
- Something happens every 10–15 % of progress.
- No large white areas / white flashes.
- Models: proportions, orientation (palm/fingers the right way), lighting —
  a lit material in a scene without lights reads as a dark silhouette.
- Chapter → chapter link visible (object/camera/word carried over).
- Labels/HTML overlays appear only in their own chapter.
- Console: no errors (`pageerror` lines from the scripts).

## 3. Gates & transitions

- The gate disc is visible on every background, shows progress, works with
  mouse, touch and Space; fast scrolling cannot pass it.
- After the cinematic the next chapter is on screen **without** further input.
- Reduced motion: transitions shorten, nothing strobes.

## 4. Mobile

Run `walkthrough.js … 390 844`. The camera keeps horizontal 16:9 framing in
portrait (fov compensation) — check the hero and copy don't collide; touch-hold
gates; frost wipe with a finger; hotspot cards fit.

## 5. Performance budget

- Loader < 5 s on a normal connection; total 3D assets ≲ 1.5 MB.
- Draw calls: instancing for repeats (city, clouds, particles); one mesh per
  building *type*, not per building.
- Triangles: organic model ≤ 40k raw / ~17k after simplify; city ≲ 750k total
  (reduce `n`, cell size or window reveals if it stutters).
- Only the active chapter's scene renders (`useChapter` hides the rest).
- Heavy extras (ParticleStory) mount only when used.
- Dev mode (`next dev`) is much slower than `next build && next start` — judge
  smoothness on a production build before optimising.
- If it stutters: lower DOF/bloom first, then particle counts, then city `n`,
  then the device pixel ratio cap in `Experience`.

## 6. Accessibility & SEO

- All copy is HTML (`lines`), with `h1`/`h2` structure; the canvas is decoration.
- Stats: sr-only list + visible sources.
- `prefers-reduced-motion` respected; Motion toggle in the HUD.
- Gates: `aria-label`, keyboard (Space/Enter). Intro: Skip (Enter).
- `<html lang>` = `story.lang`; `<title>`/description from the config.
- Chapter nav lets people jump back to any reached chapter.
