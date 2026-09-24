"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  type InstancedMesh,
  type Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { rand } from "@/lib/math";

// Architectural-maquette city built from a Blender kit (tools/models/city_kit.py):
// deco / glass / round / office / flats / house / clock / tree — each ≤ 1×1
// footprint, standing on y = 0, windows modelled as real recessed panes.
// One InstancedMesh per type → a handful of draw calls for the whole city.
// Glass panes carry a vertex colour (r = glass, g = random id); `lit()` switches
// windows on one by one — in the demo story every lit window is an hour
// someone got back. The clock tower stands on the central plaza.

const URL = "/models/city_kit.glb";
type Kind = "deco" | "glass" | "round" | "office" | "flats" | "house" | "clock" | "tree";
const KINDS: Kind[] = ["deco", "glass", "round", "office", "flats", "house", "clock", "tree"];
type Lot = { x: number; z: number; s: number; h: number; r: number; c: number };

/** meshopt stores quantized positions + a node transform; bake both into plain floats. */
function bake(mesh: Mesh) {
  const src = mesh.geometry;
  const g = new BufferGeometry();
  const copy = (from: string, to: string, size: number) => {
    const a = src.getAttribute(from);
    if (!a) return;
    const out = new Float32Array(a.count * size);
    for (let i = 0; i < a.count; i++) {
      out[i * size] = a.getX(i);
      if (size > 1) out[i * size + 1] = a.getY(i);
      if (size > 2) out[i * size + 2] = a.getZ(i);
    }
    g.setAttribute(to, new BufferAttribute(out, size));
  };
  copy("position", "position", 3);
  copy("normal", "normal", 3);
  copy("color", "aWin", 2); // r = glass pane, g = random window id
  if (!g.getAttribute("aWin")) g.setAttribute("aWin", new BufferAttribute(new Float32Array(src.getAttribute("position").count * 2), 2));
  if (src.index) g.setIndex(src.index.clone());
  mesh.updateWorldMatrix(true, false);
  g.applyMatrix4(mesh.matrixWorld);
  return g;
}

function buildingMaterial(lit: { value: number }) {
  const m = new MeshStandardMaterial({ roughness: 0.8, metalness: 0.0 });
  m.onBeforeCompile = (s) => {
    s.uniforms.uLit = lit;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aWin;\nvarying vec2 vWin;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWin = aWin;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vWin;\nuniform float uLit;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         {
           float glass = step(0.5, vWin.x);
           float on = glass * step(vWin.y, uLit);
           diffuseColor.rgb *= 1.0 - glass * 0.55;              // dark glass when off
           vec3 warm = vec3(1.0, 0.76, 0.44), mint = vec3(0.55, 1.0, 0.78);
           totalEmissiveRadiance += mix(warm, mint, step(0.8, fract(vWin.y * 7.13))) * on * 1.5;
         }`,
      );
  };
  return m;
}

export function CityGrid({
  n = 20, gap = 0.37, seed = 7, base = "#8d9c96", accent = "#35d58b", lit = () => 0,
}: {
  n?: number; gap?: number; seed?: number; base?: string; accent?: string;
  /** Share of windows switched on, 0..1 (read every frame). */
  lit?: () => number;
}) {
  const gltf = useGLTF(URL, false, true);
  const litU = useMemo(() => ({ value: 0 }), []);
  const refs = useRef<Partial<Record<Kind | "ground", InstancedMesh | null>>>({});

  const kit = useMemo(() => {
    const geos = {} as Record<Kind, BufferGeometry>;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o) => {
      const mesh = o as Mesh;
      const kind = KINDS.find((k) => k === mesh.name || k === mesh.parent?.name);
      if (mesh.isMesh && kind) geos[kind] = bake(mesh);
    });
    return geos;
  }, [gltf]);

  const mats = useMemo(
    () => ({
      building: buildingMaterial(litU),
      tree: new MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
      ground: new MeshStandardMaterial({ roughness: 0.95 }),
    }),
    [litU],
  );

  // zoning: clock tower on a central plaza, skyline around it, offices and
  // flats in the middle ring, houses and parks on the edge
  const lots = useMemo(() => {
    const out = Object.fromEntries(KINDS.map((k) => [k, [] as Lot[]])) as Record<Kind, Lot[]>;
    const ground: { x: number; z: number; road: boolean; plaza: boolean }[] = [];
    const mid = Math.floor(n / 2);
    for (let x = 0; x < n; x++)
      for (let z = 0; z < n; z++) {
        const s = seed * 1000 + x * 57 + z * 131;
        const cx = (x - n / 2 + 0.5) * gap;
        const cz = (z - n / 2 + 0.5) * gap;
        const road = x % 5 === 2 || z % 6 === 3;
        const plaza = Math.abs(x - mid) <= 1 && Math.abs(z - mid) <= 1 && !road;
        ground.push({ x: cx, z: cz, road, plaza });
        if (road) continue;
        const r = Math.floor(rand(s + 5) * 4) * (Math.PI / 2);
        const c = rand(s + 2);
        const lot = (k: Kind, scale = 0.94, h = 1) => out[k].push({ x: cx, z: cz, s: gap * scale, h, r, c });
        if (plaza) {
          if (x === mid && z === mid) lot("clock", 1.0);
          else if (rand(s) > 0.5) out.tree.push({ x: cx + (rand(s + 3) - 0.5) * gap * 0.4, z: cz, s: gap * 0.55, h: 1, r, c });
          continue;
        }
        const d = Math.hypot(cx, cz) / (n * gap * 0.5); // 0 centre → ~1.4 corners
        const k = rand(s);
        const park = rand(Math.floor(x / 5) * 7 + Math.floor(z / 6) * 13 + seed) > 0.84;
        if (park || (d > 1.0 && k > 0.55)) {
          for (let t = 0; t < 2; t++)
            out.tree.push({ x: cx + (rand(s + t * 9) - 0.5) * gap * 0.5, z: cz + (rand(s + t * 7 + 1) - 0.5) * gap * 0.5, s: gap * (0.45 + rand(s + t) * 0.25), h: 1, r, c });
        } else if (d < 0.42) {
          lot(k > 0.66 ? "deco" : k > 0.33 ? "glass" : "round", 0.94, (0.75 + rand(s + 1) * 0.4) * (1.25 - d));
        } else if (d < 0.85) {
          lot(k > 0.5 ? "office" : "flats", 0.94, 0.85 + rand(s + 1) * 0.35);
        } else {
          lot("house", 0.9, 0.9 + c * 0.25);
        }
      }
    return { ...out, ground };
  }, [n, gap, seed]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const cBase = new Color(base);
    const cAcc = new Color(accent);
    const col = new Color();
    for (const kind of KINDS) {
      const m = refs.current[kind];
      if (!m) continue;
      lots[kind].forEach((l, i) => {
        dummy.position.set(l.x, 0.02, l.z);
        dummy.rotation.set(0, l.r, 0);
        dummy.scale.set(l.s, l.s * l.h, l.s);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        if (kind === "tree") col.set("#3f7a5c").offsetHSL(0, 0, (l.c - 0.5) * 0.1);
        else if (kind === "clock") col.copy(cBase).offsetHSL(0.02, 0.05, 0.06);
        else if (l.c > 0.97) col.copy(cAcc).lerp(cBase, 0.8); // a rare tinted facade
        else col.copy(cBase).offsetHSL(0, 0, (l.c - 0.5) * 0.08);
        m.setColorAt(i, col);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    const g = refs.current.ground;
    if (g) {
      lots.ground.forEach((t, i) => {
        // roads sit low and dark; blocks are raised pavement; the plaza is lighter stone
        dummy.position.set(t.x, t.road ? -0.01 : 0.0, t.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(gap * (t.road ? 1 : 0.98), t.road ? 0.02 : 0.04, gap * (t.road ? 1 : 0.98));
        dummy.updateMatrix();
        g.setMatrixAt(i, dummy.matrix);
        g.setColorAt(i, col.copy(cBase).multiplyScalar(t.road ? 0.3 : t.plaza ? 0.95 : 0.62));
      });
      g.instanceMatrix.needsUpdate = true;
      if (g.instanceColor) g.instanceColor.needsUpdate = true;
    }
  }, [lots, base, accent, gap]);

  useFrame(() => {
    litU.value = lit();
  });

  const tile = useMemo(() => new BoxGeometry(1, 1, 1).translate(0, -0.5, 0), []);
  return (
    <group>
      {KINDS.map((k) =>
        kit[k] && lots[k].length ? (
          <instancedMesh
            key={k}
            ref={(el) => { refs.current[k] = el; }}
            args={[kit[k], k === "tree" ? mats.tree : mats.building, lots[k].length]}
          />
        ) : null,
      )}
      <instancedMesh ref={(el) => { refs.current.ground = el; }} args={[tile, mats.ground, lots.ground.length]} />
    </group>
  );
}

useGLTF.preload(URL, false, true);
