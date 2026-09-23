"use client";
import { useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { range } from "@/lib/math";
import { GlassShard } from "../fx/GlassShard";
import { LightBeams } from "../fx/LightBeams";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 3 — the break. The hero is now cracked (glowing fissures, set in
// story.config hero keys). Shards of what it was orbit it and drift outwards.
const SHARDS = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2, r: 1.5 + (i % 3) * 0.35, y: ((i % 4) - 1.5) * 0.4, seed: i + 1, s: 0.22 + (i % 3) * 0.08 }));

export default function FractureScene(props: SceneProps) {
  const orbit = useRef<Group>(null);
  const shards = useRef<(Group | null)[]>([]);
  const { root, p } = useChapter(props, (p, dt, t) => {
    if (orbit.current) {
      orbit.current.position.copy(live.hero.pos);
      orbit.current.rotation.y += dt * 0.25;
    }
    const drift = range(p, 0.3, 1);
    SHARDS.forEach((s, i) => {
      const g = shards.current[i];
      if (!g) return;
      const r = s.r + drift * 1.2;
      g.position.set(Math.cos(s.a) * r, s.y + Math.sin(t * 0.7 + i) * 0.12, Math.sin(s.a) * r);
      g.rotation.x += dt * 0.4;
      g.rotation.z += dt * 0.25;
    });
  });
  return (
    <group ref={root}>
      <LightBeams color="#ff2a2a" count={8} spread={8} z={-4} opacity={() => range(p(), 0, 0.25)} />
      <group ref={orbit}>
        {SHARDS.map((s, i) => (
          <group key={i} ref={(el) => { shards.current[i] = el; }} scale={s.s}>
            <GlassShard seed={s.seed} tint="#ffd9d9" />
          </group>
        ))}
      </group>
      <pointLight position={[0, 2, 3]} intensity={40} color="#ff4040" />
      <Particles kind="dot" count={140} color="#ff6a5a" area={[10, 6, 5]} lift={0.08} opacity={() => 0.4 + p() * 0.6} />
      <Particles kind="dot" count={50} color="#ffb08a" area={[5, 5, 3]} lift={0.45} sway={0.15} opacity={() => range(p(), 0.5, 0.8)} seed={17} />
    </group>
  );
}
