"use client";
import { range } from "@/lib/math";
import { OrbitRings } from "../fx/OrbitRings";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 1 — the promise. The hero (lib: three/hero) is born here as a living
// liquid orb; orbits draw themselves around it one by one; dust thickens.
export default function IntroScene(props: SceneProps) {
  const { root, p } = useChapter(props);
  return (
    <group ref={root}>
      <OrbitRings appear={() => range(p(), 0.15, 0.85)} />
      <Particles kind="dot" count={180} color="#d8fff0" area={[12, 7, 6]} size={[0.015, 0.06]} lift={0.12} opacity={() => 0.3 + p() * 0.7} />
      <Particles kind="dot" count={60} color="#9dffd0" area={[6, 4, 3]} size={[0.03, 0.09]} lift={0.25} sway={0.5} opacity={() => range(p(), 0.4, 0.7)} seed={11} />
    </group>
  );
}
