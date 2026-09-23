"use client";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { GlassShard } from "../fx/GlassShard";
import { LightBeams } from "../fx/LightBeams";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 3 — the break: red curtain of light, the recurring object is now
// cracked and dark; shards of what it was drift around it.
export default function FractureScene(props: SceneProps) {
  const core = useRef<Mesh>(null);
  const { root, p } = useChapter(props, (p, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.25;
      core.current.rotation.x += dt * 0.1;
      core.current.scale.setScalar(0.9 + p * 0.25);
    }
  });
  return (
    <group ref={root}>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 2, 3]} intensity={40} color="#ff4040" />
      <pointLight position={[-3, -2, 1]} intensity={15} color="#ff9a6a" />
      <LightBeams color="#ff2a2a" count={8} spread={8} z={-4} />
      <mesh ref={core}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#2a0506" metalness={0.8} roughness={0.35} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={1.2} floatIntensity={1.2}>
          <group position={[Math.cos(i * 1.3) * 2.2, Math.sin(i * 2.1) * 1.2, -0.5 + (i % 2)]} scale={0.35}>
            <GlassShard seed={i + 1} tint="#ffd9d9" />
          </group>
        </Float>
      ))}
      <Particles kind="dot" count={120} color="#ff6a5a" area={[10, 6, 5]} lift={0.08} opacity={() => 0.5 + p() * 0.5} />
    </group>
  );
}
