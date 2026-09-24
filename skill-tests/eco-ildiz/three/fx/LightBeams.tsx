"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Group, MeshBasicMaterial } from "three";
import { rand } from "@/lib/math";
import { makeBeamTexture } from "./textures";

// Vertical shafts of light behind the subject ("red curtain" look), gently breathing.
export function LightBeams({ color = "#ff3b3b", count = 7, spread = 7, z = -4, opacity = () => 1 }: {
  color?: string; count?: number; spread?: number; z?: number; opacity?: () => number;
}) {
  const group = useRef<Group>(null);
  const tex = useMemo(() => makeBeamTexture(), []);
  const beams = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i / (count - 1) - 0.5) * spread + (rand(i * 9) - 0.5) * 0.8,
        w: 0.25 + rand(i * 5) * 0.7,
        phase: rand(i * 3) * 6.28,
        mat: new MeshBasicMaterial({
          map: tex, color: new Color(color).multiplyScalar(1.4), transparent: true,
          blending: AdditiveBlending, depthWrite: false, toneMapped: false,
        }),
      })),
    [count, spread, color, tex],
  );
  useFrame((s) => {
    const o = opacity();
    beams.forEach((b) => (b.mat.opacity = o * (0.35 + 0.25 * Math.sin(s.clock.elapsedTime * 0.7 + b.phase))));
  });
  return (
    <group ref={group} position={[0, 0, z]}>
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, 0, 0]} material={b.mat}>
          <planeGeometry args={[b.w, 14]} />
        </mesh>
      ))}
    </group>
  );
}
