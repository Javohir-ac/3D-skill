"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { sampleKeys } from "@/lib/keys";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import type { CameraKey } from "@/story/types";

// Camera choreography. Each chapter defines camera keys along its progress;
// the camera is always gliding toward the sampled target (never static), and
// beats can add shake. Scroll = playhead of a continuous "one-shot" film.
const DEFAULT: CameraKey = { at: 0, pos: [0, 0, 6], look: [0, 0, 0], fov: 35 };

export function CameraDirector() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const reduced = useStory((s) => s.reducedMotion);
  const look = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const pos = useMemo(() => new Vector3(0, 0, 6), []);

  useFrame((state, dt) => {
    const ch = story.chapters[live.active];
    const p = live.progress[ch.id] ?? 0;
    const k = ch.camera?.length ? sampleKeys(ch.camera, p) : DEFAULT;
    const L = reduced ? 8 : 2.6;
    const tp = k.pos;
    const tl = k.look ?? [0, 0, 0];
    pos.set(damp(pos.x, tp[0], L, dt), damp(pos.y, tp[1], L, dt), damp(pos.z, tp[2], L, dt));
    lookTarget.set(tl[0], tl[1], tl[2]);
    look.lerp(lookTarget, 1 - Math.exp(-L * dt));

    // idle "breathing" handheld drift + beat shake
    const t = state.clock.elapsedTime;
    const breathe = reduced ? 0 : 0.035;
    const sh = live.fx.shake * (reduced ? 0 : 1);
    camera.position.set(
      pos.x + Math.sin(t * 0.6) * breathe + (Math.random() - 0.5) * sh * 0.12,
      pos.y + Math.sin(t * 0.8 + 1.3) * breathe + (Math.random() - 0.5) * sh * 0.12,
      pos.z,
    );
    camera.lookAt(look);
    const fov = k.fov ?? 35;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = damp(camera.fov, fov, L, dt);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
