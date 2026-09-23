import { CanvasTexture, SRGBColorSpace, type Texture } from "three";
import { rand } from "@/lib/math";

// Procedural textures so the template runs with zero binary assets.
// Swap any of these for real images (KTX2/WebP atlases) in production.

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function finish(c: HTMLCanvasElement): Texture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** 2×2 atlas of soft cumulus sprites. Returns texture + UV rects [x, y, w, h]. */
export function makeCloudAtlas(size = 1024) {
  const [c, g] = canvas(size, size);
  const cell = size / 2;
  const rects: [number, number, number, number][] = [];
  for (let k = 0; k < 4; k++) {
    const ox = (k % 2) * cell;
    const oy = Math.floor(k / 2) * cell;
    // base: grey underside puffs (volume), then white tops shifted up
    for (let pass = 0; pass < 2; pass++) {
      const puffs = 46;
      for (let i = 0; i < puffs; i++) {
        const s = k * 1000 + i * 7 + pass * 311;
        const ang = rand(s) * Math.PI * 2;
        const rr = Math.sqrt(rand(s + 1)) * 0.36;
        const x = ox + cell / 2 + Math.cos(ang) * rr * cell * 1.1;
        const y = oy + cell / 2 + Math.sin(ang) * rr * cell * 0.42 - (pass ? cell * 0.035 : -cell * 0.02);
        const r = cell * (0.07 + rand(s + 2) * 0.12) * (1 - rr * 0.9);
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        const tone = pass ? 255 : 212;
        const a = pass ? 0.55 : 0.35;
        grd.addColorStop(0, `rgba(${tone},${tone},${tone + (pass ? 0 : 8)},${a})`);
        grd.addColorStop(0.55, `rgba(${tone},${tone},${tone},${a * 0.45})`);
        grd.addColorStop(1, `rgba(${tone},${tone},${tone},0)`);
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
    }
    // uv rect (three.js uv origin is bottom-left)
    rects.push([ox / size, 1 - (oy + cell) / size, cell / size, cell / size]);
  }
  return { texture: finish(c), rects };
}

/** Rose-petal sprite. */
export function makePetalTexture(color = "#ff9fc4") {
  const [c, g] = canvas(128, 128);
  const grd = g.createLinearGradient(20, 20, 108, 108);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(0.35, color);
  grd.addColorStop(1, "#d9477f");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(64, 8);
  g.bezierCurveTo(120, 30, 118, 96, 64, 120);
  g.bezierCurveTo(10, 96, 8, 30, 64, 8);
  g.fill();
  return finish(c);
}

/** Soft round glow sprite (sparks, stars, dust). */
export function makeDotTexture() {
  const [c, g] = canvas(64, 64);
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.6)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return finish(c);
}

/** Vertical light-beam gradient (for "curtain of light" backdrops). */
export function makeBeamTexture() {
  const [c, g] = canvas(64, 256);
  const grd = g.createLinearGradient(0, 0, 64, 0);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(0.5, "rgba(255,255,255,1)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 256);
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.3, "rgba(0,0,0,1)");
  v.addColorStop(1, "rgba(0,0,0,0)");
  g.globalCompositeOperation = "destination-in";
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 256);
  return finish(c);
}

/**
 * Procedural MATCAP (lit-sphere) texture: a sculpted "clay" look without any
 * lights — the technique Zero uses for its hands. base = mid tone, light = key
 * highlight (upper-left), rim = back-light around the silhouette, dark = core shadow.
 */
export function makeMatcapTexture({ base = "#58c79a", light = "#e9fff4", rim = "#bfffe0", dark = "#0e3b2b" } = {}) {
  const [c, g] = canvas(256, 256);
  const body = g.createRadialGradient(100, 90, 10, 128, 128, 128);
  body.addColorStop(0, light);
  body.addColorStop(0.35, base);
  body.addColorStop(0.85, dark);
  body.addColorStop(1, dark);
  g.fillStyle = body;
  g.beginPath();
  g.arc(128, 128, 128, 0, Math.PI * 2);
  g.fill();
  // rim light: bright ring hugging the edge, strongest lower-right
  const rimG = g.createRadialGradient(128, 128, 96, 128, 128, 128);
  rimG.addColorStop(0, "rgba(0,0,0,0)");
  rimG.addColorStop(0.75, "rgba(0,0,0,0)");
  rimG.addColorStop(1, rim);
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.55;
  g.fillStyle = rimG;
  g.beginPath();
  g.arc(128, 128, 128, 0, Math.PI * 2);
  g.fill();
  // small specular hotspot
  g.globalAlpha = 0.6;
  const spec = g.createRadialGradient(92, 80, 0, 92, 80, 26);
  spec.addColorStop(0, "rgba(255,255,255,1)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spec;
  g.fillRect(0, 0, 256, 256);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  return finish(c);
}

/** A paper calendar page whose days are crossed out — "someday" never arrives. */
export function makeCalendarTexture(opts: { title?: string; serif?: string; mono?: string } = {}) {
  const [c, g] = canvas(768, 960);
  const serif = opts.serif ?? "Georgia, serif";
  const mono = opts.mono ?? "monospace";
  // paper
  const paper = g.createLinearGradient(0, 0, 0, 960);
  paper.addColorStop(0, "#f3ecdd");
  paper.addColorStop(1, "#e6dcc7");
  g.fillStyle = paper;
  g.fillRect(0, 0, 768, 960);
  // binding holes
  g.fillStyle = "#b9ab90";
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(114 + i * 108, 40, 10, 0, Math.PI * 2); g.fill(); }
  // header
  g.fillStyle = "#2b1d14";
  g.font = `italic 96px ${serif}`;
  g.textAlign = "center";
  g.fillText(opts.title ?? "Someday", 384, 170);
  g.font = `600 22px ${mono}`;
  g.fillStyle = "#7a6650";
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  days.forEach((d, i) => g.fillText(d, 84 + i * 100, 250));
  // grid of days, most crossed out in red marker
  g.font = `44px ${serif}`;
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 7; k++) {
      const n = r * 7 + k + 1;
      if (n > 31) continue;
      const x = 84 + k * 100;
      const y = 330 + r * 120;
      g.strokeStyle = "rgba(43,29,20,0.18)";
      g.lineWidth = 2;
      g.strokeRect(x - 46, y - 58, 92, 110);
      g.fillStyle = "#2b1d14";
      g.fillText(String(n), x, y);
      if (rand(n * 3.3) > 0.12) {
        g.strokeStyle = "rgba(200,30,30,0.85)";
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(x - 30 + rand(n) * 6, y - 38);
        g.lineTo(x + 30, y + 30 + rand(n + 1) * 6);
        g.moveTo(x + 28, y - 36);
        g.lineTo(x - 28, y + 28);
        g.stroke();
      }
    }
  return finish(c);
}

/** A statistic for a glass shard: big serif value + wrapped sans label, on transparent. */
export function makeStatTexture(value: string, label: string, fonts: { serif: string; sans: string }, color = "#ffffff") {
  const [c, g] = canvas(1024, 640);
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.shadowColor = "rgba(255, 60, 40, 0.55)";
  g.shadowBlur = 24;
  g.font = `220px ${fonts.serif}`;
  g.fillText(value, 512, 300);
  g.shadowBlur = 0;
  g.font = `500 44px ${fonts.sans}`;
  // naive word wrap at ~26 chars
  const words = label.split(" ");
  const rows: string[] = [];
  let row = "";
  for (const w of words) {
    if ((row + " " + w).trim().length > 26) { rows.push(row.trim()); row = w; } else row += " " + w;
  }
  rows.push(row.trim());
  rows.slice(0, 3).forEach((r, i) => g.fillText(r, 512, 400 + i * 58));
  return finish(c);
}

/** Text on a transparent canvas, using a CSS font family (e.g. a next/font variable). */
export function makeTextTexture(
  lines: { text: string; size: number; family: string; italic?: boolean }[],
  opts: { width?: number; height?: number; color?: string; align?: CanvasTextAlign } = {},
) {
  const w = opts.width ?? 1024;
  const h = opts.height ?? 512;
  const [c, g] = canvas(w, h);
  g.fillStyle = opts.color ?? "#ffffff";
  g.textAlign = opts.align ?? "center";
  g.textBaseline = "middle";
  const total = lines.reduce((s, l) => s + l.size * 1.1, 0);
  let y = h / 2 - total / 2;
  for (const l of lines) {
    y += l.size * 0.55;
    g.font = `${l.italic ? "italic " : ""}${l.size}px ${l.family}`;
    g.fillText(l.text, opts.align === "left" ? 40 : w / 2, y);
    y += l.size * 0.55;
  }
  return finish(c);
}
