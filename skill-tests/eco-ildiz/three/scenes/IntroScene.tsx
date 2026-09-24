"use client";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import { range, smoothstep } from "@/lib/math";
import { CloudField } from "../fx/CloudField";
import { Hourglass } from "../fx/Hourglass";
import { OrbitRings } from "../fx/OrbitRings";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 1 — the promise. The hero (lib: three/hero) is born here as a living
// liquid orb; orbits draw themselves around it one by one; dust thickens.
// On "there would be Time" an hourglass rises beside it and the first grains
// start to fall — time is promised, but it is already running.
// At the end the orb rises and the first clouds rush past the camera — the
// same sky that chapter 2 opens in (one continuous shot, no cut).
export default function IntroScene(props: SceneProps) {
  const glass = useRef<Group>(null);
  const { root, p } = useChapter(props, (p, _dt, t) => {
    if (!glass.current) return;
    const enter = smoothstep(0.46, 0.64, p);
    glass.current.position.set(-1.85, -3.2 + enter * 2.75 + Math.sin(t * 0.7) * 0.03, 0.4);
    glass.current.rotation.set(0.08, t * 0.15, 0.1 - enter * 0.06);
    glass.current.visible = enter > 0.001;
  });
  return (
    <group ref={root}>
      <OrbitRings appear={() => range(p(), 0.15, 0.85)} color="#d9f2c4" />
      <group ref={glass} scale={0.55}>
        <Suspense fallback={null}>
          <Hourglass fill={() => range(p(), 0.56, 1) * 0.35} />
        </Suspense>
      </group>
      <CloudField dive={() => range(p(), 0.7, 1) * 0.6} opacity={() => range(p(), 0.68, 0.95)} speed={0.6} seed={2} color="#e3eaee" />
      <Particles kind="dot" count={180} color="#eef7dc" area={[12, 7, 6]} size={[0.015, 0.06]} lift={0.12} opacity={() => 0.3 + p() * 0.7} />
      <Particles kind="dot" count={60} color="#bfe8a0" area={[6, 4, 3]} size={[0.03, 0.09]} lift={0.25} sway={0.5} opacity={() => range(p(), 0.4, 0.7)} seed={11} />
    </group>
  );
}
