"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Group, MeshBasicMaterial, TorusGeometry } from "three";
import { live } from "@/lib/live";
import { smoothstep } from "@/lib/math";

// Thin glowing orbits around the hero that appear one by one with progress —
// a cheap way to add "events" and elegance without any model.
export function OrbitRings({ appear, color = "#9dffd0", radii = [1.6, 2.1, 2.7] }: {
  /** progress 0..1 getter; ring i appears at appear()*n > i */
  appear: () => number;
  color?: string;
  radii?: number[];
}) {
  const group = useRef<Group>(null);
  const rings = useMemo(
    () =>
      radii.map((r, i) => ({
        geo: new TorusGeometry(r, 0.006 + i * 0.002, 8, 160),
        mat: new MeshBasicMaterial({ color: new Color(color).multiplyScalar(2), transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
        tilt: [0.9 + i * 0.35, i * 0.8, 0] as const,
        speed: (i % 2 ? -1 : 1) * (0.12 + i * 0.05),
      })),
    [radii, color],
  );
  const refs = useRef<(Group | null)[]>([]);
  useFrame((_, dt) => {
    const a = appear();
    if (group.current) group.current.position.copy(live.hero.pos);
    rings.forEach((r, i) => {
      const t = smoothstep(i / rings.length, (i + 1) / rings.length, a);
      r.mat.opacity = t * 0.8;
      const g = refs.current[i];
      if (g) {
        g.rotation.z += dt * r.speed;
        g.scale.setScalar(0.6 + t * 0.4);
      }
    });
  });
  return (
    <group ref={group}>
      {rings.map((r, i) => (
        <group key={i} rotation={[r.tilt[0], r.tilt[1], r.tilt[2]]}>
          <group ref={(el) => { refs.current[i] = el; }}>
            <mesh geometry={r.geo} material={r.mat} />
          </group>
        </group>
      ))}
    </group>
  );
}
