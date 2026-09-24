"use client";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { range, smoothstep } from "@/lib/math";
import { GlassShard } from "../fx/GlassShard";
import { HandModel } from "../fx/HandModel";
import { LightBeams } from "../fx/LightBeams";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 3 — the break. The hero is now cracked (glowing fissures, set in
// story.config hero keys). Shards of what it was orbit it and drift outwards.
// The same human hand from the dream now reaches UP from the dark toward the
// broken orb — and never gets there (the longing has turned to loss).
const RED_SKIN = { base: "#c9706a", light: "#ffd2c6", rim: "#ff8a78", dark: "#3a0606" };
const HAND_SCALE = 0.8;
const SHARDS = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2, r: 1.5 + (i % 3) * 0.35, y: ((i % 4) - 1.5) * 0.4, seed: i + 1, s: 0.22 + (i % 3) * 0.08 }));

export default function FractureScene(props: SceneProps) {
  const orbit = useRef<Group>(null);
  const shards = useRef<(Group | null)[]>([]);
  const hand = useRef<Group>(null);
  const { root, p } = useChapter(props, (p, dt, t) => {
    if (orbit.current) {
      orbit.current.position.copy(live.hero.pos);
      orbit.current.rotation.y += dt * 0.25;
    }
    if (hand.current) {
      const h = live.hero.pos;
      // rises from below the frame, stretches, then sinks back a little: it can't reach
      const rise = smoothstep(0.02, 0.45, p) - smoothstep(0.7, 1, p) * 0.35;
      // frame bottom ≈ y -1.6 here; fingertips (≈ +1.55 above the wrist) stop just under the orb
      hand.current.position.set(h.x - 1.35, -3.7 + rise * 1.9 + Math.sin(t * 0.8) * 0.03, h.z + 0.6);
      hand.current.rotation.set(-0.2, 0.35, -0.42 - rise * 0.08); // fingers lean toward the orb
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
            <GlassShard seed={s.seed} tint="#ffd9d9" edge="#ff9a8a" opacity={0.28} edgeOpacity={0.3} />
          </group>
        ))}
      </group>
      <pointLight position={[0, 2, 3]} intensity={40} color="#ff4040" />
      {/* cool rim from the side so the sculpted hand separates from the red dark */}
      <directionalLight position={[-4, 1, 2]} intensity={1.6} color="#ffd9cf" />
      <Suspense fallback={null}>
        <HandModel ref={hand} pose="open" tone={RED_SKIN} scale={HAND_SCALE} />
      </Suspense>
      <Particles kind="dot" count={140} color="#ff6a5a" area={[10, 6, 5]} lift={0.08} opacity={() => 0.4 + p() * 0.6} />
      <Particles kind="dot" count={50} color="#ffb08a" area={[5, 5, 3]} lift={0.45} sway={0.15} opacity={() => range(p(), 0.5, 0.8)} seed={17} />
    </group>
  );
}
