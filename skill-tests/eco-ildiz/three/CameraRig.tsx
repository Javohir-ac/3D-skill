"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { gyro, initGyro } from "@/lib/gyro";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { useStory } from "@/lib/store";

// Parallax: the whole world tilts slightly away from the cursor (or with the
// phone's tilt), so near and far layers shift by different amounts — depth for free.
export function CameraRig({ children, strength = 1 }: { children: ReactNode; strength?: number }) {
  const g = useRef<Group>(null);
  const reduced = useStory((s) => s.reducedMotion);
  useEffect(() => initGyro(), []);
  useFrame((state, dt) => {
    const k = reduced ? 0 : strength;
    const tx = gyro.active ? gyro.x : state.pointer.x;
    const ty = gyro.active ? gyro.y : state.pointer.y;
    live.pointer.x = damp(live.pointer.x, tx, 3, dt);
    live.pointer.y = damp(live.pointer.y, ty, 3, dt);
    if (!g.current) return;
    g.current.rotation.y = -live.pointer.x * 0.06 * k;
    g.current.rotation.x = live.pointer.y * 0.04 * k;
    // tiny roll from scroll velocity — the world "leans" into fast scrolling
    g.current.rotation.z = damp(g.current.rotation.z, Math.max(-1, Math.min(1, live.velocity / 60)) * 0.02 * k, 4, dt);
  });
  return <group ref={g}>{children}</group>;
}
