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
  /** Depth of field around the hero (0 = sharp, 1 = strong bokeh). */
  dof?: number;
  /** Lens dirt revealed by bright areas 0..1 */
  dirt?: number;
}

export type TransitionName = "breakToDark" | "implodeToLight" | "drainCut" | "burnThrough" | "whiteout" | "blackout";

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

export type Vec3 = [number, number, number];

/**
 * The HERO — one recurring object that lives through the WHOLE story and changes
 * form (Zero's hand: ice → god → middle finger → statue → dollar). Keys are
 * sampled by chapter progress; omitted fields inherit from the previous key.
 * Make the last key of a chapter match the first key of the next for continuity
 * (or change it inside a gate transition, where the swap is hidden).
 */
export interface HeroKey {
  at: number;
  pos?: Vec3;
  scale?: number;
  /** Surface turbulence (liquid / alive). 0 = calm sphere. */
  noise?: number;
  /** Glowing fissures (broken). 0..1 */
  crack?: number;
  /** Self-illumination; > 1 blooms. */
  glow?: number;
  /** Glass look (transparent body, bright rim). 0..1 */
  glass?: number;
  color?: string;
  /** Colour of the fissures / rim light. */
  accent?: string;
  /** Spin speed (rad/s). */
  spin?: number;
  /** Silhouette morph: 0 = orb, 1 = coffee bean. Defaults to story.heroShape. */
  shape?: number;
}

/**
 * PARTICLE LANGUAGE — the story's visual voice. ~25k particles flow from one
 * shape into the next as the chapter progresses (step keys, not blended: when
 * a key's `at` is passed, the particles morph into its shape).
 * shape: "icon:clock|hourglass|plane|book|people|sun|phone|bell",
 *        "text:62%" (serif), "word:Aurora" (bold sans),
 *        "dust" | "embers" | "sphere" | "globe" | "core" | "aurora" | "galaxy"
 */
export interface ParticleKey {
  at: number;
  shape: string;
  /** Two colours; each particle picks a blend between them. */
  colors?: [string, string];
  size?: number;
  pos?: Vec3;
  scale?: number;
  /** Idle spin around Y (rad/s). */
  spin?: number;
  /** Idle drift / shimmer amount. */
  flow?: number;
  /** Additive glow (dark scenes) vs normal blending (light scenes). Default true. */
  additive?: boolean;
  opacity?: number;
}

/** Camera choreography: keyframes sampled by chapter progress (damped). */
export interface CameraKey {
  at: number;
  pos: Vec3;
  look?: Vec3;
  fov?: number;
}

/** A one-shot event fired when scrolling forward past `at` (keeps every few seconds alive). */
export interface Beat {
  at: number;
  fx: "pulse" | "shake" | "flash" | "burst";
  strength?: number;
}

export interface Stat {
  value: string;
  label: string;
  source?: { label: string; href: string };
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
  /** Statistics rendered ON 3D glass shards (the evidence scene). The HTML keeps
   *  them as a screen-reader list and shows the sources as visible footnotes. */
  stats?: Stat[];
  hero?: HeroKey[];
  particles?: ParticleKey[];
  camera?: CameraKey[];
  beats?: Beat[];
  gate?: Gate;
  /** How a plain (non-gated) scroll into the NEXT chapter is hidden: a dip to
   *  black, white, any hex colour, "burn" (the screen chars and burns through),
   *  "drain" (colour drains to sepia + film grain, then returns) or a hard "cut".
   *  Default "black".
   *  Prefer dark / mid-tone dips — full-white flashes are tiring on the eyes. */
  boundary?: "black" | "white" | "cut" | "burn" | "drain" | `#${string}`;
  backdrop?: Backdrop;
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

/** Optional opening interaction (Zero's "draw a zero"): the story starts once solved. */
export interface Intro {
  /** Opening interaction variants (pick per brief):
   *  "frost"         — the screen is frosted glass; drawing wipes it clear (like a fogged
   *                    window); a drawn circle becomes a clock face, then the glass shatters.
   *  "notifications" — swipe away a wall of buzzing notifications; they dissolve and the
   *                    story particles gather (best for attention / screen-time stories).
   *  "draw-circle"   — minimal: draw a circle on an empty screen (Zero's "draw a zero"). */
  type: "frost" | "notifications" | "draw-circle";
  prompt: string;
  hint?: string;
  xp?: number;
}

/** Procedural shader backdrop behind everything (per chapter, crossfaded). */
export interface Backdrop {
  top: string;
  bottom: string;
  /** Colour of the slow flowing aurora/fog layer. */
  accent?: string;
  /** Aurora/fog flow strength 0..1 */
  flow?: number;
  /** God-rays from above 0..1 */
  rays?: number;
  /** Star field density 0..1 */
  stars?: number;
}

/** Interface copy — see lib/ui.ts for the English defaults. */
export interface UiStrings {
  loading: string;
  ready: string;
  skip: string;
  almostCircle: string;
  pressHold: string;
  spaceKey: string;
  /** {label} = the gate label */
  holdAria: string;
  motionFull: string;
  motionReduced: string;
  close: string;
  chapters: string;
  /** {n}, {title} */
  goToChapter: string;
  sources: string;
  cursorHold: string;
  cursorDraw: string;
  cursorDrag: string;
  cursorSwipe: string;
  silenceAll: string;
}

export interface StoryConfig {
  /** <html lang> of the site, e.g. "en", "uz". */
  lang?: string;
  /** Translations of the interface copy (any subset). */
  ui?: Partial<UiStrings>;
  intro?: Intro;
  brand: string;
  /** Default hero silhouette for keys without `shape` (0 = orb, 1 = coffee bean). */
  heroShape?: number;
  description: string;
  chapters: Chapter[];
  hotspots: Hotspot[];
  cta: { label: string; href: string };
}
