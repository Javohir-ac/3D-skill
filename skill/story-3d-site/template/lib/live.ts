import { Color, Vector2, Vector3 } from "three";

// Per-frame mutable state. Written by scroll/gates/pointer, read inside
// useFrame loops. Never put this in React state — it changes every frame.
export const live = {
  /** Chapter progress 0..1 keyed by chapter id. */
  progress: {} as Record<string, number>,
  /** Index of the chapter currently on screen. */
  active: 0,
  /** Smoothed scroll velocity (px/frame-ish), useful for drift/tilt. */
  velocity: 0,
  /** Pointer in NDC (-1..1), smoothed by the camera rig (gyroscope on phones). */
  pointer: new Vector2(),
  /** Raw pointer in CSS pixels (for the custom cursor). */
  mouse: { x: -100, y: -100 },
  /** Scroll-driven curtain between chapters (0..1) and its colour. */
  boundary: { amount: 0, color: new Color("#000000"), burn: 0 },
  /** World position / scale of the hero object (camera + DOF can follow it). */
  hero: { pos: new Vector3(), scale: 1 },
  /** Values animated by gate transitions and beats (GSAP tweens these directly). */
  fx: {
    exposure: 1,
    curtain: 0,
    curtainColor: new Color("#000000"),
    flash: 0,
    flashColor: new Color("#ffffff"),
    glitch: 0,
    shatter: 0, // 0 = screen intact (covered), 1 = fully shattered away
    shatterArmed: 0, // 1 while the shatter overlay should be on screen
    charge: 0, // ring implode/explode driver: 0 idle → 0.5 imploded → 1 exploded
    rgbShift: 0,
    pulse: 0, // beat: bloom + hero glow swell
    shake: 0, // beat: camera shake amplitude
    burst: 0, // beat: incremented to emit a particle burst from the hero
    drain: 0, // colour drains to sepia/grey (0..1)
    grainBoost: 0, // extra film grain (0..1)
    burn: 0, // full-screen burn overlay coverage (0..1)
  },
};

export type LiveFx = typeof live.fx;

export function resetFx() {
  const f = live.fx;
  f.exposure = 1;
  f.curtain = 0;
  f.flash = 0;
  f.glitch = 0;
  f.shatter = 0;
  f.shatterArmed = 0;
  f.charge = 0;
  f.rgbShift = 0;
  f.pulse = 0;
  f.shake = 0;
  f.drain = 0;
  f.grainBoost = 0;
  f.burn = 0;
}
