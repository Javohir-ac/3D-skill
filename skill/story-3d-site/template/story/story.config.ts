import type { StoryConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO STORY — "Tong", a specialty-coffee brand (copy in Uzbek). Replace with the real brief.
// Arc: origin → harvest → (gate) roast → evidence → why → (gate) reveal → finale.
// One HERO object lives through every chapter and changes form — here it is the
// COFFEE BEAN itself (heroShape: 1), so every chapter is a step of its life:
//   raw green bean ripening in the mountains → picked by hand in the clouds →
//   cracks in the fire ("first crack") → shelf-stale coffee burns away (evidence)
//   → a tiny glowing core (why) → bursts into light (gate) → roasted bean over the city.
// Something happens every ~10–15% of each chapter: a line, a beat, a camera move.
// ─────────────────────────────────────────────────────────────────────────────

const MINT_LIGHT = "#9dffd0";
const GREEN_BEAN = "#6fbf92"; // raw coffee really is pale green
const ROAST = "#3b1d0e";
const ROASTED = "#6a3a1b";
const EMBER = "#ff7a2f";

export const story: StoryConfig = {
  // intro variants: "frost" (chosen) · "notifications" · "draw-circle" — see types.ts → Intro
  intro: { type: "frost", prompt: "Oynaga doira chizing", hint: "muzlagan tong oynasini arting", xp: 100 },
  brand: "Tong",
  lang: "uz",
  heroShape: 1,
  description: "Tong — har kuni yangi qovurilgan qahva. story-3d-site shablonidagi demo hikoyali sayt.",
  cta: { label: "Buyurtma berish", href: "#order" },
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
      id: "promise",
      title: "Boshlanish",
      length: 2.6,
      scene: "intro",
      background: "#a9c9bc",
      backdrop: { top: "#c3dcd1", bottom: "#7fa999", accent: "#e4fff3", flow: 0.55, rays: 0.25 },
      grade: { exposure: 0.94, saturation: 1.0, contrast: 1.02, tint: "#bff5dc", tintAmount: 0.06, bloom: 0.55, vignette: 0.35, grain: 0.05, dof: 0.25, dirt: 0.5 },
      // ONE continuous shot into chapter 2: the orb ("Time") rises, the camera
      // tilts up after it and flies through the first clouds — the brief grey dip
      // at the boundary is simply the inside of a cloud.
      boundary: "#c3d3d8",
      hero: [
        { at: 0, pos: [0, 0, 0], scale: 0.55, noise: 0.35, color: GREEN_BEAN, accent: MINT_LIGHT, glow: 0.1, spin: 0.25 },
        { at: 0.5, pos: [0, 0.1, 0], scale: 0.9, noise: 0.28, glow: 0.2 },
        { at: 0.75, pos: [0, 0.5, 0], scale: 0.8, noise: 0.22, glow: 0.3 },
        { at: 1, pos: [0, 1.2, -0.5], scale: 0.7, noise: 0.18, glow: 0.4 },
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
        { text: "Hammasi bitta *D*ondan", style: "serif", size: "xxl", at: [0, 0.3], anchor: "center", tag: "h1" },
        { text: "tog‘ yonbag‘rida, 1 800 metr balandlikda", style: "mono", size: "sm", at: [0.1, 0.3], anchor: "bottom" },
        { text: "*T*o‘qqiz oy", style: "serif", size: "xl", at: [0.36, 0.95], anchor: "tl", tag: "h2" },
        { text: "quyosh va tuman *O*stida", style: "serif", size: "xl", at: [0.55, 0.95], anchor: "br" },
      ],
    },
    {
      id: "dream",
      title: "Terim",
      length: 2.8,
      scene: "dream",
      background: "#8fb3c4",
      backdrop: { top: "#a9c7d6", bottom: "#6f93a5", accent: "#ffe3ee", flow: 0.25, rays: 0.6 },
      grade: { exposure: 0.92, saturation: 0.95, contrast: 1.02, tint: "#ffe3ee", tintAmount: 0.05, bloom: 0.45, vignette: 0.35, grain: 0.05, dof: 0.5, dirt: 0.6 },
      gate: { type: "hold", at: 0.9, label: "Bosib tur", transition: "breakToDark", xp: 100 },
      hero: [
        { at: 0, pos: [0, 1.2, -0.5], scale: 0.7, noise: 0.18, glow: 0.4, color: GREEN_BEAN, accent: MINT_LIGHT },
        { at: 0.2, pos: [-0.9, 0.3, 0], scale: 0.6, noise: 0.16, glow: 0.5 },
        { at: 0.5, pos: [-0.8, 0.15, 0.3], scale: 0.42, noise: 0.12, glow: 0.6, glass: 0.1 },
        { at: 0.9, pos: [-0.25, 0, 0.6], scale: 0.3, noise: 0.08, glow: 0.9, glass: 0.15 },
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
        { at: 0.58, fx: "flash", strength: 0.6 },
        { at: 0.8, fx: "pulse" },
      ],
      lines: [
        { text: "*F*aqat pishganini", style: "serif", size: "xl", at: [0.03, 0.26], anchor: "tl", tag: "h2" },
        { text: "*Q*o‘lda", style: "serif", size: "xl", at: [0.24, 0.46], anchor: "br" },
        { text: "birma-*B*ir", style: "serif", size: "xl", at: [0.44, 0.64], anchor: "tr" },
        { text: "*T*erib olamiz", style: "serif", size: "xxl", at: [0.64, 0.88], anchor: "center" },
      ],
    },
    {
      id: "break",
      title: "Olov",
      length: 2,
      scene: "fracture",
      background: "#1a0203",
      backdrop: { top: "#2a0405", bottom: "#070000", accent: "#ff2a1a", flow: 0.5, rays: 0.3 },
      grade: { exposure: 1.0, saturation: 1.15, contrast: 1.12, tint: "#ff1a1a", tintAmount: 0.35, bloom: 1.2, vignette: 0.55, grain: 0.12, dof: 0.35, dirt: 0.8 },
      hero: [
        { at: 0, pos: [1.25, -0.05, -0.4], scale: 0.8, noise: 0.05, crack: 1, glow: 0, glass: 0, color: ROAST, accent: EMBER, spin: 0.15 },
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
        { text: "*O*lov.", style: "serif", size: "xxl", at: [0, 0.3], anchor: "left", tag: "h2" },
        { text: "220° da don *Y*oriladi", style: "serif", size: "xl", at: [0.36, 0.72], anchor: "left" },
        { text: "Qahvachilar buni «birinchi chirs» deydi.", style: "mono", size: "sm", at: [0.72, 1], anchor: "bl" },
      ],
    },
    {
      id: "evidence",
      title: "Raqamlar",
      length: 3.4,
      scene: "evidence",
      background: "#170203",
      backdrop: { top: "#240304", bottom: "#050000", accent: "#ff3a20", flow: 0.35, rays: 0.4 },
      grade: { exposure: 1.0, saturation: 1.1, contrast: 1.1, tint: "#ff2020", tintAmount: 0.3, bloom: 1.0, vignette: 0.55, grain: 0.12, dof: 0.15, dirt: 0.8 },
      boundary: "burn",
      stats: [
        { value: "12 daq", label: "qovurish — bir soniya ham ortiq emas", source: { label: "haqiqiy manba bilan almashtiring", href: "#" } },
        { value: "7 kun", label: "qovurilgandan keyingi eng yaxshi davr", source: { label: "haqiqiy manba bilan almashtiring", href: "#" } },
        { value: "2 yil", label: "tokchadagi oddiy qahvaning muddati", source: { label: "haqiqiy manba bilan almashtiring", href: "#" } },
      ],
      hero: [
        { at: 0, pos: [0, 0, -2.5], scale: 0.7, crack: 1, color: ROAST, accent: EMBER, spin: 0.08 },
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
        { text: "*T*okchada eskirgan", style: "serif", size: "xxl", at: [0.64, 0.84], anchor: "center" },
        { text: "qahva — ta’mi kuyib ketgan qahva", style: "mono", size: "sm", at: [0.72, 0.98], anchor: "bottom" },
      ],
    },
    {
      id: "why",
      title: "Nega biz",
      length: 2,
      scene: "charge",
      background: "#030605",
      backdrop: { top: "#06110c", bottom: "#010302", accent: "#1fbf74", flow: 0.35, stars: 1 },
      grade: { exposure: 1.0, saturation: 1.0, contrast: 1.05, tint: "#35ff9a", tintAmount: 0.12, bloom: 1.6, vignette: 0.5, grain: 0.1, dof: 0, dirt: 1 },
      gate: { type: "hold", at: 0.82, label: "Bosib tur", transition: "implodeToLight", xp: 100 },
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
        { text: "shuning uchun *B*iz", style: "serif", size: "xl", at: [0.08, 1], anchor: "tl", tag: "h2" },
        { text: "Tong’ni *Y*aratdik", style: "serif", size: "xl", at: [0.3, 1], anchor: "br" },
      ],
    },
    {
      id: "reveal",
      title: "Tanishing",
      length: 3.2,
      scene: "reveal",
      background: "#8eaebd",
      backdrop: { top: "#a7c4d2", bottom: "#7e9fae", accent: "#eaf6ff", flow: 0.2, rays: 0.5 },
      grade: { exposure: 0.95, saturation: 1.0, contrast: 1.02, tint: "#dff2ff", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04, dof: 0.2, dirt: 0.3 },
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
        { text: "Tong", style: "sans", size: "xxl", at: [0.24, 0.48], anchor: "center", tag: "h2" },
        { text: "har kuni *Y*angi qovurilgan", style: "serif", size: "xl", at: [0.5, 0.7], anchor: "center" },
        { text: "*S*hahringizga", style: "serif", size: "lg", at: [0.7, 0.86], anchor: "tl" },
        { text: "24 soatda *Y*etkazamiz", style: "serif", size: "lg", at: [0.78, 1], anchor: "br" },
      ],
    },
    {
      id: "finale",
      title: "Tanlang",
      length: 1.4,
      scene: "finale",
      // daylight, continuing the reveal's sky — soft mid-tones, not glaring white
      background: "#a9bfbb",
      backdrop: { top: "#bccfcc", bottom: "#8fa8a3", accent: "#e6fff4", flow: 0.25, rays: 0.3 },
      grade: { exposure: 0.95, saturation: 1.0, contrast: 1.03, tint: "#dff5ec", tintAmount: 0.04, bloom: 0.35, vignette: 0.3, grain: 0.04, dof: 0.25, dirt: 0.3 },
      hero: [{ at: 0, pos: [0, 0.9, 0], scale: 0.3, noise: 0.1, crack: 0, glow: 0.35, glass: 0, color: ROASTED, accent: "#ffc38a", spin: 0.4 }],
      camera: [
        { at: 0, pos: [0, 1.4, 9.5], look: [0, -0.6, -1.5], fov: 38 },
        { at: 1, pos: [0.8, 1.8, 8.6], look: [0, -0.7, -1.5] },
      ],
      beats: [{ at: 0.15, fx: "burst", strength: 0.8 }],
      lines: [
        { text: "Birinchi *C*hashkangizni tanlang", style: "serif", size: "lg", at: [0.05, 1], anchor: "top", tag: "h2" },
      ],
    },
  ],

  hotspots: [
    { id: "espresso", label: "Espresso", position: [-2.2, 0.6, 0], title: "Espresso", body: "25 soniya, 9 bar bosim — qalin krema va to‘q shokoladli ta’m.", tags: ["Kuchli", "Klassik"], cta: { label: "Tanlash", href: "#order" } },
    { id: "filter", label: "Filtr", position: [2.1, -0.4, 0.4], title: "Filtr qahva", body: "Sekin tomchilab tayyorlanadi: yengil, mevali va toza ta’m.", tags: ["Yengil", "Mevali"], cta: { label: "Tanlash", href: "#order" } },
    { id: "latte", label: "Latte", position: [0.2, 1.4, -0.6], title: "Latte", body: "Espresso va baxmal sut ko‘pigi — tongni yumshoq boshlash uchun.", tags: ["Sutli", "Mayin"], cta: { label: "Tanlash", href: "#order" } },
  ],
};
