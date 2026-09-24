---
name: story-3d-site
description: Build Awwwards-level, scroll-driven 3D STORYTELLING websites — cinematic landing pages where one recurring 3D hero object lives through a short film of chapters (colour-graded worlds, camera moves, press-and-hold gates with cinematic transitions, an interactive opening, a playable finale). Next.js + React Three Fiber + GSAP + Lenis template, Blender-scripted models, headless-Chrome QA. Use this whenever the user wants a "3D website", "storytelling / hikoyali site", "scroll animation site", "immersive landing", "Awwwards-style" or "like why.zero.university / palmo.co.in" page, a cinematic product or brand launch page, an interactive 3D portfolio or campaign microsite — even if they only name a brand or topic and say "make it wow".
---

# story-3d-site

Make a website that feels like a short film the visitor *plays*: they scroll, the
camera moves, one hero object changes form chapter by chapter, and at the turning
points they press-and-hold to break into the next world. The template already does
the hard engineering (scroll engine, gates, transitions, post-processing, HUD, QA);
your job is mostly **story, art direction and assets** — and checking every frame.

Talk to the user in **their** language (the demo copy and UI can be any language,
see `story.lang` / `story.ui`). Show progress visually (screenshots), not in prose.

## What's in this skill

```
template/            working Next.js 16 site — the demo story "Tong" (a coffee brand, Uzbek copy)
scripts/new-site.sh  copy the template into a new project + npm install
scripts/optimize-glb.sh      meshopt-compress a GLB
scripts/blender/     run.sh + model scripts: hand_sculpt.py, hourglass.py, city_kit.py
scripts/qa/          headless-Chrome QA: chapter-shots.js, walkthrough.js, gate-test.js
references/          read the one you need, when you need it (list at the bottom)
```

## Workflow

### 1. Brief (short)
Find out, from the conversation or with a few quick questions:
- **Topic / brand / product** and what the visitor should *do* at the end (CTA).
- **Audience and feeling** (calm, epic, playful, luxurious, angry-then-hopeful…).
- **Language** of the site copy.
- **Existing assets**: logo, colours, photos, 3D models. Don't block on them;
  the template is fully procedural and works with zero assets.

If the user gives almost nothing ("make a site for my coffee shop"), don't
interrogate — propose a story and let them react to it.

### 2. Story treatment → get approval before building
Everything follows from the topic: **story, hero object, palette, style, intro
object, language**. Nothing is copied from the demo by default. Read
`references/storytelling.md` and `references/theming.md`, then write a compact
treatment for the user:

| # | Chapter | What happens (cause → effect) | Hero form | Colour world | Copy lines | Transition out |
|---|---|---|---|---|---|---|

Rules that make or break it (learned from real user feedback):
- **One metaphor, one hero object**, recognisable in the very first frame (coffee →
  a coffee bean, time → a clock-orb, ecology → a seed). An abstract blob with no
  meaning was rejected: "what is this green ball?"
- **Every chapter change must be a consequence** of the previous one, and something
  must be *carried over* — the object, the camera move, or a word ("…there would
  be *T*ime" → "*T*ime for the trip"). A jump with no logical link was the #1
  complaint.
- A strong **opening "wow"** that the visitor does with their hands (intro).
- Two gates, mirror images: the first breaks the dream, the second breaks out
  into the solution.
- The **finale is the product**: something to explore/click, then the CTA.

Show the treatment, adjust, then build.

### 3. Scaffold
```bash
bash <skill>/scripts/new-site.sh <project-dir>
cd <project-dir> && npx next dev --port 3100
```
Next.js 16 has breaking changes — the template's `AGENTS.md` says to read
`node_modules/next/dist/docs/` before touching Next-specific APIs. Everything
3D is plain client code.

### 4. Adapt the template
Start from `story/story.config.ts` — the whole film is data. Field-by-field
reference: `references/config.md`. Then, in order:
1. **Copy** — `lines` per chapter (`*X*` = script swash capital, one per line),
   `brand`, `description`, `cta`, `lang`, `ui` strings, `hotspots`, `stats`.
2. **Hero** — `heroShape` (0 orb, 1 coffee bean) + per-chapter `hero` keys
   (pos, scale, noise, crack, glass, glow, colours). For another object, add a
   silhouette to `three/hero/heroMaterial.ts` `surface()` (see
   `references/scenes-and-effects.md` → Hero) or swap in a GLB.
3. **Colour worlds** — `background`, `backdrop`, `grade` per chapter, from the
   palette you derived in `theming.md`.
4. **Scenes** — reuse, re-dress or replace the 7 scene components
   (`three/scenes/*`). Rename their meaning in comments to match the new story.
5. **Intro object** — what the drawn circle becomes (`components/ui/FrostIntro.tsx`
   SVG: cup for coffee, clock for time…).
6. **Camera + beats** — something should happen every 10–15 % of each chapter.

### 5. Models
Decide which 3D objects the story really needs (usually 1–4). In order of preference:
1. **Procedural in three.js** (shader shapes, lathes, instancing) — cheapest.
2. **Blender, scripted and headless** — `scripts/blender/*.py` are working
   examples (sculpted hands, hourglass, architectural city kit). Adapt one, run
   `scripts/blender/run.sh`, check the preview PNG, compress with
   `scripts/optimize-glb.sh`. Full pipeline and gotchas: `references/models.md`.
3. **User-supplied or downloaded** assets — downloading needs the user's explicit
   permission (say name, source, licence, size first). Prefer CC0.

Look at every model render yourself before wiring it in; iterate on proportions.

### 6. QA — look at every chapter
```bash
cd <skill>/scripts/qa && npm install     # once
node chapter-shots.js <chapterId> <outDir> [steps] [wheelDelta] [gatesToPassFirst] [url]
node walkthrough.js <url> <outDir> 1440 810 && node walkthrough.js <url> <outDir>-m 390 844
node gate-test.js <outDir> <url>
```
Tile the frames (`ffmpeg -pattern_type glob -i 'out/*.jpg' -vf "scale=480:-2,tile=4x4" sheet.jpg`)
and actually read them. Check: hero readable, copy not covering it, no white
glare, gates visible and unskippable, nothing stuck on black after a transition,
mobile framing. Details + performance budget: `references/qa.md`.

### 7. Show, iterate
Open the site for the user (preview / browser pane), point them to the chapters
that changed, and iterate chapter by chapter. Commit after each meaningful step if
the project is a git repo.

## Hard-won rules (don't relearn them)
- **No big white areas or full-white flashes** — they tire the eyes. Light chapters
  use mid-tones; bloom threshold stays high; flashes are tinted and short.
- **Gates must be impossible to miss and impossible to scroll past**: dark glass
  disc with progress ring, readable on any background, keyboard (Space) works.
- **Nothing may ever end on a black screen** — gate transitions must call `jump()`
  while the screen is hidden and reveal the next chapter by themselves.
- Frost-wipe stroke is thin (~9 px) — a fat brush feels crude.
- **3D HTML labels** (drei `<Html>`) go into the fixed `#hotspot-layer` portal and
  mount only while their chapter is active, or they float over other chapters.
- Text lives in HTML (SEO, screen readers); the canvas is decoration.
  Statistics show their sources. `prefers-reduced-motion` and the Motion toggle work.
- Keep the hero where the copy isn't: plan text anchors and hero positions together.
- When the user dislikes a direction, keep what they liked (story logic) and
  change only the disliked part; keep rejected variants as documented alternatives.

## References
| File | Read when |
|---|---|
| `references/storytelling.md` | writing the treatment: arc formula, metaphor, links between chapters, copy rules, example arcs |
| `references/theming.md` | choosing palette, typography, materials, intro object and hero for a topic |
| `references/config.md` | editing `story.config.ts` — every field, gates, transitions, boundaries, beats, intros |
| `references/scenes-and-effects.md` | adapting scenes, the hero shader, the fx library, adding a scene |
| `references/models.md` | making/compressing/loading 3D models (Blender headless, meshopt, gotchas) |
| `references/qa.md` | QA scripts, what to check, performance & accessibility budget |
