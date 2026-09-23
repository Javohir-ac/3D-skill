"use client";
import { range } from "@/lib/math";
import { Particles } from "../fx/Particles";
import { SegmentedRings } from "../fx/SegmentedRings";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 5 — "why we exist": empty dark space, a segmented ring device appears
// and waits for the hold. The implode → explode is driven by live.fx.charge.
export default function ChargeScene(props: SceneProps) {
  const { root, p } = useChapter(props);
  return (
    <group ref={root}>
      <Particles kind="dot" count={220} color="#cfffe6" area={[16, 10, 10]} size={[0.01, 0.035]} lift={0.02} sway={0.05} seed={21} />
      <SegmentedRings color="#39ff9f" visible={() => range(p(), 0.15, 0.4)} />
    </group>
  );
}
