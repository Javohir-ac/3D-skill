import type { StoryConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO STORY — replace with the real brief.
// Arc: promise → turn (gate) → evidence → realisation → charge (gate) → reveal → finale.
// Every chapter gets its own colour world; gates are the two emotional pivots.
// ─────────────────────────────────────────────────────────────────────────────

export const story: StoryConfig = {
  brand: "Aurora",
  description: "Aurora — a demo storytelling site built with the story-3d-site template.",
  cta: { label: "Join the waitlist", href: "#join" },

  chapters: [
    {
      id: "promise",
      title: "The promise",
      length: 2.2,
      scene: "intro",
      background: "#a9c9bc",
      grade: { exposure: 0.94, saturation: 1.0, contrast: 1.02, tint: "#bff5dc", tintAmount: 0.06, bloom: 0.55, vignette: 0.35, grain: 0.05 },
      boundary: "#2c4a41",
      lines: [
        { text: "You were *T*old", style: "serif", size: "xxl", at: [0, 0.45], anchor: "center", tag: "h1" },
        { text: "that *S*omeday", style: "serif", size: "xl", at: [0.5, 0.95], anchor: "tl", tag: "h2" },
        { text: "there would be *T*ime", style: "serif", size: "xl", at: [0.62, 0.95], anchor: "br" },
      ],
    },
    {
      id: "dream",
      title: "The dream",
      length: 2.4,
      scene: "dream",
      background: "#8fb3c4",
      grade: { exposure: 0.92, saturation: 0.95, contrast: 1.02, tint: "#ffe3ee", tintAmount: 0.05, bloom: 0.45, vignette: 0.35, grain: 0.05 },
      gate: { type: "hold", at: 0.88, label: "Hold", transition: "breakToDark", xp: 100 },
      lines: [
        { text: "for the *T*rip", style: "serif", size: "xl", at: [0.05, 0.3], anchor: "tl", tag: "h2" },
        { text: "the *B*ook", style: "serif", size: "xl", at: [0.3, 0.55], anchor: "br" },
        { text: "the *L*ife", style: "serif", size: "xxl", at: [0.55, 0.86], anchor: "center" },
      ],
    },
    {
      id: "break",
      title: "The break",
      length: 1.6,
      scene: "fracture",
      background: "#1a0203",
      grade: { exposure: 1.0, saturation: 1.15, contrast: 1.12, tint: "#ff1a1a", tintAmount: 0.35, bloom: 1.2, vignette: 0.55, grain: 0.12 },
      lines: [
        { text: "*B*ut.", style: "serif", size: "xl", at: [0.0, 0.35], anchor: "center", tag: "h2" },
        { text: "Someday never *C*omes", style: "serif", size: "xxl", at: [0.38, 1.0], anchor: "center" },
      ],
    },
    {
      id: "evidence",
      title: "The evidence",
      length: 3.2,
      scene: "evidence",
      background: "#170203",
      grade: { exposure: 1.0, saturation: 1.1, contrast: 1.1, tint: "#ff2020", tintAmount: 0.3, bloom: 1.0, vignette: 0.55, grain: 0.12 },
      boundary: "black",
      lines: [
        { text: "4h 37m", style: "serif", size: "xxl", at: [0.02, 0.3], anchor: "tl", tag: "h2" },
        { text: "average daily screen time", style: "sans", size: "sm", at: [0.02, 0.3], anchor: "tl", source: { label: "replace with a real source", href: "#" } },
        { text: "62%", style: "serif", size: "xxl", at: [0.34, 0.62], anchor: "br" },
        { text: "say they have no time for what matters", style: "sans", size: "sm", at: [0.34, 0.62], anchor: "br", source: { label: "replace with a real source", href: "#" } },
        { text: "*O*ne life", style: "serif", size: "xxl", at: [0.68, 0.98], anchor: "center" },
      ],
    },
    {
      id: "why",
      title: "Why we exist",
      length: 1.8,
      scene: "charge",
      background: "#030605",
      grade: { exposure: 1.0, saturation: 1.0, contrast: 1.05, tint: "#35ff9a", tintAmount: 0.12, bloom: 1.6, vignette: 0.5, grain: 0.1 },
      gate: { type: "hold", at: 0.8, label: "Hold", transition: "implodeToLight", xp: 100 },
      lines: [
        { text: "and that's *W*hy", style: "serif", size: "xl", at: [0.08, 1.0], anchor: "tl", tag: "h2" },
        { text: "we had to *E*xist", style: "serif", size: "xl", at: [0.3, 1.0], anchor: "br" },
      ],
    },
    {
      id: "reveal",
      title: "Introducing",
      length: 3,
      scene: "reveal",
      background: "#8eaebd",
      grade: { exposure: 0.95, saturation: 1.0, contrast: 1.02, tint: "#dff2ff", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04 },
      boundary: "cut",
      lines: [
        { text: "*I*ntroducing", style: "serif", size: "xl", at: [0, 0.3], anchor: "center", tag: "h2" },
        { text: "Aurora", style: "sans", size: "xxl", at: [0.3, 0.55], anchor: "center", tag: "h2" },
        { text: "where time gets *R*eal", style: "serif", size: "xl", at: [0.58, 0.8], anchor: "center" },
        { text: "*R*eal hours, back to you", style: "serif", size: "lg", at: [0.82, 1.0], anchor: "center" },
      ],
    },
    {
      id: "finale",
      title: "Explore",
      length: 1.4,
      scene: "finale",
      background: "#0d1512",
      grade: { exposure: 1.0, saturation: 1.05, contrast: 1.0, tint: "#9dffd0", tintAmount: 0.05, bloom: 0.9, vignette: 0.35, grain: 0.05 },
      lines: [
        { text: "Pick your first *H*our", style: "serif", size: "lg", at: [0.1, 1.0], anchor: "top", tag: "h2" },
      ],
    },
  ],

  hotspots: [
    { id: "read", label: "Read", position: [-2.2, 0.6, 0], title: "Read again", body: "Twenty focused minutes a day, protected by Aurora.", tags: ["Books", "Focus"], cta: { label: "Start", href: "#join" } },
    { id: "move", label: "Move", position: [2.1, -0.4, 0.4], title: "Move again", body: "A daily walk that no notification can interrupt.", tags: ["Health"], cta: { label: "Start", href: "#join" } },
    { id: "make", label: "Make", position: [0.2, 1.4, -0.6], title: "Make again", body: "One hour a week for the thing you keep postponing.", tags: ["Craft", "Music"], cta: { label: "Start", href: "#join" } },
  ],
};
