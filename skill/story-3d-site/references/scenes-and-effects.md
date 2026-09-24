# Scenes, hero and effects

## Contents
1. How a scene works
2. The 7 scenes (what they show, how to re-dress them)
3. The hero (shader) — adding a new silhouette
4. fx library
5. Global layers & post-processing
6. Adding a new scene

## 1. How a scene works

```tsx
export default function MyScene(props: SceneProps) {
  const thing = useRef<Group>(null);
  const { root, p } = useChapter(props, (p, dt, t) => {   // runs only while visible
    thing.current!.position.y = smoothstep(0.1, 0.6, p) * 2;
  });
  return <group ref={root}> … </group>;                    // root auto-hidden off-chapter
}
```
- `p` / `p()` = this chapter's scroll progress 0..1. Drive everything from it
  (scroll is the playhead), plus `t` for idle life.
- Per-frame shared state is in `lib/live.ts` (`live.hero.pos/scale`, `live.fx.*`,
  `live.progress`, `live.active`) — mutate it, never React state, in frames.
- Anything loaded with `useGLTF` must sit inside `<Suspense fallback={null}>`.
- drei `<Html>` must use `portal={{ current: document.getElementById("hotspot-layer") }}`
  and mount only while `useStory(s => s.active === props.index)`.

## 2. The 7 scenes

| Scene | Demo (coffee) | Contents | Re-dress by… |
|---|---|---|---|
| `intro` | green bean ripening at 1800 m | `OrbitRings`, rising dust, `Hourglass` appears on the 4th line with sand starting to fall, `CloudField` at the end (continuous shot into the next chapter) | swapping the hourglass for the topic's "time/origin" prop; ring colour |
| `dream` | hand-picking in the clouds | `CloudField` sky, petals (`color` = blossom), sculpted `HandModel pose="reach"` slides in and stops a breath from the hero (Michelangelo) | the reaching object (hand, tool, animal…), petal colour/kind |
| `fracture` | roasting: first crack | `LightBeams`, orbiting `GlassShard` flakes (chaff) drifting out, rising embers; hero keys set `crack: 1` | shard tint (glass / chaff / ice), beam colour, ember colour |
| `evidence` | numbers + shelf calendar burns | stats on flying `GlassShard` slabs (`makeStatTexture`), `BurnPlane` paper calendar that bows, curls and burns (`makeCalendarTexture({title, days})`) | calendar title/days, or any texture on the `BurnPlane` (a receipt, a letter, a photo) |
| `charge` | "that's why we made Tong" | dust + `SegmentedRings` device around a tiny glowing hero; gate 2 drives `live.fx.charge` (implode → explode) | ring colour |
| `reveal` | fall through clouds onto the city | `CloudField` dive, day-lit `CityGrid` approaching from below | the "world" of the product (city, landscape, product close-up) |
| `finale` | choose your cup | `PresentationControls` (drag to look), `CityGrid`, `SegmentedRings` halo, hotspot labels → HTML cards | the world + hotspots = the product's options |

## 3. The hero (shader)

`three/hero/Hero.tsx` + `heroMaterial.ts`: one mesh (icosphere) + halo sprite +
burst particles; uniforms `uNoise uCrack uGlow uGlass uShape uColor uAccent`
come from the chapter's hero keys (damped).

Silhouettes are built in the vertex shader function `surface(p)` (p = point on the
unit sphere). `uShape` walks a chain of shapes: 0 → 1 mixes the orb
(`p + n * noise`) into the **coffee bean** (squashed ellipsoid, flat face, S groove,
`vGroove` darkening), 1 → 2 mixes into the **acorn** (tapered nut with a point,
small overhanging scaly cap `vCap`, stem). Shapes ≥ 1.5 count as "upright":
`Hero.tsx` stops the tumbling spin and only sways them, so the silhouette stays
readable. To add a new object:
1. Write its shape as a function of `p` (e.g. seed: `p * vec3(0.6, 1.0, 0.6)` with a
   pointed tip `b.y += smoothstep(0.6, 1.0, p.y) * 0.3`; drop: taper the top;
   coin: `p * vec3(1, 1, 0.12)` with a rim). Keep details small: a cap/feature
   covering 40 % of the sphere reads as a different object.
2. Append it to the chain in `surface()` (`s3 = clamp(uShape - 2.0, 0.0, 1.0)`,
   `mix(previous, myShape, s3)`) and document its number in `types.ts`. Normals are recomputed from `surface()`
   samples, so lighting stays correct.
3. Darken grooves via a varying (see `vGroove`).
Cracks (`voronoiEdge`) and glass/rim work on any silhouette.

For objects a shader can't express (a cup, a shoe, a product), load a GLB in
place of the mesh and keep the halo/burst; drive its material from the same
`cur` values (crack → emissive map, glass → transmission/opacity).

## 4. fx library (`three/fx`)

| Component | Props (main) | Notes |
|---|---|---|
| `CloudField` | `dive()`, `opacity()`, `color`, `speed`, `depth`, `seed` | instanced sprite clouds (Zero's technique), camera dives through |
| `Particles` | `kind: petal \| dot`, `count`, `color`, `area`, `size`, `lift`, `sway`, `spin`, `additive`, `opacity()` | petals take their hue from `color` |
| `OrbitRings` | `appear()`, `color`, `radii` | rings draw themselves around the hero |
| `SegmentedRings` | `color`, `visible()`, `core` | the charge device; reacts to `live.fx.charge` |
| `GlassShard` | `seed`, `radius`, `tint`, `edge`, `opacity`, `edgeOpacity` | reflective body + additive cut edges (reads on dark) |
| `BurnPlane` | `burn()`, `curl()`, `map`, `color`, `ember`, `size` | paper: bow, heat curl, flutter, blank back, fbm burn with ember rim |
| `LightBeams` | `color`, `count`, `spread`, `z`, `opacity()` | vertical light curtains |
| `HandModel` | `pose: reach \| open \| point \| fist`, `tone`, `look: sculpt \| matcap`, `opacity` | Blender-sculpted hand; fingers +Y, palm +Z (rotate `[0, π, 0]` to flip the palm) |
| `Hourglass` | `fill()`, `sand`, `wood` | GLB glass + frame; sand animated in shader |
| `CityGrid` | `n`, `gap`, `seed`, `base`, `accent`, `lit()`, `parks` | maquette city from the Blender kit; clock tower on the plaza; windows light up with `lit`; `parks` = share of green blocks (0.16 default, 0.4 for an eco story) |
| `ScreenShatter`, `ScreenBurn`, `FrostPane` | — | full-screen layers used by transitions / intro |
| `textures.ts` | clouds, petal, dot, beam, matcap, calendar, stat card, text | procedural canvas textures |

## 5. Global layers & post-processing

`three/Experience.tsx` mounts: Background colour, `Backdrop` (gradient + aurora
flow + god rays + stars), Environment lightformers, `CameraDirector` (keys +
shake + breathing), `CameraRig` (mouse/gyro parallax), `Hero`, scenes,
`ScreenShatter`/`ScreenBurn`/`FrostPane`, `PostFX`.
`three/postfx`: custom `ColorGradeEffect` (exposure, saturation, contrast, tint,
curtain, flash, glitch, drain/sepia, lens dirt) + Bloom (threshold 0.85) +
radial chromatic aberration + DOF + vignette + noise — all driven by the
chapter `grade` and `live.fx`.

## 6. Adding a new scene

1. `three/scenes/MyScene.tsx` using `useChapter`.
2. Register it in `three/scenes/index.ts` and add the name to `SceneName` in
   `story/types.ts`.
3. Reference it from a chapter (`scene: "myscene"`).
4. Give it its own lights if it has lit materials (hero is self-lit; sculpted
   hands/buildings need a hemisphere + key light).
5. Shoot it with `scripts/qa/chapter-shots.js`.
