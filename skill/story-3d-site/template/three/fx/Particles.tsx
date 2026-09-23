"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending, DoubleSide, Euler, InstancedMesh, Matrix4, MeshBasicMaterial,
  NormalBlending, PlaneGeometry, Quaternion, Vector3,
} from "three";
import { rand } from "@/lib/math";
import { makeDotTexture, makePetalTexture } from "./textures";

// Instanced floating sprites: petals, sparks, dust, embers, stars.
export interface ParticlesProps {
  kind?: "petal" | "dot";
  count?: number;
  color?: string;
  /** Box size the particles live in (centred on the group). */
  area?: [number, number, number];
  /** [min, max] sprite size. */
  size?: [number, number];
  /** Fall (negative) / rise (positive) speed. */
  lift?: number;
  sway?: number;
  spin?: number;
  additive?: boolean;
  opacity?: () => number;
  seed?: number;
}

export function Particles({
  kind = "dot", count = 120, color = "#ffffff", area = [10, 6, 6], size = [0.03, 0.08],
  lift = 0.1, sway = 0.3, spin = 0.6, additive = kind === "dot", opacity, seed = 3,
}: ParticlesProps) {
  const mesh = useRef<InstancedMesh>(null);
  const { geometry, material, items } = useMemo(() => {
    const material = new MeshBasicMaterial({
      map: kind === "petal" ? makePetalTexture(color) : makeDotTexture(),
      color: kind === "petal" ? "#ffffff" : color,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: additive ? AdditiveBlending : NormalBlending,
      toneMapped: !additive,
    });
    const items = Array.from({ length: count }, (_, i) => {
      const s = seed * 1000 + i * 13;
      return {
        x: (rand(s) - 0.5) * area[0], y: (rand(s + 1) - 0.5) * area[1], z: (rand(s + 2) - 0.5) * area[2],
        size: size[0] + rand(s + 3) * (size[1] - size[0]), phase: rand(s + 4) * 6.28,
        rx: rand(s + 5) * 6.28, ry: rand(s + 6) * 6.28, speed: 0.6 + rand(s + 7) * 0.8,
      };
    });
    return { geometry: new PlaneGeometry(1, 1), material, items };
  }, [kind, count, color, area, size, additive, seed]);

  const tmp = useMemo(() => ({ m: new Matrix4(), p: new Vector3(), q: new Quaternion(), s: new Vector3(), e: new Euler() }), []);
  const t = useRef(0);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    t.current += dt;
    material.opacity = opacity ? opacity() : 1;
    const hY = area[1] / 2;
    items.forEach((it, i) => {
      let y = it.y + t.current * lift * it.speed;
      y = ((((y + hY) % area[1]) + area[1]) % area[1]) - hY;
      const x = it.x + Math.sin(t.current * 0.5 * it.speed + it.phase) * sway;
      tmp.p.set(x, y, it.z);
      tmp.e.set(it.rx + t.current * spin * it.speed, it.ry + t.current * spin * 0.7, 0);
      tmp.q.setFromEuler(tmp.e);
      tmp.s.setScalar(it.size);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      m.setMatrixAt(i, tmp.m);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}
