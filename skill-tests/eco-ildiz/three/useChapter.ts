"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";

export interface SceneProps {
  id: string;
  index: number;
}

/**
 * Scene helper. Returns a ref for the scene root group (auto-hidden when the
 * chapter is not on screen) and `p()` — this chapter's scroll progress 0..1.
 * `onFrame` only runs while the chapter is visible.
 */
export function useChapter(
  { id, index }: SceneProps,
  onFrame?: (p: number, dt: number, t: number) => void,
) {
  const root = useRef<Group>(null);
  const p = () => live.progress[id] ?? 0;
  useFrame((state, dt) => {
    const visible = live.active === index;
    if (root.current) root.current.visible = visible;
    if (visible && onFrame) onFrame(p(), dt, state.clock.elapsedTime);
  });
  return { root, p };
}
