import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { story } from "@/story/story.config";
import { buildTransition } from "@/story/transitions";
import { live, resetFx } from "./live";
import { useStory } from "./store";
import { fireBeat } from "./beats";
import { smoothstep } from "./math";

// Scroll engine: Lenis smooth scroll → per-chapter progress → gates.
// Chapters are tall <section>s; the canvas and copy are position:fixed on top.

let lenis: Lenis | null = null;
let sections: HTMLElement[] = [];
let lines: { el: HTMLElement; chapter: number; a: number; b: number }[] = [];
const lastP: Record<string, number> = {};
/** Time-driven entrance for lines that start at 0 (after the intro / a gate jump). */
const opener = { v: 1 };
function playOpener() {
  gsap.killTweensOf(opener);
  gsap.fromTo(opener, { v: 0 }, { v: 1, duration: 1.4, ease: "power2.out", delay: 0.15, onUpdate: () => onScroll(lenis?.scroll ?? 0) });
}

const chapters = story.chapters;
const top = (i: number) => sections[i]?.offsetTop ?? 0;
const height = (i: number) => sections[i]?.offsetHeight ?? 1;

function gateY(i: number) {
  const g = chapters[i].gate;
  return top(i) + (g?.at ?? 0.9) * height(i);
}

let inScroll = false;

function onScroll(y: number) {
  // lenis.scrollTo() below emits a scroll event synchronously — never re-enter.
  if (inScroll) return;
  inScroll = true;
  try {
    update(y);
  } finally {
    inScroll = false;
  }
}

/** First gate that is not completed yet (gates must be passed in order). */
function pendingGate(): number {
  const done = useStory.getState().completedGates;
  return chapters.findIndex((c) => c.gate && !done.includes(c.id));
}

function update(y: number) {
  const s = useStory.getState();

  // Hard wall: nobody scrolls past an unfinished gate — not fast wheels, not
  // momentum, not the scrollbar, not keyboard. Checked against ALL gates, not
  // just the active chapter (fast scrolls can skip a whole chapter in one frame).
  const g = pendingGate();
  if (g >= 0 && !s.transitioning && y > gateY(g) + 1) {
    y = gateY(g);
    lenis?.scrollTo(y, { immediate: true, force: true });
    if (window.scrollY > y + 1) window.scrollTo(0, y);
  }

  const vh = window.innerHeight;
  // progress per chapter
  let active = 0;
  for (let i = 0; i < chapters.length; i++) {
    const p = (y - top(i)) / height(i);
    live.progress[chapters[i].id] = Math.min(1, Math.max(0, p));
    if (y >= top(i) - 1) active = i;
  }
  live.active = active;
  useStory.getState().setActive(active);

  // scroll-scrubbed boundary effects between non-gated chapters
  let amount = 0;
  let burn = 0;
  let drain = 0;
  for (let i = 0; i < chapters.length - 1; i++) {
    const kind = chapters[i].boundary ?? "black";
    // Gated boundaries are crossed by the gate cinematic, which lands exactly on
    // the boundary — a scroll curtain there would leave the screen stuck dark.
    if (kind === "cut" || chapters[i].gate) continue;
    const d = Math.abs(y - top(i + 1)) / vh;
    if (kind === "burn") {
      // longer run-up: the frame chars over ~0.8 screens, burns through after
      burn = Math.max(burn, 1 - smoothstep(0, 0.8, d));
      continue;
    }
    if (kind === "drain") {
      drain = Math.max(drain, 1 - smoothstep(0, 0.9, d));
      const a = (1 - smoothstep(0, 0.2, d)) * 0.85; // brief sepia dip at the cut
      if (a > amount) { amount = a; live.boundary.color.set("#2a2118"); }
      continue;
    }
    const a = 1 - smoothstep(0, 0.45, d);
    if (a > amount) {
      amount = a;
      live.boundary.color.set(kind === "white" ? "#ffffff" : kind === "black" ? "#000000" : kind);
    }
  }
  live.boundary.amount = amount;
  live.boundary.burn = burn;
  live.boundary.drain = drain;

  // gates: stop the scroll at the gate position until the user completes it
  if (g >= 0 && !s.gate && !s.transitioning && y >= gateY(g) - 2) {
    s.openGate(chapters[g].id); // mark first, so any scroll event fired below sees the gate as open
    lenis?.stop();
    lenis?.scrollTo(gateY(g), { immediate: true, force: true });
  }

  // beats: fire once when scrolling FORWARD past their mark
  const ch = chapters[active];
  const p = live.progress[ch.id];
  const prev = lastP[ch.id] ?? p;
  if (ch.beats && p > prev) for (const b of ch.beats) if (prev < b.at && p >= b.at) fireBeat(b, s.reducedMotion);
  lastP[ch.id] = p;

  // copy lines: letters stagger in (CSS reads --in), whole line fades out at b
  for (const l of lines) {
    const lp = live.progress[chapters[l.chapter].id];
    // copy waits for the intro interaction (if any) so it never fights the prompt
    const on = l.chapter === active && (!story.intro || s.introDone);
    const enter = !on ? 0 : l.a <= 0.001 ? opener.v : smoothstep(l.a, l.a + 0.12, lp);
    const exit = !on ? 0 : 1 - smoothstep(l.b - 0.07, l.b, lp);
    const o = Math.min(enter > 0 ? 1 : 0, exit);
    l.el.style.opacity = o.toFixed(3);
    l.el.style.setProperty("--in", enter.toFixed(3));
    l.el.style.transform = `translate3d(0, ${((1 - exit) * -14).toFixed(1)}px, 0) scale(${(1 + (1 - enter) * 0.05).toFixed(3)})`;
    l.el.style.filter = exit < 0.99 ? `blur(${((1 - exit) * 8).toFixed(1)}px)` : "none";
  }
}

export function initScroll(root: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);
  sections = Array.from(root.querySelectorAll<HTMLElement>("section[data-chapter]"));
  lines = Array.from(root.querySelectorAll<HTMLElement>("[data-line]")).map((el) => ({
    el,
    chapter: Number(el.dataset.chapter),
    a: Number(el.dataset.a),
    b: Number(el.dataset.b),
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useStory.getState().setReducedMotion(reduced);

  lenis = new Lenis({ autoRaf: false, lerp: reduced ? 1 : 0.085, smoothWheel: !reduced, wheelMultiplier: 0.9 });
  lenis.on("scroll", (e: Lenis) => {
    live.velocity = e.velocity;
    ScrollTrigger.update();
    onScroll(e.scroll);
  });
  const raf = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // start at the top (browsers restore scroll position otherwise)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  lenis.stop(); // until the loader is done
  onScroll(0);

  const onResize = () => onScroll(lenis?.scroll ?? 0);
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function startScroll() {
  lenis?.start();
  playOpener(); // first line of the chapter writes itself in (e.g. right after the intro)
}

export function scrollToChapter(i: number) {
  if (!lenis) return;
  lenis.scrollTo(top(i) + 2, { duration: useStory.getState().reducedMotion ? 0 : 1.6 });
}

function jumpTo(i: number) {
  if (!lenis) return;
  lenis.scrollTo(top(i) + 2, { immediate: true, force: true });
  onScroll(top(i) + 2);
  playOpener();
}

/** Called by the gate UI when the hold completes. Plays the cinematic, then releases scroll. */
export function completeGate(chapterId: string) {
  const i = chapters.findIndex((c) => c.id === chapterId);
  const gate = chapters[i]?.gate;
  if (!gate) return;
  const s = useStory.getState();
  s.startTransition();
  const tl = gsap.timeline({
    onComplete: () => {
      resetFx();
      useStory.getState().completeGate(chapterId, gate.xp ?? 100);
      lenis?.start();
    },
  });
  buildTransition(gate.transition, tl, live.fx, {
    jump: () => jumpTo(Math.min(i + 1, chapters.length - 1)),
    reduced: s.reducedMotion,
  });
}
