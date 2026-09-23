// Story model. A site is a list of chapters; each chapter owns a 3D scene,
// a colour grade, HTML copy lines and (optionally) an interactive gate that
// plays a cinematic transition into the next chapter.

export type LineStyle = "script" | "serif" | "sans" | "mono";
export type LineSize = "xxl" | "xl" | "lg" | "md" | "sm";
export type Anchor =
  | "center" | "top" | "bottom" | "left" | "right"
  | "tl" | "tr" | "bl" | "br";

export interface StoryLine {
  /** Copy. Wrap letters in *asterisks* to render them as a script swash, e.g. "*C*ollege". */
  text: string;
  style?: LineStyle;
  size?: LineSize;
  /** Visible window inside the chapter, as chapter progress [start, end] (0..1). */
  at?: [number, number];
  anchor?: Anchor;
  /** Semantic tag for SEO / screen readers. Default "p"; first line of a chapter is usually "h2". */
  tag?: "h1" | "h2" | "h3" | "p";
  /** Optional source for statistics — rendered as a small footnote link. */
  source?: { label: string; href: string };
}

export interface Grade {
  exposure?: number;   // 1 = neutral
  saturation?: number; // 1 = neutral, 0 = greyscale
  contrast?: number;   // 1 = neutral
  tint?: string;       // hex, blended by tintAmount (duotone-ish)
  tintAmount?: number; // 0..1
  bloom?: number;      // bloom intensity
  vignette?: number;   // vignette darkness 0..1
  grain?: number;      // film grain opacity 0..1
}

export type TransitionName = "breakToDark" | "implodeToLight" | "whiteout" | "blackout";

export interface Gate {
  type: "hold";
  /** Chapter progress where scrolling stops and the gate appears. Default 0.9. */
  at?: number;
  label?: string;
  /** Hold duration in ms. Default 1800. */
  duration?: number;
  /** Cinematic that plays after the gate is completed; ends inside the next chapter. */
  transition: TransitionName;
  xp?: number;
}

export type SceneName =
  | "intro" | "dream" | "fracture" | "evidence" | "charge" | "reveal" | "finale";

export interface Chapter {
  id: string;
  /** Short name for navigation and aria labels. */
  title: string;
  /** Scroll length in viewport heights. */
  length: number;
  scene: SceneName;
  /** Canvas clear colour for this chapter. */
  background: string;
  grade: Grade;
  lines: StoryLine[];
  gate?: Gate;
  /** How a plain (non-gated) scroll into the NEXT chapter is hidden: a dip to
   *  black, white, any hex colour, or a hard "cut". Default "black".
   *  Prefer dark / mid-tone dips — full-white flashes are tiring on the eyes. */
  boundary?: "black" | "white" | "cut" | `#${string}`;
}

export interface Hotspot {
  id: string;
  label: string;
  /** Position in the finale scene (world units). */
  position: [number, number, number];
  title: string;
  body: string;
  tags?: string[];
  cta?: { label: string; href: string };
}

export interface StoryConfig {
  brand: string;
  description: string;
  chapters: Chapter[];
  hotspots: Hotspot[];
  cta: { label: string; href: string };
}
