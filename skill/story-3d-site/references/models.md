# 3D models — make them, check them, ship them

## Contents
1. Decide what you need
2. Blender headless pipeline
3. The included model scripts (patterns to copy)
4. Compress & load
5. Gotchas (each cost real time once)
6. External assets

## 1. Decide what you need

List the objects the treatment names (usually 1–4). For each, pick the cheapest
route that still looks premium:
- **Shader / procedural three.js** — orbs, beans, seeds, coins, rings, sand,
  paper, particles, clouds, lathe objects (glass, vases), instanced cities.
- **Blender script** — anything organic (hands, animals, food) or detailed
  hard-surface (buildings with windows, devices).
- **User asset / download** — brand products, photoreal things, logos.

Quality bar the users set: blobby "clay sausage" shapes and plain white boxes
were rejected ("not real"). Aim for *premium sculpture / architectural maquette*:
correct proportions, anatomy/details, a good lit material.

## 2. Blender headless pipeline

```bash
scripts/blender/run.sh scripts/blender/hand_sculpt.py /tmp/out reach open   # → GLB + preview PNG(s)
scripts/optimize-glb.sh /tmp/out/hand_reach.glb public/models/hand_reach.glb 0.5
```
- `run.sh` finds `blender` on PATH, the Flatpak (`org.blender.Blender`, needs
  `--filesystem=home`/`/tmp`, absolute script paths) or `$BLENDER`.
- Every script renders a **preview PNG** (Cycles or Workbench). Always look at it
  — from more than one side for organic models — before wiring the model in.
- Iterate: tweak numbers → re-run (hands ≈ 40 s/pose, city ≈ 20 s).

## 3. The included scripts

### `hand_sculpt.py` — organic model from anatomical primitives
Palm (squared superellipsoid), heel, palm pads, thenar/hypothenar, dorsal
metacarpal ridges, wrist, forearm; fingers = tapered oval tubes per phalanx with
dorsal knuckle bumps, palm-side pads, rounded tips; thumb with its own frame.
All primitives go into ONE bmesh → **voxel remesh** (0.012) unions them into a
watertight skin → **Smooth** modifier (factor 0.6 × 18) fillets the joins →
decimate 0.22 → corrective smooth → crisp separate **nails** added after. Poses
are curl angles per joint (`POSE_TABLE`). ~35k tris raw → ~75 KB after meshopt.
Reuse the pattern for any organic form: build from overlapping primitives,
voxel-remesh, smooth, add crisp details on top.

### `hourglass.py` — lathe + parts
Lathed double bulb (profile function) with Solidify, turned caps and spindle
pillars (lathe), bevel + weighted normals; two named meshes (`glass`, `frame`)
so the web gives each its own material. Sand is NOT modelled — animated in the
shader (clip by height) in `Hourglass.tsx`.

### `city_kit.py` — hard-surface kit with modelled detail
8 building types, each ≤ 1×1 footprint on y = 0. Facades are built cell by cell:
frame quads + reveal quads + a **recessed glass pane** tagged with a vertex
colour (`COLOR_0`: r = glass, g = random id) so the shader can light single
windows. Exported with `export_vertex_color="ACTIVE"`. Instanced on the web
(one `InstancedMesh` per type) with zoning (plaza → skyline → offices → houses/parks).

## 4. Compress & load

- `optimize-glb.sh in out 0.5` for organic sculpts; `optimize-glb.sh in out` (no
  simplify) for hard-surface models — simplification destroys window recesses.
  `--join false` keeps named meshes separate.
- Load: `useGLTF(url, false, true)` — third arg enables the **meshopt decoder that
  ships with three** (no CDN, no Draco files). Preload with `useGLTF.preload`.
- Put GLBs in `public/models/`. Budget: ≤ 100 KB per organic model, ≤ 400 KB for a kit.

## 5. Gotchas

- **meshopt quantization moves scale/offset into the node transform.** Taking
  `mesh.geometry` alone makes the model tiny and offset. Either clone the whole
  `gltf.scene`, or bake: copy attributes to Float32 (`getX/Y/Z` de-normalises),
  then `geometry.applyMatrix4(mesh.matrixWorld)` (see `CityGrid.bake`).
- **Axis conversion:** Blender Z-up → glTF Y-up. A model authored "pointing +Y
  in Blender" arrives pointing −Z; `HandModel` rotates the primitive `[π/2, 0, 0]`.
- **Left-handed frames flip normals.** When building primitives from basis
  vectors (s, n, d), check `det < 0` and flip one axis, or the voxel remesh gets
  inside-out shells (dark smudges, holes).
- **Laplacian smooth with volume preservation leaves tiny spikes** on voxel
  meshes — use the plain Smooth modifier.
- Flatpak Blender has **no Draco** — export uncompressed, compress with gltf-transform.
- Meshopt `u8` colours: a random id of exactly 0 is "on" at `lit = 0` — guard with
  `step(0.001, uLit)`.
- Changing a model's curl/palm convention flips how scenes see it — re-shoot the
  scenes that use it.
- Lit (physical) materials need lights in that scene; matcaps don't.
- Transmission glass renders black on dark backgrounds — use reflective body +
  bright edges instead.
- `/tmp` scratch directories can be wiped between sessions — keep scripts and
  final GLBs in the project/skill, not only in temp.

## 6. External assets

Downloading a model is an action that needs the user's explicit OK: name the file,
source, licence and size first. Prefer CC0 (Poly Haven, Kenney, Quaternius,
ambientCG). Never download from untrusted sources or run downloaded scripts.
If the brief needs a photoreal product, ask the user for the file or photos.
