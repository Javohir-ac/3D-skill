"use client";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction, type BloomEffect, type ChromaticAberrationEffect, type NoiseEffect, type VignetteEffect } from "postprocessing";
import { useMemo, useRef } from "react";
import { Color, Vector2 } from "three";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { story } from "@/story/story.config";
import { ColorGradeEffect } from "./ColorGradeEffect";

// Chapter grades are damped toward the active chapter every frame, so plain
// scroll crossings blend smoothly; gate transitions layer curtain/flash/glitch on top.
const defaults = { exposure: 1, saturation: 1, contrast: 1, tintAmount: 0, bloom: 1, vignette: 0.3, grain: 0.05 };
const grades = story.chapters.map((c) => ({ ...defaults, ...c.grade, tint: new Color(c.grade.tint ?? "#ffffff") }));

export function PostFX() {
  const grade = useMemo(() => new ColorGradeEffect(), []);
  const bloom = useRef<BloomEffect>(null);
  const noise = useRef<NoiseEffect>(null);
  const vignette = useRef<VignetteEffect>(null);
  const chroma = useRef<ChromaticAberrationEffect>(null);
  const cur = useRef({ ...defaults, tint: new Color("#ffffff") });
  const offset = useMemo(() => new Vector2(), []);

  useFrame((_, dt) => {
    const g = grades[live.active] ?? grades[0];
    const c = cur.current;
    const k = 2.2;
    c.exposure = damp(c.exposure, g.exposure, k, dt);
    c.saturation = damp(c.saturation, g.saturation, k, dt);
    c.contrast = damp(c.contrast, g.contrast, k, dt);
    c.tintAmount = damp(c.tintAmount, g.tintAmount, k, dt);
    c.bloom = damp(c.bloom, g.bloom, k, dt);
    c.vignette = damp(c.vignette, g.vignette, k, dt);
    c.grain = damp(c.grain, g.grain, k, dt);
    c.tint.lerp(g.tint, 1 - Math.exp(-k * dt));

    const fx = live.fx;
    const u = (n: string) => grade.u(n);
    u("uExposure").value = c.exposure * fx.exposure;
    u("uSaturation").value = c.saturation;
    u("uContrast").value = c.contrast;
    (u("uTint").value as Color).copy(c.tint);
    u("uTintAmount").value = c.tintAmount;
    // gate curtain wins over the scroll boundary curtain
    const useFx = fx.curtain >= live.boundary.amount;
    u("uCurtain").value = Math.max(fx.curtain, live.boundary.amount);
    (u("uCurtainColor").value as Color).copy(useFx ? fx.curtainColor : live.boundary.color);
    u("uFlash").value = fx.flash;
    (u("uFlashColor").value as Color).copy(fx.flashColor);
    u("uGlitch").value = fx.glitch;

    if (bloom.current) bloom.current.intensity = c.bloom * (1 + fx.flash * 2 + fx.pulse * 1.2);
    if (noise.current) noise.current.blendMode.opacity.value = c.grain;
    if (vignette.current) vignette.current.darkness = c.vignette;
    if (chroma.current) {
      offset.set(0.004 * fx.rgbShift, 0.0015 * fx.rgbShift);
      chroma.current.offset = offset;
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={1} />
      <ChromaticAberration ref={chroma} offset={offset} radialModulation={false} modulationOffset={0} />
      <primitive object={grade} />
      <Vignette ref={vignette} eskil={false} offset={0.3} darkness={0.3} />
      <Noise ref={noise} premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.05} />
    </EffectComposer>
  );
}
