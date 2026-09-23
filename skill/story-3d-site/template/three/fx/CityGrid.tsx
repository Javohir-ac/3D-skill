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
  Matrix4,
  type Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { rand } from "@/lib/math";

// Miniature city built from a Blender kit (tools/models/city_kit.py → nodes
// tower / slab / house / round / tree, 1×1 footprint, standing on y = 0).
// One InstancedMesh per building type → a few draw calls for the whole city.
// Windows are drawn in the shader from city-space position (square whatever
// the instance scale) and switch on one by one with `lit()` — in the demo
// story every lit window is an hour someone got back.

const URL = "/models/city_kit.glb";
type Kind = "tower" | "slab" | "house" | "round" | "tree";
const KINDS: Kind[] = ["tower", "slab", "house", "round", "tree"];

/** meshopt stores quantized (int16) positions + a node transform; bake both into plain floats. */
function bake(mesh: Mesh) {
  const src = mesh.geometry;
  const g = new BufferGeometry();
  for (const name of ["position", "normal"] as const) {
    const a = src.getAttribute(name);
    const out = new Float32Array(a.count * 3);
    for (let i = 0; i < a.count; i++) {
      out[i * 3] = a.getX(i);
      out[i * 3 + 1] = a.getY(i);
      out[i * 3 + 2] = a.getZ(i);
    }
    g.setAttribute(name, new BufferAttribute(out, 3));
  }
  if (src.index) g.setIndex(src.index.clone());
  mesh.updateWorldMatrix(true, false);
  g.applyMatrix4(mesh.matrixWorld);
  return g;
}

function windowMaterial(lit: { value: number }, withWindows: boolean) {
  const m = new MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 });
  if (!withWindows) return m;
  m.onBeforeCompile = (s) => {
    s.uniforms.uLit = lit;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCity;\nvarying vec3 vCityN;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvCity = (instanceMatrix * vec4(position, 1.0)).xyz;\nvCityN = normalize(mat3(instanceMatrix) * normal);",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vCity; varying vec3 vCityN; uniform float uLit;
         float wHash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         {
           float wall = 1.0 - step(0.5, abs(vCityN.y));
           float u = (abs(vCityN.x) > abs(vCityN.z) ? vCity.z : vCity.x) * 20.0;
           float v = vCity.y * 24.0;
           vec2 cell = floor(vec2(u, v));
           vec2 f = fract(vec2(u, v));
           float win = wall * step(0.28, f.x) * step(f.x, 0.72) * step(0.3, f.y) * step(f.y, 0.78) * step(0.9, v);
           float h = wHash(cell + floor(vCity.xz * 3.0) * 17.0);
           float on = win * step(h, uLit);
           vec3 warm = vec3(1.0, 0.78, 0.45), mint = vec3(0.55, 1.0, 0.78);
           diffuseColor.rgb *= 1.0 - win * 0.35;          // dark glass when off
           totalEmissiveRadiance += mix(warm, mint, step(0.72, wHash(cell * 1.7))) * on * 1.6;
         }`,
      );
  };
  return m;
}

export function CityGrid({
  n = 22, gap = 0.34, seed = 7, base = "#6f837c", accent = "#35d58b", lit = () => 0,
}: {
  n?: number; gap?: number; seed?: number; base?: string; accent?: string;
  /** Share of windows switched on, 0..1 (read every frame). */
  lit?: () => number;
}) {
  const gltf = useGLTF(URL, false, true);
  const litU = useMemo(() => ({ value: 0 }), []);
  const refs = useRef<Partial<Record<Kind | "road", InstancedMesh | null>>>({});

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
      building: windowMaterial(litU, true),
      tree: new MeshStandardMaterial({ roughness: 0.9 }),
      road: new MeshStandardMaterial({ roughness: 0.95 }),
    }),
    [litU],
  );

  // lay out lots: tall centre, offices around it, houses and parks outside
  const lots = useMemo(() => {
    const out: Record<Kind, { x: number; z: number; w: number; h: number; r: number; c: number }[]> = {
      tower: [], slab: [], house: [], round: [], tree: [],
    };
    const road: { x: number; z: number }[] = [];
    for (let x = 0; x < n; x++)
      for (let z = 0; z < n; z++) {
        const s = seed * 1000 + x * 57 + z * 131;
        const cx = (x - n / 2) * gap;
        const cz = (z - n / 2) * gap;
        if (x % 5 === 0 || z % 6 === 0) { road.push({ x: cx, z: cz }); continue; }
        const d = Math.hypot(cx, cz) / (n * gap * 0.5); // 0 centre → ~1.4 corners
        const k = rand(s);
        const park = rand(Math.floor(x / 5) * 7 + Math.floor(z / 6) * 13 + seed) > 0.82;
        const r = Math.floor(rand(s + 5) * 4) * (Math.PI / 2);
        const c = rand(s + 2);
        if (park || (d > 0.95 && k > 0.6)) {
          out.tree.push({ x: cx + (rand(s + 3) - 0.5) * gap * 0.3, z: cz, w: gap * (0.8 + c * 0.5), h: gap * (1.1 + c * 0.6), r, c });
        } else if (d < 0.35 && k > 0.35) {
          out[k > 0.72 ? "round" : "tower"].push({ x: cx, z: cz, w: gap * 0.82, h: gap * (1.2 + rand(s + 1) ** 2 * 1.8) * (1.2 - d), r, c });
        } else if (d < 0.8) {
          out.slab.push({ x: cx, z: cz, w: gap * (0.72 + c * 0.2), h: gap * (0.9 + rand(s + 1) ** 2 * 2.2) * (1.15 - d * 0.6), r, c });
        } else {
          out.house.push({ x: cx, z: cz, w: gap * 0.7, h: gap * (0.8 + c * 0.3), r, c });
        }
      }
    return { ...out, road };
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
        dummy.position.set(l.x, 0, l.z);
        dummy.rotation.set(0, l.r, 0);
        dummy.scale.set(l.w, l.h, l.w);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        if (kind === "tree") col.set("#2f6b50").offsetHSL(0, 0, (l.c - 0.5) * 0.08);
        else if (l.c > 0.93) col.copy(cAcc).lerp(cBase, 0.35);
        else col.copy(cBase).offsetHSL(0, 0, (l.c - 0.5) * 0.1);
        m.setColorAt(i, col);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    const road = refs.current.road;
    if (road) {
      const mat = new Matrix4();
      lots.road.forEach((r, i) => {
        road.setMatrixAt(i, mat.makeScale(gap, 0.02, gap).setPosition(r.x, 0.01, r.z));
        road.setColorAt(i, col.copy(cBase).multiplyScalar(0.32));
      });
      road.instanceMatrix.needsUpdate = true;
      if (road.instanceColor) road.instanceColor.needsUpdate = true;
    }
  }, [lots, base, accent, gap]);

  useFrame(() => {
    litU.value = lit();
  });

  const roadGeo = useMemo(() => new BoxGeometry(1, 1, 1), []);
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
      <instancedMesh ref={(el) => { refs.current.road = el; }} args={[roadGeo, mats.road, lots.road.length]} />
    </group>
  );
}

useGLTF.preload(URL, false, true);
