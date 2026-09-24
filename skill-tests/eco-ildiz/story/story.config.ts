import type { StoryConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// "Ildiz" — a tree-planting campaign (Uzbek copy). Treatment: TREATMENT.md.
// Arc: seed → caught by a hand → (gate, fire) wildfire → evidence → why →
// (gate, light) the green city → choose where to plant.
// HERO = an ACORN (heroShape: 2): born → carried into the clouds by the wind →
// reached for by the planter's hand → cracks in the fire → small and far →
// a green core → hovers over the regrown city.
// ─────────────────────────────────────────────────────────────────────────────

const SEED = "#a87a48";
const LEAF = "#7fd67a";
const CHAR = "#2a1a10";
const FIRE = "#ff5a1f";

export const story: StoryConfig = {
  intro: { type: "frost", prompt: "Oynaga doira chizing", hint: "tumanli oynani arting", xp: 100 },
  brand: "Ildiz",
  lang: "uz",
  heroShape: 2,
  description: "Ildiz — daraxt ekish kampaniyasi: har bir ekilgan daraxt xaritada. story-3d-site skill sinovi.",
  cta: { label: "Daraxt ekish", href: "#plant" },
  ui: {
    loading: "Hikoya yuklanmoqda",
    ready: "Tayyor",
    skip: "O‘tkazib yuborish",
    almostCircle: "Deyarli — doirani yoping",
    pressHold: "Bosib turing",
    spaceKey: "Probel",
    holdAria: "{label} — davom etish uchun tugmani yoki Probelni bosib turing.",
    motionFull: "Harakat: to‘liq",
    motionReduced: "Harakat: kam",
    close: "Yopish",
    chapters: "Boblar",
    goToChapter: "{n}-bobga o‘tish: {title}",
    sources: "Manbalar",
    cursorHold: "Bosib tur",
    cursorDraw: "Chizing",
    cursorDrag: "Suring",
    cursorSwipe: "Arting",
    silenceAll: "Hammasini o‘chirish",
  },

  chapters: [
    {
      id: "seed",
      title: "Urug‘",
      length: 2.6,
      scene: "intro",
      background: "#9fb3a3",
      backdrop: { top: "#b7c9b8", bottom: "#7f9b86", accent: "#e6f5dc", flow: 0.5, rays: 0.3 },
      grade: { exposure: 0.94, saturation: 1.0, contrast: 1.03, tint: "#d8f0c8", tintAmount: 0.06, bloom: 0.5, vignette: 0.35, grain: 0.05, dof: 0.25, dirt: 0.4 },
      // continuous shot: the wind lifts the acorn, the camera follows it into the clouds
      boundary: "#c3d3cc",
      hero: [
        { at: 0, pos: [0, 0, 0], scale: 0.55, noise: 0.3, color: SEED, accent: LEAF, glow: 0.05, spin: 0.25 },
        { at: 0.5, pos: [0, 0.1, 0], scale: 0.9, noise: 0.25, glow: 0.1 },
        { at: 0.75, pos: [0, 0.5, 0], scale: 0.8, noise: 0.2, glow: 0.2 },
        { at: 1, pos: [0, 1.2, -0.5], scale: 0.7, noise: 0.18, glow: 0.3 },
      ],
      camera: [
        { at: 0, pos: [0, 0, 8.5], look: [0, 0, 0], fov: 32 },
        { at: 0.5, pos: [0.6, 0.2, 6], look: [0, 0.05, 0] },
        { at: 0.75, pos: [0.2, -0.2, 5.6], look: [0, 0.5, 0], fov: 36 },
        { at: 1, pos: [0, -0.4, 4.8], look: [0, 1.3, -0.5], fov: 40 },
      ],
      beats: [
        { at: 0.18, fx: "pulse" },
        { at: 0.42, fx: "burst" },
        { at: 0.7, fx: "pulse", strength: 0.7 },
      ],
      lines: [
        { text: "Har bir o‘rmon bitta *U*rug‘dan", style: "serif", size: "xxl", at: [0, 0.3], anchor: "center", tag: "h1" },
        { text: "bitta eman yong‘og‘i — bir asrlik daraxt", style: "mono", size: "sm", at: [0.1, 0.3], anchor: "bottom" },
        { text: "*Y*uz yil o‘sadi", style: "serif", size: "xl", at: [0.36, 0.95], anchor: "tl", tag: "h2" },
        { text: "agar kimdir *E*ksa", style: "serif", size: "xl", at: [0.55, 0.95], anchor: "br" },
      ],
    },
    {
      id: "hand",
      title: "Qo‘l",
      length: 2.8,
      scene: "dream",
      background: "#9bb8b4",
      backdrop: { top: "#b3cdc8", bottom: "#7c9c98", accent: "#f2f7e0", flow: 0.25, rays: 0.6 },
      grade: { exposure: 0.92, saturation: 0.95, contrast: 1.02, tint: "#eef6dc", tintAmount: 0.05, bloom: 0.45, vignette: 0.35, grain: 0.05, dof: 0.5, dirt: 0.5 },
      gate: { type: "hold", at: 0.9, label: "Bosib tur", transition: "burnThrough", xp: 100 },
      hero: [
        { at: 0, pos: [0, 1.2, -0.5], scale: 0.7, noise: 0.18, glow: 0.3, color: SEED, accent: LEAF },
        { at: 0.2, pos: [-0.9, 0.3, 0], scale: 0.6, noise: 0.16, glow: 0.3 },
        { at: 0.5, pos: [-0.8, 0.15, 0.3], scale: 0.42, noise: 0.12, glow: 0.4 },
        { at: 0.9, pos: [-0.25, 0, 0.6], scale: 0.3, noise: 0.08, glow: 0.6 },
      ],
      camera: [
        { at: 0, pos: [0, -0.4, 4.8], look: [0, 1.3, -0.5], fov: 40 },
        { at: 0.2, pos: [-0.4, 0.4, 5.2], look: [-0.6, 0.25, 0], fov: 36 },
        { at: 0.45, pos: [0.5, -0.2, 4.6], look: [0, 0.1, 0] },
        { at: 0.9, pos: [0.1, 0, 3.4], look: [0, 0, 0.5], fov: 30 },
      ],
      beats: [
        { at: 0.12, fx: "pulse", strength: 0.6 },
        { at: 0.33, fx: "burst", strength: 0.7 },
        { at: 0.58, fx: "flash", strength: 0.5 },
        { at: 0.8, fx: "pulse" },
      ],
      lines: [
        { text: "*K*imdir uni ushlaydi", style: "serif", size: "xl", at: [0.03, 0.3], anchor: "tl", tag: "h2" },
        { text: "*T*uproqqa", style: "serif", size: "xl", at: [0.3, 0.56], anchor: "tr" },
        { text: "*E*kadi", style: "serif", size: "xxl", at: [0.6, 0.88], anchor: "center" },
      ],
    },
    {
      id: "fire",
      title: "Olov",
      length: 2,
      scene: "fracture",
      background: "#1a0f0a",
      backdrop: { top: "#2a1208", bottom: "#070302", accent: FIRE, flow: 0.5, rays: 0.3 },
      grade: { exposure: 1.0, saturation: 1.1, contrast: 1.12, tint: FIRE, tintAmount: 0.3, bloom: 1.2, vignette: 0.55, grain: 0.12, dof: 0.35, dirt: 0.8 },
      boundary: "burn",
      hero: [
        { at: 0, pos: [1.25, -0.05, -0.4], scale: 0.8, noise: 0.05, crack: 1, glow: 0, glass: 0, color: CHAR, accent: FIRE, spin: 0.15 },
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
        { text: "*L*ekin.", style: "serif", size: "xxl", at: [0, 0.3], anchor: "left", tag: "h2" },
        { text: "o‘rmonlar *Y*onmoqda", style: "serif", size: "xl", at: [0.36, 0.72], anchor: "left" },
        { text: "Har yozda — yana va yana.", style: "mono", size: "sm", at: [0.72, 1], anchor: "bl" },
      ],
    },
    {
      id: "numbers",
      title: "Raqamlar",
      length: 3.4,
      scene: "evidence",
      background: "#15100c",
      backdrop: { top: "#241810", bottom: "#050302", accent: "#ff7a2f", flow: 0.35, rays: 0.4 },
      grade: { exposure: 1.0, saturation: 1.05, contrast: 1.1, tint: "#ff6a2a", tintAmount: 0.25, bloom: 1.0, vignette: 0.55, grain: 0.12, dof: 0.15, dirt: 0.8 },
      boundary: "black",
      stats: [
        { value: "27", label: "futbol maydoni o‘rmon har daqiqada yo‘qoladi", source: { label: "haqiqiy manba bilan almashtiring (masalan WWF)", href: "#" } },
        { value: "90%", label: "Orol dengizi suvining yo‘qolgan qismi", source: { label: "haqiqiy manba bilan almashtiring", href: "#" } },
        { value: "22 kg", label: "CO₂ ni bitta daraxt yiliga yutadi", source: { label: "haqiqiy manba bilan almashtiring", href: "#" } },
      ],
      hero: [
        { at: 0, pos: [0, 0, -2.5], scale: 0.7, crack: 1, color: CHAR, accent: FIRE, spin: 0.08 },
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
        { text: "*R*aqamlar", style: "serif", size: "lg", at: [0.0, 0.14], anchor: "tl", tag: "h2" },
        { text: "*Q*urg‘oqchilik", style: "serif", size: "xxl", at: [0.64, 0.84], anchor: "center" },
        { text: "yomg‘irsiz kunlar yildan-yilga ko‘paymoqda", style: "mono", size: "sm", at: [0.72, 0.98], anchor: "bottom" },
      ],
    },
    {
      id: "why",
      title: "Nega biz",
      length: 2,
      scene: "charge",
      background: "#050805",
      backdrop: { top: "#08120a", bottom: "#010301", accent: "#4fbf6a", flow: 0.35, stars: 1 },
      grade: { exposure: 1.0, saturation: 1.0, contrast: 1.05, tint: "#6fe08a", tintAmount: 0.12, bloom: 1.6, vignette: 0.5, grain: 0.1, dof: 0, dirt: 1 },
      gate: { type: "hold", at: 0.82, label: "Bosib tur", transition: "implodeToLight", xp: 100 },
      hero: [
        { at: 0, pos: [0, 0, 0], scale: 0.02, crack: 0, glow: 2, noise: 0, glass: 0, color: "#e8ffd8", accent: LEAF, spin: 1 },
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
        { text: "shuning uchun *B*iz", style: "serif", size: "xl", at: [0.08, 1], anchor: "tl", tag: "h2" },
        { text: "qaytadan *E*kamiz", style: "serif", size: "xl", at: [0.3, 1], anchor: "br" },
      ],
    },
    {
      id: "ildiz",
      title: "Tanishing",
      length: 3.2,
      scene: "reveal",
      background: "#9fb8b0",
      backdrop: { top: "#b8cdc6", bottom: "#88a39b", accent: "#eef8f0", flow: 0.2, rays: 0.5 },
      grade: { exposure: 0.95, saturation: 1.0, contrast: 1.02, tint: "#e2f5e0", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04, dof: 0.2, dirt: 0.3 },
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
        { text: "*T*anishing", style: "serif", size: "xl", at: [0, 0.24], anchor: "center", tag: "h2" },
        { text: "Ildiz", style: "sans", size: "xxl", at: [0.24, 0.48], anchor: "center", tag: "h2" },
        { text: "har bir daraxt — *X*aritada", style: "serif", size: "xl", at: [0.5, 0.7], anchor: "center" },
        { text: "1 000 000 *D*araxt", style: "serif", size: "lg", at: [0.7, 0.86], anchor: "tl" },
        { text: "*T*oshkent atrofida", style: "serif", size: "lg", at: [0.78, 1], anchor: "br" },
      ],
    },
    {
      id: "plant",
      title: "Tanlang",
      length: 1.4,
      scene: "finale",
      background: "#a7bba9",
      backdrop: { top: "#bfd0c0", bottom: "#8ba48f", accent: "#e8f7e4", flow: 0.25, rays: 0.3 },
      grade: { exposure: 0.95, saturation: 1.02, contrast: 1.03, tint: "#e2f5dc", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04, dof: 0.25, dirt: 0.3 },
      hero: [{ at: 0, pos: [0, 0.9, 0], scale: 0.3, noise: 0.1, crack: 0, glow: 0.35, glass: 0, color: SEED, accent: LEAF, spin: 0.4 }],
      camera: [
        { at: 0, pos: [0, 1.4, 9.5], look: [0, -0.6, -1.5], fov: 38 },
        { at: 1, pos: [0.8, 1.8, 8.6], look: [0, -0.7, -1.5] },
      ],
      beats: [{ at: 0.15, fx: "burst", strength: 0.8 }],
      lines: [
        { text: "O‘z *D*araxtingizni tanlang", style: "serif", size: "lg", at: [0.05, 1], anchor: "top", tag: "h2" },
      ],
    },
  ],

  hotspots: [
    { id: "park", label: "Bog‘", position: [-2.2, 0.6, 0], title: "Shahar bog‘iga", body: "Mahallangiz bog‘iga eman eking — har bahorda uning o‘sishini xaritada kuzating.", tags: ["Oilaviy", "Bahor"], cta: { label: "Ekish", href: "#plant" } },
    { id: "school", label: "Maktab", position: [2.1, -0.4, 0.4], title: "Maktab hovlisiga", body: "Bitta sinf — bitta daraxt. O‘quvchilar o‘zi ekadi, o‘zi parvarish qiladi.", tags: ["Bolalar", "Ta’lim"], cta: { label: "Ekish", href: "#plant" } },
    { id: "volunteer", label: "Ko‘ngilli", position: [0.2, 1.4, -0.6], title: "Ko‘ngilli bo‘lish", body: "Shanba kunlari Toshkent atrofidagi ekish aksiyalariga qo‘shiling.", tags: ["Jamoa", "Shanba"], cta: { label: "Qo‘shilish", href: "#plant" } },
  ],
};
