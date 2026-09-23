"use client";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { useStory } from "@/lib/store";

// Mouse parallax: the whole world tilts slightly away from the cursor, so
// near and far layers shift by different amounts (depth for free).
export function CameraRig({ children, strength = 1 }: { children: ReactNode; strength?: number }) {
  const g = useRef<Group>(null);
  const reduced = useStory((s) => s.reducedMotion);
  useFrame((state, dt) => {
    const k = reduced ? 0 : strength;
    live.pointer.x = damp(live.pointer.x, state.pointer.x, 3, dt);
    live.pointer.y = damp(live.pointer.y, state.pointer.y, 3, dt);
    if (!g.current) return;
    g.current.rotation.y = -live.pointer.x * 0.06 * k;
    g.current.rotation.x = live.pointer.y * 0.04 * k;
    // tiny roll from scroll velocity — the world "leans" into fast scrolling
    g.current.rotation.z = damp(g.current.rotation.z, Math.max(-1, Math.min(1, live.velocity / 60)) * 0.02 * k, 4, dt);
  });
  return <group ref={g}>{children}</group>;
}
