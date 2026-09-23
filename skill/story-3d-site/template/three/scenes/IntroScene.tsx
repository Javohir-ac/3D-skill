"use client";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { smoothstep } from "@/lib/math";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 1 — the promise: a soft living orb (the story's recurring object)
// that grows and rises as the viewer scrolls. Replace with the brand's hero object.
export default function IntroScene(props: SceneProps) {
  const orb = useRef<Mesh>(null);
  const { root, p } = useChapter(props, (p) => {
    if (!orb.current) return;
    const s = 0.75 + smoothstep(0, 1, p) * 0.55;
    orb.current.scale.setScalar(s);
    orb.current.position.y = -0.15 + p * 0.3;
  });
  return (
    <group ref={root}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3, -1, 2]} intensity={25} color="#5dffb0" />
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={orb}>
          <icosahedronGeometry args={[1, 32]} />
          <MeshDistortMaterial color="#29d38a" emissive="#0b7a4d" emissiveIntensity={0.35} roughness={0.12} metalness={0.1} distort={0.32} speed={1.6} />
        </mesh>
      </Float>
      <Particles kind="dot" count={160} color="#9dffd0" area={[12, 7, 6]} size={[0.02, 0.07]} lift={0.12} opacity={() => 0.4 + p() * 0.6} />
    </group>
  );
}
