import type { StoryConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO STORY — replace with the real brief.
// Arc: promise → dream → (gate) break → evidence → why → (gate) reveal → finale.
// One HERO object lives through every chapter and changes form:
//   liquid orb (born) → rising light (hope) → cracked (betrayal) → far & broken
//   (evidence) → tiny core (resolve) → explodes into light (gate) → beacon (product).
// Something happens every ~10–15% of each chapter: a line, a beat, a camera move.
// ─────────────────────────────────────────────────────────────────────────────

const MINT = "#29d38a";
const MINT_LIGHT = "#9dffd0";
const RED = "#ff3b2f";

export const story: StoryConfig = {
  brand: "Aurora",
  description: "Aurora — a demo storytelling site built with the story-3d-site template.",
  cta: { label: "Join the waitlist", href: "#join" },

  chapters: [
    {
      id: "promise",
      title: "The promise",
      length: 2.6,
      scene: "intro",
      background: "#a9c9bc",
      grade: { exposure: 0.94, saturation: 1.0, contrast: 1.02, tint: "#bff5dc", tintAmount: 0.06, bloom: 0.55, vignette: 0.35, grain: 0.05 },
      boundary: "#2c4a41",
      hero: [
        { at: 0, pos: [0, 0, 0], scale: 0.55, noise: 0.35, color: MINT, accent: MINT_LIGHT, glow: 0.1, spin: 0.25 },
        { at: 0.5, pos: [0, 0.1, 0], scale: 0.9, noise: 0.28, glow: 0.2 },
        { at: 1, pos: [-0.9, 0.3, 0], scale: 0.7, noise: 0.18, glow: 0.35 },
      ],
      camera: [
        { at: 0, pos: [0, 0, 8.5], look: [0, 0, 0], fov: 32 },
        { at: 0.5, pos: [0.6, 0.2, 6], look: [0, 0.05, 0] },
        { at: 1, pos: [-0.4, 0.4, 5.2], look: [-0.6, 0.25, 0], fov: 36 },
      ],
      beats: [
        { at: 0.18, fx: "pulse" },
        { at: 0.42, fx: "burst" },
        { at: 0.7, fx: "pulse", strength: 0.7 },
      ],
      lines: [
        { text: "You were *T*old", style: "serif", size: "xxl", at: [0, 0.3], anchor: "center", tag: "h1" },
        { text: "since you were small", style: "mono", size: "sm", at: [0.1, 0.3], anchor: "bottom" },
        { text: "that *S*omeday", style: "serif", size: "xl", at: [0.36, 0.95], anchor: "tl", tag: "h2" },
        { text: "there would be *T*ime", style: "serif", size: "xl", at: [0.55, 0.95], anchor: "br" },
      ],
    },
    {
      id: "dream",
      title: "The dream",
      length: 2.8,
      scene: "dream",
      background: "#8fb3c4",
      grade: { exposure: 0.92, saturation: 0.95, contrast: 1.02, tint: "#ffe3ee", tintAmount: 0.05, bloom: 0.45, vignette: 0.35, grain: 0.05 },
      gate: { type: "hold", at: 0.9, label: "Hold", transition: "breakToDark", xp: 100 },
      hero: [
        { at: 0, pos: [-0.9, 0.3, 0], scale: 0.7, noise: 0.18, glow: 0.35, color: MINT, accent: MINT_LIGHT },
        { at: 0.5, pos: [-0.8, 0.15, 0.3], scale: 0.42, noise: 0.12, glow: 0.8, glass: 0.25 },
        { at: 0.9, pos: [-0.25, 0, 0.6], scale: 0.3, noise: 0.08, glow: 1.3, glass: 0.4 },
      ],
      camera: [
        { at: 0, pos: [-0.4, 0.4, 5.2], look: [-0.6, 0.25, 0], fov: 36 },
        { at: 0.45, pos: [0.5, -0.2, 4.6], look: [0, 0.1, 0] },
        { at: 0.9, pos: [0.1, 0, 3.4], look: [0, 0, 0.5], fov: 30 },
      ],
      beats: [
        { at: 0.12, fx: "pulse", strength: 0.6 },
        { at: 0.33, fx: "burst", strength: 0.7 },
        { at: 0.58, fx: "flash", strength: 0.6 },
        { at: 0.8, fx: "pulse" },
      ],
      lines: [
        { text: "for the *T*rip", style: "serif", size: "xl", at: [0.03, 0.26], anchor: "tl", tag: "h2" },
        { text: "the *B*ook", style: "serif", size: "xl", at: [0.24, 0.46], anchor: "br" },
        { text: "the *P*eople", style: "serif", size: "xl", at: [0.44, 0.64], anchor: "tr" },
        { text: "the *L*ife", style: "serif", size: "xxl", at: [0.64, 0.88], anchor: "center" },
      ],
    },
    {
      id: "break",
      title: "The break",
      length: 2,
      scene: "fracture",
      background: "#1a0203",
      grade: { exposure: 1.0, saturation: 1.15, contrast: 1.12, tint: "#ff1a1a", tintAmount: 0.35, bloom: 1.2, vignette: 0.55, grain: 0.12 },
      hero: [
        { at: 0, pos: [1.25, -0.05, -0.4], scale: 0.8, noise: 0.05, crack: 1, glow: 0, glass: 0, color: "#3a0b0b", accent: RED, spin: 0.15 },
        { at: 1, pos: [1.1, 0.05, -0.2], scale: 1.0, noise: 0.04, crack: 1, spin: 0.1 },
      ],
      camera: [
        { at: 0, pos: [0.3, 0, 4.8], look: [0.5, 0, 0], fov: 38 },
        { at: 0.5, pos: [1.2, -0.3, 4.4], look: [0.7, 0, 0] },
        { at: 1, pos: [-0.4, 0.4, 5], look: [0.5, 0, 0], fov: 34 },
      ],
      beats: [
        { at: 0.08, fx: "shake", strength: 0.8 },
        { at: 0.4, fx: "shake" },
        { at: 0.72, fx: "pulse" },
      ],
      lines: [
        { text: "*B*ut.", style: "serif", size: "xxl", at: [0, 0.3], anchor: "left", tag: "h2" },
        { text: "Someday never *C*omes", style: "serif", size: "xl", at: [0.36, 0.72], anchor: "left" },
        { text: "It gets postponed. Again.", style: "mono", size: "sm", at: [0.72, 1], anchor: "bl" },
      ],
    },
    {
      id: "evidence",
      title: "The evidence",
      length: 3.4,
      scene: "evidence",
      background: "#170203",
      grade: { exposure: 1.0, saturation: 1.1, contrast: 1.1, tint: "#ff2020", tintAmount: 0.3, bloom: 1.0, vignette: 0.55, grain: 0.12 },
      boundary: "black",
      hero: [
        { at: 0, pos: [0, 0, -2.5], scale: 0.7, crack: 1, color: "#3a0b0b", accent: RED, spin: 0.08 },
        { at: 0.6, pos: [0.4, -0.2, -5], scale: 0.5, crack: 1 },
        { at: 1, pos: [0, 0, -7], scale: 0.3, crack: 1, glow: 0.2 },
      ],
      camera: [
        { at: 0, pos: [0, 0, 6], look: [0, 0, -2], fov: 36 },
        { at: 0.5, pos: [-0.6, 0.3, 5.2], look: [0.2, 0, -3] },
        { at: 1, pos: [0.3, -0.2, 4.4], look: [0, 0, -5], fov: 32 },
      ],
      beats: [
        { at: 0.1, fx: "shake", strength: 0.6 },
        { at: 0.38, fx: "shake", strength: 0.6 },
        { at: 0.6, fx: "flash", strength: 0.5 },
        { at: 0.66, fx: "pulse" },
      ],
      lines: [
        { text: "4h 37m", style: "serif", size: "xxl", at: [0.02, 0.3], anchor: "tl", tag: "h2" },
        { text: "average daily screen time", style: "sans", size: "sm", at: [0.02, 0.3], anchor: "tl", source: { label: "replace with a real source", href: "#" } },
        { text: "62%", style: "serif", size: "xxl", at: [0.32, 0.6], anchor: "br" },
        { text: "say they have no time for what matters", style: "sans", size: "sm", at: [0.32, 0.6], anchor: "br", source: { label: "replace with a real source", href: "#" } },
        { text: "*O*ne life", style: "serif", size: "xxl", at: [0.64, 0.84], anchor: "center" },
        { text: "burning, one notification at a time", style: "mono", size: "sm", at: [0.72, 0.98], anchor: "bottom" },
      ],
    },
    {
      id: "why",
      title: "Why we exist",
      length: 2,
      scene: "charge",
      background: "#030605",
      grade: { exposure: 1.0, saturation: 1.0, contrast: 1.05, tint: "#35ff9a", tintAmount: 0.12, bloom: 1.6, vignette: 0.5, grain: 0.1 },
      gate: { type: "hold", at: 0.82, label: "Hold", transition: "implodeToLight", xp: 100 },
      hero: [
        { at: 0, pos: [0, 0, 0], scale: 0.02, crack: 0, glow: 2, noise: 0, glass: 0, color: "#ffffff", accent: "#39ff9f", spin: 1 },
        { at: 0.4, pos: [0, 0, 0], scale: 0.09, glow: 3 },
        { at: 1, pos: [0, 0, 0], scale: 0.11, glow: 3.5 },
      ],
      camera: [
        { at: 0, pos: [0, 0, 9], look: [0, 0, 0], fov: 34 },
        { at: 0.82, pos: [0, 0.25, 4.6], look: [0, 0, 0], fov: 38 },
      ],
      beats: [
        { at: 0.2, fx: "pulse", strength: 0.6 },
        { at: 0.45, fx: "pulse", strength: 0.8 },
        { at: 0.65, fx: "burst", strength: 0.6 },
      ],
      lines: [
        { text: "and that's *W*hy", style: "serif", size: "xl", at: [0.08, 1], anchor: "tl", tag: "h2" },
        { text: "we had to *E*xist", style: "serif", size: "xl", at: [0.3, 1], anchor: "br" },
      ],
    },
    {
      id: "reveal",
      title: "Introducing",
      length: 3.2,
      scene: "reveal",
      background: "#8eaebd",
      grade: { exposure: 0.95, saturation: 1.0, contrast: 1.02, tint: "#dff2ff", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04 },
      boundary: "cut",
      camera: [
        { at: 0, pos: [0, 0, 6], look: [0, 0, -2], fov: 40 },
        { at: 0.6, pos: [0, 0.8, 5.5], look: [0, -0.6, -6] },
        { at: 1, pos: [0, 1.6, 5], look: [0, -1.4, -8], fov: 34 },
      ],
      beats: [
        { at: 0.22, fx: "flash", strength: 0.35 },
        { at: 0.5, fx: "pulse", strength: 0.5 },
      ],
      lines: [
        { text: "*I*ntroducing", style: "serif", size: "xl", at: [0, 0.24], anchor: "center", tag: "h2" },
        { text: "Aurora", style: "sans", size: "xxl", at: [0.24, 0.48], anchor: "center", tag: "h2" },
        { text: "where time gets *R*eal", style: "serif", size: "xl", at: [0.5, 0.7], anchor: "center" },
        { text: "*R*eal hours", style: "serif", size: "lg", at: [0.7, 0.86], anchor: "tl" },
        { text: "back to *Y*ou", style: "serif", size: "lg", at: [0.78, 1], anchor: "br" },
      ],
    },
    {
      id: "finale",
      title: "Explore",
      length: 1.4,
      scene: "finale",
      background: "#0d1512",
      grade: { exposure: 1.0, saturation: 1.05, contrast: 1.0, tint: "#9dffd0", tintAmount: 0.05, bloom: 0.9, vignette: 0.35, grain: 0.05 },
      hero: [{ at: 0, pos: [0, 0.9, 0], scale: 0.28, noise: 0.15, crack: 0, glow: 1.2, glass: 0.55, color: MINT, accent: MINT_LIGHT, spin: 0.4 }],
      camera: [
        { at: 0, pos: [0, 0.8, 7.5], look: [0, -0.3, 0], fov: 38 },
        { at: 1, pos: [0.6, 1.2, 6.6], look: [0, -0.4, 0] },
      ],
      beats: [{ at: 0.15, fx: "burst", strength: 0.8 }],
      lines: [
        { text: "Pick your first *H*our", style: "serif", size: "lg", at: [0.05, 1], anchor: "top", tag: "h2" },
      ],
    },
  ],

  hotspots: [
    { id: "read", label: "Read", position: [-2.2, 0.6, 0], title: "Read again", body: "Twenty focused minutes a day, protected by Aurora.", tags: ["Books", "Focus"], cta: { label: "Start", href: "#join" } },
    { id: "move", label: "Move", position: [2.1, -0.4, 0.4], title: "Move again", body: "A daily walk that no notification can interrupt.", tags: ["Health"], cta: { label: "Start", href: "#join" } },
    { id: "make", label: "Make", position: [0.2, 1.4, -0.6], title: "Make again", body: "One hour a week for the thing you keep postponing.", tags: ["Craft", "Music"], cta: { label: "Start", href: "#join" } },
  ],
};
