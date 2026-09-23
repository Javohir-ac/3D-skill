"use client";
import { useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { range } from "@/lib/math";
import { Particles } from "../fx/Particles";
import { SegmentedRings } from "../fx/SegmentedRings";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 5 — "why we exist". The hero has collapsed into a tiny core of light;
// the segmented ring device assembles around it and waits for the hold.
// Implode → explode is driven by live.fx.charge (gate transition).
export default function ChargeScene(props: SceneProps) {
  const rings = useRef<Group>(null);
  const { root, p } = useChapter(props, () => {
    if (rings.current) rings.current.position.copy(live.hero.pos);
  });
  return (
    <group ref={root}>
      <Particles kind="dot" count={260} color="#cfffe6" area={[16, 10, 10]} size={[0.01, 0.035]} lift={0.02} sway={0.05} seed={21} />
      <group ref={rings}>
        <SegmentedRings color="#39ff9f" core={false} visible={() => range(p(), 0.12, 0.45)} />
      </group>
    </group>
  );
}
