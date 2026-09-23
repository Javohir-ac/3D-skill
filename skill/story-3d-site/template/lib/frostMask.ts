import { CanvasTexture, LinearFilter } from "three";

// Shared "wiped frost" mask: the intro draws finger strokes into this canvas
// (screen space), the FrostPane shader clears the frost wherever it is white —
// exactly like drawing on a fogged-up window.

let canvas: HTMLCanvasElement | null = null;
let texture: CanvasTexture | null = null;
const SCALE = 0.5; // half resolution is plenty for a soft mask

export function frostMask() {
  if (!canvas) {
    canvas = document.createElement("canvas");
    texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    resizeFrostMask();
  }
  return { canvas: canvas!, texture: texture!, ctx: canvas!.getContext("2d")! };
}

export function resizeFrostMask() {
  if (!canvas) return;
  canvas.width = Math.max(2, Math.round(innerWidth * SCALE));
  canvas.height = Math.max(2, Math.round(innerHeight * SCALE));
  if (texture) texture.needsUpdate = true;
}

/** Draw a soft wiped stroke segment (screen px). */
export function wipe(x0: number, y0: number, x1: number, y1: number, width = 9) {
  const { ctx, texture } = frostMask();
  ctx.save();
  ctx.scale(SCALE, SCALE);
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  // NB: shadowBlur ignores ctx.scale, so keep it tiny — a big blur makes the
  // stroke look like a thick marker instead of a fingertip on fogged glass
  ctx.shadowColor = "rgba(255,255,255,1)";
  ctx.shadowBlur = 2;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
  texture.needsUpdate = true;
}

export function clearFrostMask() {
  const { ctx, canvas, texture } = frostMask();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  texture.needsUpdate = true;
}
