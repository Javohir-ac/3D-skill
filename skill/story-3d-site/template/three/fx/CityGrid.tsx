"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshStandardMaterial } from "three";
import { rand } from "@/lib/math";

// Procedural miniature city (instanced boxes) — stand-in for a hero world.
// Replace with a real .glb or an illustrated plane (Zero used a single AI-made
// city image on a plane) when the brief provides one.
export function CityGrid({ n = 22, gap = 0.34, seed = 7, base = "#dfe7e3", accent = "#35d58b" }: {
  n?: number; gap?: number; seed?: number; base?: string; accent?: string;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const { geometry, material, count } = useMemo(() => {
    const geometry = new BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    return { geometry, material: new MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 }), count: n * n };
  }, [n]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const mat = new Matrix4();
    const cBase = new Color(base);
    const cAcc = new Color(accent);
    const col = new Color();
    let i = 0;
    for (let x = 0; x < n; x++)
      for (let z = 0; z < n; z++) {
        const s = seed * 1000 + x * 57 + z * 131;
        const cx = (x - n / 2) * gap;
        const cz = (z - n / 2) * gap;
        const d = Math.hypot(cx, cz);
        const road = x % 5 === 0 || z % 6 === 0;
        const h = road ? 0.02 : 0.08 + rand(s) ** 3 * 1.6 * Math.max(0.25, 1 - d / (n * gap * 0.6));
        const w = road ? gap : gap * (0.55 + rand(s + 1) * 0.3);
        mat.makeScale(w, h, w).setPosition(cx, 0, cz);
        m.setMatrixAt(i, mat);
        col.copy(cBase).offsetHSL(0, 0, (rand(s + 2) - 0.5) * 0.12);
        if (!road && rand(s + 3) > 0.9) col.copy(cAcc);
        if (road) col.set("#b9c4bf");
        m.setColorAt(i, col);
        i++;
      }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [n, gap, seed, base, accent]);

  return <instancedMesh ref={mesh} args={[geometry, material, count]} castShadow receiveShadow />;
}
