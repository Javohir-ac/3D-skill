"use client";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import { smoothstep } from "@/lib/math";
import { CityGrid } from "../fx/CityGrid";
import { CloudField } from "../fx/CloudField";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 6 — the reveal: we fall through the clouds; the new world (city)
// resolves underneath as layers thin out.
export default function RevealScene(props: SceneProps) {
  const world = useRef<Group>(null);
  const { root, p } = useChapter(props, (p) => {
    if (!world.current) return;
    const e = smoothstep(0, 1, p);
    world.current.position.set(0, -3.2 + e * 1.4, -26 + e * 18);
    world.current.rotation.set(0.95 - e * 0.25, e * 0.4, 0);
  });
  return (
    <group ref={root}>
      <hemisphereLight args={["#ffffff", "#b7c9c1", 1.4]} />
      <directionalLight position={[5, 10, 4]} intensity={2.4} />
      <group ref={world}>
        <Suspense fallback={null}>
          <CityGrid base="#9aaba2" parks={0.4} />
        </Suspense>
      </group>
      <CloudField dive={() => p()} opacity={() => 1 - smoothstep(0.75, 1, p())} speed={0.8} depth={34} seed={4} color="#e6ecef" />
    </group>
  );
}
