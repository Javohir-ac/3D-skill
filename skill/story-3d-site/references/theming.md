# Theming — everything follows the topic

Nothing in the template is sacred: story, hero, palette, type, materials, intro
object and language are all chosen **from the topic** of the brief. The demo is a
coffee brand; a new brief gets its own world.

## Contents
1. Deriving a theme (worksheet)
2. Palettes by topic (starting points)
3. Mapping a palette onto chapters (background / backdrop / grade / hero)
4. Eye comfort rules
5. Typography
6. Materials & style
7. Intro object
8. Language

## 1. Worksheet

Fill this in for the treatment:

| Question | Coffee example |
|---|---|
| Hero object (one word) | coffee bean |
| Its life / transformation | green bean → picked → roasted (cracks) → cup |
| Raw materials & textures of the world | mountain fog, jute, fire, crema, ceramic |
| 3–5 core colours | green-bean sage, fog mint, ember orange, roast brown, crema cream |
| Light / dark rhythm per chapter | light → airy → **dark fire** → dark → darkest → sky → day |
| Materials | matte bean, porcelain hand, glass, paper, maquette city |
| Intro object (the drawn circle becomes…) | a cup seen from above with latte art |
| Type voice | warm serif + script capitals |
| Site language | Uzbek |

## 2. Palettes by topic (starting points — adjust to the brand)

| Topic | Light chapters | Dark / conflict chapters | Accent | Hero colours |
|---|---|---|---|---|
| Coffee | fog mint `#a9c9bc`, cream `#e9dcc8`, jute `#cdb89a` | roast `#1c0f08`, ember `#ff7a2f` | crema `#c98b55` | green bean `#6fbf92` → roast `#3b1d0e` → roasted `#6a3a1b` |
| Time / productivity | mint sky `#a9c9bc`, cloud `#c3d3d8` | blood `#1a0203`, red `#ff3b2f` | mint `#29d38a` | mint orb `#29d38a` / `#9dffd0` |
| Ecology | moss `#9fb89a`, fog `#c7d3c4` | ash `#1a1612`, fire `#ff5a1f` | leaf `#4fbf6a` | seed brown → sprout green |
| Finance / trust | slate `#aab4c0`, paper `#e3e0d8` | navy `#0b1220`, warning `#ff9f1c` | gold `#d4a94f` | coin gold / glass |
| Tech / dev | graphite `#9aa3ad` | terminal `#07090c`, error `#ff3b5c` | cyan `#3de0ff` | cursor white-cyan |
| Beauty / wellness | blush `#e8cfc8`, sand `#e6d8c6` | plum `#1e0f1a` | rose gold `#d99a86` | pearl / glass |
| Food / fresh | leaf `#b9cf9e`, cream `#efe3cc` | charcoal `#16120e`, chili `#e8452c` | citrus `#f2b33d` | the ingredient |

## 3. Mapping onto chapters

Per chapter in `story.config.ts`:
- `background` — the canvas clear colour (≈ the average of the backdrop).
- `backdrop.top / bottom` — the sky gradient; `accent` — the flowing fog/aurora;
  `rays` (light chapters), `stars` (night chapters), `flow` (0.2–0.5).
- `grade.tint` + `tintAmount` — pulls everything towards the chapter colour
  (0.04–0.08 light, 0.3–0.35 dramatic red/orange); `saturation`, `contrast`,
  `exposure` (0.92–1.0), `bloom` (0.35 light … 1.6 darkest), `vignette`, `grain`, `dirt`.
- `hero[].color / accent` — body colour and the colour of cracks/rim/halo.
- `boundary` — use the colour that *belongs to both* chapters (inside of a cloud
  `#c3d3d8`, smoke, ember) instead of black when the shot is continuous.

**Dark ink on light chapters:** the copy colour is switched in `app/globals.css`
by chapter index — add every light chapter's index to the
`[data-chapter="…"] .copy` selector, or white text vanishes on a light sky.

## 4. Eye comfort

The user explicitly complained: "too much white, my eyes hurt".
- Light chapters are **mid-tone**, never `#fff` backgrounds; keep L* ≲ 80.
- No full-white flashes; `flash` beats are tinted and short; `whiteout` only
  for a single, earned moment.
- Bloom threshold stays high (0.85 in `PostFX`) so only real highlights glow.
- Clouds are grey-toned, not paper white.

## 5. Typography

`app/layout.tsx` loads four families via `next/font/google`: display **serif**
(Instrument Serif), **script** for swash capitals (Pinyon Script), **sans**
(Inter) for UI/brand word, **mono** (JetBrains Mono) for captions.
Swap per topic (e.g. tech → a grotesk + mono; luxury → a high-contrast serif).
Check that the chosen fonts cover the site's language (subsets: `latin-ext`
for Uzbek/Turkish/Polish diacritics; Cyrillic needs `cyrillic`).
Uzbek: use `o‘ g‘` (U+2018) — it is in every Latin font; `ʻ` (U+02BB) often isn't.

## 6. Materials & style

- **Premium sculpture** (default for organic objects): lit physical material,
  soft sheen on rims, light clearcoat (`HandModel look="sculpt"`). Users rejected
  blobby "clay sausage" models — anatomy and detail matter.
- **Matcap clay**: flat stylised look, no lights needed (`look="matcap"`).
- **Glass**: reflective body + glinting cut edges (`GlassShard`); real
  transmission turns black on dark scenes.
- **Paper**: bowed, curling, burning (`BurnPlane`).
- **Architectural maquette**: modelled window recesses, mid-grey plaster
  (`CityGrid`) — windows can light up at night (`lit`).

## 7. Intro object

The frost intro asks the visitor to draw a circle; the circle then **becomes the
topic's object** as an SVG (`components/ui/FrostIntro.tsx`, class `frost-cup`):
cup with latte art (coffee), clock face (time), planet (space), lens (camera),
coin (finance), plate (food), seed cross-section (ecology). Keep it line-art,
drawn in sequence (CSS keyframes), then the glass shatters.

## 8. Language

- `story.lang` → `<html lang>`; `story.ui` → every interface string (loader,
  gates, HUD, cursor, skip, a11y labels). Defaults are English (`lib/ui.ts`).
- Gate `label` is shown uppercase inside the disc — keep it short
  ("Hold", "Bosib tur").
