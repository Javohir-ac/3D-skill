"use client";
import { useMemo } from "react";
import { AdditiveBlending, DoubleSide, EdgesGeometry, ExtrudeGeometry, Shape } from "three";
import { rand } from "@/lib/math";

// Broken-glass slab that reads as glass on ANY background.
// Real `transmission` turns black when there is little behind the shard (dark
// chapters), so instead: a faint reflective body (env map + clearcoat) and
// bright cut edges — edges are what the eye uses to recognise glass. Bloom
// picks the edges up, so the shard glints in the chapter's colour.
export function useShardGeometry(seed: number, radius = 1, thickness = 0.035) {
  return useMemo(() => {
    // jagged outline: long straight fracture lines + the occasional notch/spike
    const n = 7 + Math.floor(rand(seed) * 5);
    const shape = new Shape();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rand(seed + i) - 0.5) * 0.45;
      const k = rand(seed + i * 7);
      const r = radius * (k < 0.18 ? 0.35 + k : k > 0.86 ? 1.2 + (k - 0.86) * 2 : 0.7 + k * 0.4);
      const x = Math.cos(a) * r * 1.3;
      const y = Math.sin(a) * r * 0.82;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 1 });
    g.center();
    return g;
  }, [seed, radius, thickness]);
}

export function GlassShard({
  seed = 1, radius = 1, tint = "#ffffff", edge = "#ffd6cc", opacity = 0.16, edgeOpacity = 0.85,
}: { seed?: number; radius?: number; tint?: string; edge?: string; opacity?: number; edgeOpacity?: number }) {
  const geometry = useShardGeometry(seed, radius);
  const edges = useMemo(() => new EdgesGeometry(geometry, 25), [geometry]);
  return (
    <group>
      <mesh geometry={geometry} renderOrder={1}>
        <meshPhysicalMaterial
          color={tint}
          roughness={0.04}
          metalness={0.2}
          clearcoat={1}
          iridescence={0.6}
          iridescenceIOR={1.3}
          envMapIntensity={2.2}
          transparent
          opacity={opacity}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges} renderOrder={2}>
        <lineBasicMaterial color={edge} transparent opacity={edgeOpacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
