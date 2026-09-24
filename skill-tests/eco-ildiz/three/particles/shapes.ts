import { rand } from "@/lib/math";

// Shape library for the particle language. Every generator returns exactly N
// points (Float32Array xyz) centred on the origin, ~4 world units wide, so any
// shape can flow into any other. 2D shapes are drawn on a canvas and sampled;
// 3D shapes are generated analytically. Add new icons in ICONS below.

export type ShapeSpec = string; // "icon:clock" | "text:62%" | "sphere" | "dust" | "aurora" | …

const W = 1024;
const H = 1024;

function canvas(w = W, h = H) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.lineJoin = "round";
  return [c, g] as const;
}

/** Sample N points from the lit pixels of a canvas, mapped to `width` world units. */
function sampleCanvas(c: HTMLCanvasElement, n: number, width = 4, depth = 0.25, seed = 1) {
  const g = c.getContext("2d")!;
  const { data } = g.getImageData(0, 0, c.width, c.height);
  const lit: number[] = [];
  for (let y = 0; y < c.height; y += 2)
    for (let x = 0; x < c.width; x += 2) if (data[(y * c.width + x) * 4 + 3] > 120) lit.push(x, y);
  const out = new Float32Array(n * 3);
  const count = lit.length / 2;
  if (!count) return out;
  const scale = width / c.width;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand(i * 7.13 + seed) * count);
    out[i * 3] = (lit[k * 2] - c.width / 2 + (rand(i + 0.3) - 0.5) * 2) * scale;
    out[i * 3 + 1] = -(lit[k * 2 + 1] - c.height / 2 + (rand(i + 0.7) - 0.5) * 2) * scale;
    out[i * 3 + 2] = (rand(i * 1.9 + seed) - 0.5) * depth;
  }
  return out;
}

// ── 2D icons (drawn in a 1024² canvas, strokes ~26px) ──────────────────────
type Draw = (g: CanvasRenderingContext2D) => void;
const ICONS: Record<string, Draw> = {
  clock(g) {
    g.lineWidth = 30;
    g.beginPath(); g.arc(512, 512, 330, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 18;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r0 = i % 3 ? 280 : 250;
      g.beginPath(); g.moveTo(512 + Math.cos(a) * r0, 512 + Math.sin(a) * r0); g.lineTo(512 + Math.cos(a) * 308, 512 + Math.sin(a) * 308); g.stroke();
    }
    g.lineWidth = 30;
    g.beginPath(); g.moveTo(512, 512); g.lineTo(512, 300); g.stroke();
    g.beginPath(); g.moveTo(512, 512); g.lineTo(660, 580); g.stroke();
    g.beginPath(); g.arc(512, 512, 26, 0, Math.PI * 2); g.fill();
  },
  hourglass(g) {
    g.lineWidth = 26;
    g.beginPath(); g.moveTo(330, 190); g.lineTo(694, 190); g.stroke();
    g.beginPath(); g.moveTo(330, 834); g.lineTo(694, 834); g.stroke();
    g.beginPath(); g.moveTo(360, 200); g.bezierCurveTo(360, 420, 500, 470, 500, 512); g.bezierCurveTo(500, 554, 360, 604, 360, 824); g.stroke();
    g.beginPath(); g.moveTo(664, 200); g.bezierCurveTo(664, 420, 524, 470, 524, 512); g.bezierCurveTo(524, 554, 664, 604, 664, 824); g.stroke();
    // sand: a little left on top, a mound below, a falling thread
    g.beginPath(); g.moveTo(430, 360); g.quadraticCurveTo(512, 400, 594, 360); g.lineTo(520, 470); g.lineTo(504, 470); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(388, 812); g.quadraticCurveTo(512, 640, 636, 812); g.closePath(); g.fill();
    g.lineWidth = 8; g.beginPath(); g.moveTo(512, 480); g.lineTo(512, 700); g.stroke();
  },
  plane(g) {
    g.beginPath();
    g.moveTo(512, 170); g.bezierCurveTo(545, 170, 552, 230, 552, 300); g.lineTo(552, 430);
    g.lineTo(860, 590); g.lineTo(860, 650); g.lineTo(552, 560); g.lineTo(552, 740);
    g.lineTo(640, 810); g.lineTo(640, 850); g.lineTo(512, 810);
    g.lineTo(384, 850); g.lineTo(384, 810); g.lineTo(472, 740); g.lineTo(472, 560);
    g.lineTo(164, 650); g.lineTo(164, 590); g.lineTo(472, 430); g.lineTo(472, 300);
    g.bezierCurveTo(472, 230, 479, 170, 512, 170); g.closePath(); g.fill();
  },
  book(g) {
    g.lineWidth = 24;
    // two pages
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(512, 330); g.bezierCurveTo(512 + s * 120, 270, 512 + s * 260, 270, 512 + s * 330, 300);
      g.lineTo(512 + s * 330, 720); g.bezierCurveTo(512 + s * 260, 690, 512 + s * 120, 690, 512, 750); g.closePath(); g.stroke();
      g.lineWidth = 12;
      for (let l = 0; l < 6; l++) {
        const y = 390 + l * 50;
        g.beginPath(); g.moveTo(512 + s * 70, y); g.quadraticCurveTo(512 + s * 170, y - 25, 512 + s * 270, y - 5); g.stroke();
      }
      g.lineWidth = 24;
    }
    g.beginPath(); g.moveTo(512, 330); g.lineTo(512, 750); g.stroke();
  },
  people(g) {
    for (const [x, s] of [[400, 1], [630, 0.9]] as const) {
      g.beginPath(); g.arc(x, 360 - (1 - s) * 60, 85 * s, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x, 640, 150 * s, 190 * s, 0, Math.PI, 0); g.lineTo(x + 150 * s, 800); g.lineTo(x - 150 * s, 800); g.closePath(); g.fill();
    }
    // a small heart between them
    g.save(); g.translate(515, 250); g.scale(0.9, 0.9);
    g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -20, -30, -70, 0, -35); g.bezierCurveTo(30, -70, 60, -20, 0, 30); g.fill();
    g.restore();
  },
  sun(g) {
    g.beginPath(); g.arc(512, 600, 190, Math.PI, 0); g.closePath(); g.fill();
    g.lineWidth = 22;
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      g.beginPath(); g.moveTo(512 + Math.cos(a) * 240, 600 + Math.sin(a) * 240); g.lineTo(512 + Math.cos(a) * 330, 600 + Math.sin(a) * 330); g.stroke();
    }
    g.lineWidth = 16;
    for (let r = 0; r < 3; r++) { g.beginPath(); g.moveTo(170 + r * 60, 650 + r * 50); g.lineTo(854 - r * 60, 650 + r * 50); g.stroke(); }
  },
  phone(g) {
    g.lineWidth = 28;
    const r = 60;
    g.beginPath(); g.roundRect(340, 150, 344, 724, r); g.stroke();
    g.lineWidth = 16; g.beginPath(); g.moveTo(470, 205); g.lineTo(554, 205); g.stroke();
    // notification pills on the screen
    for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(385, 290 + i * 120, 254, 80, 22); g.fill(); }
  },
  bell(g) {
    g.beginPath();
    g.moveTo(512, 200); g.bezierCurveTo(680, 200, 700, 360, 700, 500); g.lineTo(700, 620); g.lineTo(770, 720);
    g.lineTo(254, 720); g.lineTo(324, 620); g.lineTo(324, 500); g.bezierCurveTo(324, 360, 344, 200, 512, 200); g.closePath(); g.fill();
    g.beginPath(); g.arc(512, 770, 60, 0, Math.PI); g.fill();
    g.beginPath(); g.arc(512, 180, 34, 0, Math.PI * 2); g.fill();
    g.lineWidth = 22;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(512, 450, 330, s < 0 ? Math.PI * 1.08 : -0.42, s < 0 ? Math.PI * 1.42 : -0.08); g.stroke(); }
  },
};

function iconPoints(name: string, n: number) {
  const [c, g] = canvas();
  (ICONS[name] ?? ICONS.clock)(g);
  return sampleCanvas(c, n, 3.6, 0.3, name.length);
}

function textPoints(text: string, n: number, family: string, weight = "400") {
  const [c, g] = canvas(2048, 1024);
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 420;
  g.font = `${weight} ${size}px ${family}`;
  while (g.measureText(text).width > 1900 && size > 80) { size -= 20; g.font = `${weight} ${size}px ${family}`; }
  g.fillText(text, 1024, 540);
  return sampleCanvas(c, n, 5.2, 0.25, text.length * 3);
}

// ── 3D generators ──────────────────────────────────────────────────────────
function gen(n: number, f: (i: number, out: Float32Array) => void) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) f(i, out);
  return out;
}
const put = (o: Float32Array, i: number, x: number, y: number, z: number) => { o[i * 3] = x; o[i * 3 + 1] = y; o[i * 3 + 2] = z; };

const GEN3D: Record<string, (n: number) => Float32Array> = {
  // loose cloud of dust filling the view
  dust: (n) => gen(n, (i, o) => put(o, i, (rand(i) - 0.5) * 16, (rand(i + 0.5) - 0.5) * 9, (rand(i + 0.9) - 0.5) * 8 - 1)),
  // embers falling in a column
  embers: (n) => gen(n, (i, o) => put(o, i, (rand(i) - 0.5) * 7, (rand(i + 0.5) - 0.5) * 8, (rand(i + 0.9) - 0.5) * 3)),
  // fibonacci sphere shell
  sphere: (n) => gen(n, (i, o) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const R = 1.6 + (rand(i) - 0.5) * 0.06;
    put(o, i, Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
  }),
  // globe: sphere + latitude/longitude lines
  globe: (n) => gen(n, (i, o) => {
    const R = 1.7;
    if (i % 3 === 0) {
      const lat = (Math.floor(rand(i) * 9) / 8 - 0.5) * Math.PI;
      const lon = rand(i + 0.3) * Math.PI * 2;
      put(o, i, Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R);
    } else if (i % 3 === 1) {
      const lon = (Math.floor(rand(i) * 12) / 12) * Math.PI * 2;
      const lat = (rand(i + 0.3) - 0.5) * Math.PI;
      put(o, i, Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R);
    } else {
      const y = rand(i) * 2 - 1, th = rand(i + 0.1) * Math.PI * 2, r = Math.sqrt(1 - y * y) * R * 0.98;
      put(o, i, Math.cos(th) * r, y * R * 0.98, Math.sin(th) * r);
    }
  }),
  // everything collapsed into a tiny bright core
  core: (n) => gen(n, (i, o) => {
    const r = Math.pow(rand(i), 3) * 0.35;
    const th = rand(i + 0.2) * Math.PI * 2, ph = Math.acos(2 * rand(i + 0.4) - 1);
    put(o, i, Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r);
  }),
  // northern lights: several wavy vertical curtains
  aurora: (n) => gen(n, (i, o) => {
    const band = Math.floor(rand(i) * 4);
    const u = rand(i + 0.2) * 2 - 1;
    const x = u * 6;
    const base = -0.6 + band * 0.35;
    const h = rand(i + 0.5) ** 1.8 * (1.6 + band * 0.4);
    const z = -1.5 - band * 1.2 + Math.sin(u * 3 + band) * 0.8;
    put(o, i, x, base + h + Math.sin(u * 4 + band * 1.7) * 0.35, z);
  }),
  // flat spiral galaxy
  galaxy: (n) => gen(n, (i, o) => {
    const arm = i % 3;
    const r = Math.pow(rand(i), 0.6) * 3;
    const a = r * 1.6 + (arm / 3) * Math.PI * 2 + (rand(i + 0.3) - 0.5) * 0.5;
    put(o, i, Math.cos(a) * r, (rand(i + 0.6) - 0.5) * 0.15 * (3 - r), Math.sin(a) * r);
  }),
};

const cache = new Map<string, Float32Array>();

/** Build (and cache) the N points for a shape spec. */
export function buildShape(spec: ShapeSpec, n: number, fonts: { serif: string; sans: string }): Float32Array {
  const key = `${spec}|${n}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let pts: Float32Array;
  if (spec.startsWith("icon:")) pts = iconPoints(spec.slice(5), n);
  else if (spec.startsWith("text:")) pts = textPoints(spec.slice(5), n, fonts.serif);
  else if (spec.startsWith("word:")) pts = textPoints(spec.slice(5), n, fonts.sans, "600");
  else pts = (GEN3D[spec] ?? GEN3D.dust)(n);
  cache.set(key, pts);
  return pts;
}

export const SHAPE_NAMES = [...Object.keys(ICONS).map((k) => `icon:${k}`), ...Object.keys(GEN3D), "text:…", "word:…"];
