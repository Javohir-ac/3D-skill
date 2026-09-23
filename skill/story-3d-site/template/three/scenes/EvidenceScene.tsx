"use client";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { range } from "@/lib/math";
import { BurnPlane } from "../fx/BurnPlane";
import { GlassShard } from "../fx/GlassShard";
import { LightBeams } from "../fx/LightBeams";
import { Particles } from "../fx/Particles";
import { makeCalendarTexture } from "../fx/textures";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 4 — evidence: glass shards sweep past the camera (each one carries a
// statistic in the HTML layer), then a "calendar page" burns away.
const SHARDS = [
  { x: -1.6, y: 0.7, seed: 11, at: 0.0 },
  { x: 1.7, y: -0.6, seed: 12, at: 0.3 },
  { x: -1.2, y: -0.9, seed: 13, at: 0.15 },
  { x: 1.3, y: 1.0, seed: 14, at: 0.45 },
];

const cssFont = (v: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback;

export default function EvidenceScene(props: SceneProps) {
  const shards = useRef<(Group | null)[]>([]);
  // a calendar of crossed-out days — the "someday" that never came — burns away
  const calendar = useMemo(
    () => makeCalendarTexture({ serif: cssFont("--font-serif", "Georgia, serif"), mono: cssFont("--font-mono", "monospace") }),
    [],
  );
  const { root, p } = useChapter(props, (p, dt) => {
    SHARDS.forEach((s, i) => {
      const g = shards.current[i];
      if (!g) return;
      const t = range(p, s.at, s.at + 0.4); // each shard flies from far to past the camera
      g.position.set(s.x * (1 + t * 0.6), s.y * (1 + t * 0.4), -8 + t * 13);
      g.rotation.z += dt * 0.2;
      g.rotation.y = Math.sin(p * 6 + i) * 0.5;
    });
  });
  return (
    <group ref={root}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 1, 3]} intensity={35} color="#ff5050" />
      <LightBeams color="#ff2a2a" count={9} spread={9} z={-6} />
      {SHARDS.map((s, i) => (
        <group key={i} ref={(el) => { shards.current[i] = el; }} scale={0.8}>
          <GlassShard seed={s.seed} tint="#ffe2e2" />
        </group>
      ))}
      <group position={[0, 0, -1.5]} rotation={[0, 0, -0.06]}>
        <BurnPlane burn={() => range(p(), 0.62, 0.95)} map={calendar} size={[1.5, 1.875]} />
      </group>
      <Particles kind="dot" count={90} color="#ffa04a" area={[8, 6, 4]} lift={0.5} sway={0.2} opacity={() => range(p(), 0.6, 0.75)} seed={9} />
    </group>
  );
}
