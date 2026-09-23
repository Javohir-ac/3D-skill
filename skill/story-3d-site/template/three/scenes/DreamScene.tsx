"use client";
import { useRef } from "react";
import type { Mesh } from "three";
import { smoothstep } from "@/lib/math";
import { CloudField } from "../fx/CloudField";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 2 — the dream: bright sky, drifting petals, two lights reaching for
// each other (a nod to Michelangelo's hands). They almost touch at the gate.
export default function DreamScene(props: SceneProps) {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const { root, p } = useChapter(props, (p, _dt, t) => {
    const gap = 2.6 - smoothstep(0, 0.88, p) * 2.25; // distance between the two lights
    if (a.current) a.current.position.set(-gap / 2, Math.sin(t * 1.3) * 0.05, 0);
    if (b.current) b.current.position.set(gap / 2, Math.cos(t * 1.1) * 0.05, 0);
  });
  return (
    <group ref={root}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} />
      <CloudField dive={() => p() * 0.35} speed={0.6} seed={2} color="#e3eaee" />
      <Particles kind="petal" count={70} area={[12, 7, 5]} size={[0.07, 0.16]} lift={-0.25} sway={0.6} spin={1.2} seed={5} />
      <mesh ref={a}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshBasicMaterial color={[0.6, 3, 1.6]} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshBasicMaterial color={[3, 2.2, 1.6]} toneMapped={false} />
      </mesh>
    </group>
  );
}
