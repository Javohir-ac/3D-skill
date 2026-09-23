import { Color, Vector2 } from "three";

// Per-frame mutable state. Written by scroll/gates/pointer, read inside
// useFrame loops. Never put this in React state — it changes every frame.
export const live = {
  /** Chapter progress 0..1 keyed by chapter id. */
  progress: {} as Record<string, number>,
  /** Index of the chapter currently on screen. */
  active: 0,
  /** Smoothed scroll velocity (px/frame-ish), useful for drift/tilt. */
  velocity: 0,
  /** Pointer in NDC (-1..1), smoothed by the camera rig. */
  pointer: new Vector2(),
  /** Scroll-driven curtain between chapters (0..1) and its colour. */
  boundary: { amount: 0, color: new Color("#000000") },
  /** Values animated by gate transitions (GSAP tweens these directly). */
  fx: {
    exposure: 1,
    curtain: 0,
    curtainColor: new Color("#000000"),
    flash: 0,
    flashColor: new Color("#ffffff"),
    glitch: 0,
    shatter: 0, // 0 = screen intact (covered), 1 = fully shattered away
    shatterArmed: 0, // 1 while the shatter overlay should be on screen
    charge: 0,  // ring implode/explode driver: 0 idle → 0.5 imploded → 1 exploded
    rgbShift: 0,
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
}
