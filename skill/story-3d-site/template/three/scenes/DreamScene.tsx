"use client";
import { useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { range, smoothstep } from "@/lib/math";
import { CloudField } from "../fx/CloudField";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 2 — the dream. The hero drifts up into a soft sky; a warm "promise"
// light approaches from the other side (Michelangelo's two hands, abstracted).
// They almost touch exactly when the gate appears.
export default function DreamScene(props: SceneProps) {
  const other = useRef<Group>(null);
  const { root, p } = useChapter(props, (p, _dt, t) => {
    if (!other.current) return;
    const h = live.hero.pos;
    const gap = 2.8 - smoothstep(0.1, 0.88, p) * 2.35;
    other.current.position.set(h.x + gap, h.y + Math.cos(t * 1.1) * 0.05, h.z);
    other.current.scale.setScalar(0.5 + range(p, 0.05, 0.3) * 0.5);
  });
  return (
    <group ref={root}>
      <CloudField dive={() => p() * 0.35} speed={0.6} seed={2} color="#e3eaee" />
      <Particles kind="petal" count={80} area={[12, 7, 5]} size={[0.07, 0.16]} lift={-0.25} sway={0.6} spin={1.2} seed={5} opacity={() => range(p(), 0.2, 0.45)} />
      <group ref={other}>
        <mesh>
          <sphereGeometry args={[0.16, 32, 16]} />
          <meshBasicMaterial color={[3, 2.1, 1.5]} toneMapped={false} />
        </mesh>
        <Particles kind="dot" count={40} color="#ffd6a8" area={[0.8, 0.8, 0.8]} size={[0.02, 0.05]} lift={0.1} sway={0.1} seed={31} />
      </group>
    </group>
  );
}
