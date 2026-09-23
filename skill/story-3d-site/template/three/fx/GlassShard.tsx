"use client";
import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { rand } from "@/lib/math";

// Irregular broken-glass slab with real transmission (refraction + iridescent edges).
export function useShardGeometry(seed: number, radius = 1, thickness = 0.04) {
  return useMemo(() => {
    const n = 5 + Math.floor(rand(seed) * 4);
    const shape = new Shape();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rand(seed + i) - 0.5) * 0.7;
      const r = radius * (0.55 + rand(seed + i * 7) * 0.6);
      const x = Math.cos(a) * r * 1.35;
      const y = Math.sin(a) * r * 0.8;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 1 });
    g.center();
    return g;
  }, [seed, radius, thickness]);
}

export function GlassShard({ seed = 1, radius = 1, tint = "#ffffff" }: { seed?: number; radius?: number; tint?: string }) {
  const geometry = useShardGeometry(seed, radius);
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={tint}
        transmission={1}
        thickness={0.35}
        roughness={0.08}
        ior={1.45}
        iridescence={0.8}
        iridescenceIOR={1.3}
        clearcoat={1}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}
