import { story } from "@/story/story.config";
import type { UiStrings } from "@/story/types";

// Interface copy (loader, gates, HUD, cursor…). English defaults; a story can
// translate any of them via `story.ui` (the demo is Uzbek) and set `story.lang`.
export const UI_DEFAULT: UiStrings = {
  loading: "Loading the story",
  ready: "Ready",
  skip: "Skip",
  almostCircle: "Almost — close the circle",
  pressHold: "Press & hold",
  spaceKey: "Space",
  holdAria: "{label} to continue. Press and hold the button, or hold Space.",
  motionFull: "Motion: full",
  motionReduced: "Motion: reduced",
  close: "Close",
  chapters: "Chapters",
  goToChapter: "Go to chapter {n}: {title}",
  sources: "Sources",
  cursorHold: "Hold",
  cursorDraw: "Draw",
  cursorDrag: "Drag",
  cursorSwipe: "Swipe",
  silenceAll: "Silence all",
};

export const ui: UiStrings = { ...UI_DEFAULT, ...story.ui };

/** Fill {placeholders} in a UI string. */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
