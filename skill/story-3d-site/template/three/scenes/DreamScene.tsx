"use client";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import { live } from "@/lib/live";
import { range, smoothstep } from "@/lib/math";
import { CloudField } from "../fx/CloudField";
import { HandModel, SKIN } from "../fx/HandModel";
import { Particles } from "../fx/Particles";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 2 — the dream. The orb ("Time") drifts in a soft sky; a human hand
// slides in from the right and reaches for it (Michelangelo, our way). The
// fingertip is a breath away from the orb exactly when the gate appears.
const HAND_SCALE = 0.7;
const FINGER_REACH = 1.95 * HAND_SCALE; // wrist → index fingertip, in world units

export default function DreamScene(props: SceneProps) {
  const hand = useRef<Group>(null);
  const { root, p } = useChapter(props, (p, _dt, t) => {
    if (!hand.current) return;
    const h = live.hero.pos;
    const enter = smoothstep(0.04, 0.3, p); // slides in from off-screen right
    const gap = 2.4 - smoothstep(0.1, 0.88, p) * 2.28; // fingertip ↔ orb surface
    const orbR = live.hero.scale;
    const x = h.x + orbR + gap + FINGER_REACH + (1 - enter) * 4;
    hand.current.position.set(x, h.y - 0.05 + Math.sin(t * 0.9) * 0.03, h.z);
    // the wrist lifts a little as it gets closer — longing, not grabbing
    hand.current.rotation.z = -0.08 + smoothstep(0.5, 0.9, p) * 0.1;
  });
  return (
    <group ref={root}>
      <CloudField dive={() => p() * 0.35} speed={0.6} seed={2} color="#e3eaee" />
      <Particles kind="petal" color="#fff3df" count={80} area={[12, 7, 5]} size={[0.07, 0.16]} lift={-0.25} sway={0.6} spin={1.2} seed={5} opacity={() => range(p(), 0.2, 0.45)} />
      {/* soft key + sky fill for the sculpted hand (the orb is self-lit) */}
      <hemisphereLight args={["#eef6ff", "#8aa3a0", 1.2]} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} color="#fff3e8" />
      <group ref={hand}>
        {/* fingers → world -X (reaching left); palm turned down and slightly to camera */}
        <group rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2 - 0.45, 0]}>
            <Suspense fallback={null}>
              <HandModel pose="reach" tone={SKIN} scale={HAND_SCALE} rotation={[0, Math.PI, 0]} />
            </Suspense>
          </group>
        </group>
      </group>
    </group>
  );
}
