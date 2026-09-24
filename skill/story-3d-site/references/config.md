# `story/story.config.ts` — field reference

The whole film is data. Types live in `story/types.ts` (read it for exact shapes).

## Contents
1. Top level
2. Chapter
3. Lines (copy)
4. Hero keys
5. Camera, beats
6. Gates & transitions
7. Boundaries
8. Grade & backdrop
9. Stats, hotspots
10. Intro
11. Particles (alternative visual language)

## 1. Top level

```ts
export const story: StoryConfig = {
  intro: { type: "frost", prompt: "Draw a circle on the glass", hint: "wipe the frost away", xp: 100 },
  brand: "Tong",                 // loader + <title>
  lang: "uz",                    // <html lang>
  heroShape: 1,                  // default hero silhouette: 0 orb, 1 coffee bean
  description: "…",              // <meta description>
  cta: { label: "Buyurtma berish", href: "#order" },   // persistent bottom button
  ui: { loading: "…", skip: "…", pressHold: "…", … },  // interface copy, see lib/ui.ts
  chapters: [ … ],
  hotspots: [ … ],
};
```

## 2. Chapter

| Field | Meaning |
|---|---|
| `id` | DOM id + progress key (`live.progress[id]`) |
| `title` | ruler label + nav aria label (short) |
| `length` | scroll length in viewport heights (2–3.5; finale ~1.4) |
| `scene` | `"intro" \| "dream" \| "fracture" \| "evidence" \| "charge" \| "reveal" \| "finale"` (register new ones in `three/scenes/index.ts` + `SceneName`) |
| `background` | canvas clear colour |
| `backdrop` | procedural sky (§8) |
| `grade` | colour grade (§8) |
| `lines` | HTML copy (§3) |
| `hero` | hero keyframes (§4) |
| `camera` | camera keyframes (§5) |
| `beats` | one-shot events (§5) |
| `gate` | press-and-hold gate at the end (§6) |
| `boundary` | how plain scrolling into the next chapter is hidden (§7) |
| `stats` | numbers on 3D glass (evidence scene) |
| `particles` | particle-language keys (§11, optional) |

## 3. Lines

```ts
{ text: "Hammasi bitta *D*ondan", style: "serif", size: "xxl", at: [0, 0.3], anchor: "center", tag: "h1" }
```
- `*X*` renders X in the script face (swash capital). One per line.
- `style`: `script | serif | sans | mono`; `size`: `xxl | xl | lg | md | sm`.
- `at: [a, b]` — visible window in chapter progress; letters animate in/out.
- `anchor`: `center top bottom left right tl tr bl br` — plan anchors so the copy
  never sits on the hero.
- `tag`: `h1` once per site, `h2` first line of a chapter, else `p`.

## 4. Hero keys

```ts
hero: [
  { at: 0,   pos: [0, 0, 0], scale: 0.55, noise: 0.35, color: "#6fbf92", accent: "#9dffd0", glow: 0.1, spin: 0.25 },
  { at: 0.75, pos: [0, 0.5, 0], scale: 0.8, noise: 0.22, glow: 0.3 },
]
```
Sampled by chapter progress, omitted fields inherit. Fields: `pos`, `scale`
(0 hides it), `noise` (surface life), `crack` (0..1 glowing fissures), `glow`
(>1 blooms), `glass` (0..1 transparent + bright rim), `color`, `accent` (cracks,
rim, halo, burst particles), `spin`, `shape` (overrides `story.heroShape`).
**Continuity:** the last key of a chapter ≈ the first key of the next (or change
it inside a gate transition). Chapters without keys hide the hero.

## 5. Camera, beats

```ts
camera: [{ at: 0, pos: [0, 0, 8.5], look: [0, 0, 0], fov: 32 }, { at: 1, pos: [0, -0.4, 4.8], look: [0, 1.3, -0.5], fov: 40 }],
beats:  [{ at: 0.18, fx: "pulse" }, { at: 0.42, fx: "burst", strength: 0.7 }],
```
Camera keys are damped; the rig adds mouse/gyro parallax and breathing.
Beats fire once when scrolling forward past `at`: `pulse` (hero swells),
`burst` (particle burst from the hero), `flash` (tinted flash), `shake`.

## 6. Gates & transitions

```ts
gate: { type: "hold", at: 0.9, label: "Hold", duration: 1800, transition: "breakToDark", xp: 100 }
```
Scrolling hard-stops at `at` for every unfinished gate (fast scroll can't skip
it). Holding (mouse, touch or Space) for `duration` completes it, awards XP and
plays the transition, which ends *inside* the next chapter.

| Transition | Feel | Typical use |
|---|---|---|
| `breakToDark` | glitch strobe → red-black collapse → a beat of black → darkness shatters into shards revealing the next world | dream → conflict (gate 1) |
| `implodeToLight` | rings implode, double flash, melt into light, next chapter fades up | despair → hope (gate 2) |
| `drainCut` | colour drains to sepia + heavy grain, hard cut on the greyest frame, colour returns | memory, "then vs now" |
| `burnThrough` | the frame chars from the edges and burns through | fire, destruction, roasting |
| `whiteout` / `blackout` | simple fades | fallback, reduced motion |

New transitions go in `story/transitions.ts`; each MUST call `jump()` exactly
once while the screen is fully hidden, and must reveal the next chapter itself
(never leave the visitor on a black screen).

## 7. Boundaries (non-gated scroll between chapters)

`boundary: "black" | "white" | "cut" | "burn" | "drain" | "#hex"` (default black).
Prefer a colour that belongs to both chapters (a cloud's grey `#c3d3d8` for a
continuous fly-through). Gated chapters never get a scroll curtain.

## 8. Grade & backdrop

```ts
grade: { exposure: 0.94, saturation: 1, contrast: 1.02, tint: "#bff5dc", tintAmount: 0.06,
         bloom: 0.55, vignette: 0.35, grain: 0.05, dof: 0.25, dirt: 0.5 },
backdrop: { top: "#c3dcd1", bottom: "#7fa999", accent: "#e4fff3", flow: 0.55, rays: 0.25, stars: 0 },
```
Grades cross-fade between chapters. `dof` focuses on the hero; `dirt` = lens dirt
in highlights. See `theming.md` for palette mapping and eye-comfort limits.
Light chapters also need dark ink in `app/globals.css` (`[data-chapter="N"] .copy`).

## 9. Stats, hotspots

```ts
stats: [{ value: "7 kun", label: "qovurilgandan keyingi eng yaxshi davr", source: { label: "…", href: "…" } }],
hotspots: [{ id: "latte", label: "Latte", position: [0.2, 1.4, -0.6], title: "Latte", body: "…",
             tags: ["Sutli"], cta: { label: "Tanlash", href: "#order" } }],
```
Stats are drawn on flying glass in the evidence scene (HTML keeps an sr-only list
and visible source footnotes). Hotspot positions are in the finale's city group
space; labels are drei `<Html>` portalled into `#hotspot-layer`.

## 10. Intro

`intro.type`:
- `"frost"` (default) — the screen is frosted glass; the visitor wipes it; a drawn
  circle becomes the topic object (SVG in `FrostIntro.tsx`), the hero presses
  against the glass and it shatters. Stroke is thin (`lib/frostMask.ts`, width 9).
- `"draw-circle"` — minimal: draw a circle on an empty screen (Zero's "draw a zero").
- `"notifications"` — swipe away a wall of buzzing notifications (attention /
  screen-time stories).
Every intro has a Skip button (Enter).

## 11. Particles (alternative visual language)

`chapter.particles` keys make ~25k particles morph between shapes
(`icon:clock|hourglass|plane|book|people|sun|phone|bell`, `text:62%`,
`word:Brand`, `dust`, `embers`, `sphere`, `globe`, `core`, `aurora`, `galaxy`).
Mounted only if some chapter uses it. It was tried as the main language of the
demo and the user preferred the hero-object story — offer it as a variant for
iconography-heavy briefs; on light backgrounds use `additive: false` and dark colours.
