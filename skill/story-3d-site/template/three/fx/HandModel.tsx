"use client";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import { type Group, type Mesh, MeshMatcapMaterial } from "three";
import { makeMatcapTexture } from "./textures";

// Procedural hands generated with Blender (tools/models/hand.py), compressed
// with gltf-transform (meshopt — decoder ships with three, no CDN).
// Model space: the hand points +Y, the palm faces +Z, forearm runs down -Y,
// palm centre ≈ (0, 0.5, 0), fingertips reach y ≈ 2.
export type HandPose = "reach" | "open" | "point" | "fist";

const url = (pose: HandPose) => `/models/hand_${pose}.glb`;

export interface HandProps {
  pose: HandPose;
  /** Matcap colours (see makeMatcapTexture). */
  tone?: { base?: string; light?: string; rim?: string; dark?: string };
  opacity?: number;
}

export const HandModel = forwardRef<Group, HandProps & Omit<ThreeElements["group"], "ref">>(function HandModel(
  { pose, tone, opacity = 1, ...group },
  ref,
) {
  const gltf = useGLTF(url(pose), false, true);
  const material = useMemo(
    () => new MeshMatcapMaterial({ matcap: makeMatcapTexture(tone), transparent: opacity < 1, opacity }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tone?.base, tone?.light, tone?.rim, tone?.dark, opacity],
  );
  // Clone the whole node tree: meshopt quantization stores the real scale /
  // offset in the NODE transform, so taking only the geometry would shrink and
  // shift the model.
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      if ((o as Mesh).isMesh) (o as Mesh).material = material;
    });
    return root;
  }, [gltf, material]);
  return (
    <group ref={ref} {...group}>
      {/* glTF export turns Blender's Z-up into Y-up (fingers +Y → -Z); rotate back
          so the documented convention holds: fingers +Y, palm faces +Z */}
      <primitive object={scene} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
});

/** Warm skin-like matcap for the human hand. */
export const SKIN = { base: "#e9bca2", light: "#fff4ec", rim: "#ffe3d2", dark: "#8a5a45" };
/** Cool mint "divine / digital" matcap (the story's accent colour). */
export const MINT_CLAY = { base: "#4fcf98", light: "#eafff5", rim: "#b8ffe0", dark: "#0b3a2a" };

HandModel.displayName = "HandModel";
(["reach", "open", "point", "fist"] as HandPose[]).forEach((p) => useGLTF.preload(url(p), false, true));
