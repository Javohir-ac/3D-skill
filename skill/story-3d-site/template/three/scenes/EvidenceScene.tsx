"use client";
import { useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import { range } from "@/lib/math";
import { story } from "@/story/story.config";
import { BurnPlane } from "../fx/BurnPlane";
import { GlassShard } from "../fx/GlassShard";
import { LightBeams } from "../fx/LightBeams";
import { Particles } from "../fx/Particles";
import { makeCalendarTexture, makeStatTexture } from "../fx/textures";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 4 — evidence. Each statistic is written on a slab of broken glass
// that flies out of the dark, hovers readable in front of the camera, then
// rushes past; afterwards a calendar of crossed-out days burns away.

const cssFont = (v: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback;

// flight paths (side, height) for up to 4 stat shards
const PATHS = [
  { x: -1.3, y: 0.45, seed: 11, tilt: 0.12 },
  { x: 1.35, y: -0.35, seed: 12, tilt: -0.1 },
  { x: -1.1, y: -0.5, seed: 13, tilt: 0.08 },
  { x: 1.2, y: 0.55, seed: 14, tilt: -0.14 },
];

export default function EvidenceScene(props: SceneProps) {
  const stats = useMemo(() => story.chapters[props.index].stats ?? [], [props.index]);
  const shards = useRef<(Group | null)[]>([]);
  const fonts = useMemo(
    () => ({ serif: cssFont("--font-serif", "Georgia, serif"), sans: cssFont("--font-sans", "sans-serif"), mono: cssFont("--font-mono", "monospace") }),
    [],
  );
  const calendar = useMemo(() => makeCalendarTexture(fonts), [fonts]);
  const statTex = useMemo(() => stats.map((s) => makeStatTexture(s.value, s.label, fonts)), [stats, fonts]);
  // stats share the first ~60% of the chapter; each flies through its own window
  const win = (i: number) => {
    const span = 0.6 / Math.max(1, stats.length);
    return [i * span, i * span + span * 1.5] as const;
  };

  const { root, p } = useChapter(props, (p, _dt, t) => {
    stats.forEach((_, i) => {
      const g = shards.current[i];
      if (!g) return;
      const [a, b] = win(i);
      const k = range(p, a, b);
      const path = PATHS[i % PATHS.length];
      // approach fast, linger readable around the middle of the window, rush past
      const hover = k < 0.5 ? 0.5 - Math.pow(0.5 - k, 1.6) * 1.5 : k;
      g.position.set(path.x * (0.55 + k * 0.9), path.y * (0.7 + k * 0.6), -9 + hover * 13.5);
      g.rotation.set(Math.sin(t * 0.6 + i) * 0.08, Math.sin(t * 0.4 + i) * 0.18 - path.x * 0.12, path.tilt + Math.sin(t * 0.3 + i) * 0.03);
      g.visible = k > 0 && k < 1;
    });
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 1, 3]} intensity={35} color="#ff5050" />
      <LightBeams color="#ff2a2a" count={9} spread={9} z={-6} />
      {stats.map((s, i) => (
        <group key={s.value} ref={(el) => { shards.current[i] = el; }}>
          <group scale={[1.55, 1.2, 1]}>
            <GlassShard seed={PATHS[i % PATHS.length].seed} tint="#ffe6e6" />
          </group>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[2.2, 1.375]} />
            <meshBasicMaterial map={statTex[i]} transparent depthWrite={false} side={DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <group position={[0, 0, -1.5]} rotation={[0.12, -0.4, -0.06]}>
        <BurnPlane burn={() => range(p(), 0.62, 0.95)} curl={() => 0.55 + range(p(), 0.45, 0.9) * 0.45} map={calendar} size={[1.5, 1.875]} />
      </group>
      <Particles kind="dot" count={90} color="#ffa04a" area={[8, 6, 4]} lift={0.5} sway={0.2} opacity={() => range(p(), 0.6, 0.75)} seed={9} />
    </group>
  );
}
