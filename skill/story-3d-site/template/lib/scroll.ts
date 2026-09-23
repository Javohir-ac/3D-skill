import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { story } from "@/story/story.config";
import { buildTransition } from "@/story/transitions";
import { live, resetFx } from "./live";
import { useStory } from "./store";
import { smoothstep, window01 } from "./math";

// Scroll engine: Lenis smooth scroll → per-chapter progress → gates.
// Chapters are tall <section>s; the canvas and copy are position:fixed on top.

let lenis: Lenis | null = null;
let sections: HTMLElement[] = [];
let lines: { el: HTMLElement; chapter: number; a: number; b: number }[] = [];

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

  // scroll-scrubbed curtain across non-gated boundaries
  let amount = 0;
  for (let i = 0; i < chapters.length - 1; i++) {
    const kind = chapters[i].boundary ?? "black";
    if (kind === "cut") continue;
    const d = Math.abs(y - top(i + 1)) / vh;
    const a = 1 - smoothstep(0, 0.45, d);
    if (a > amount) {
      amount = a;
      live.boundary.color.set(kind === "white" ? "#ffffff" : kind === "black" ? "#000000" : kind);
    }
  }
  live.boundary.amount = amount;

  // gates: stop the scroll at the gate position until the user completes it
  if (g >= 0 && !s.gate && !s.transitioning && y >= gateY(g) - 2) {
    s.openGate(chapters[g].id); // mark first, so any scroll event fired below sees the gate as open
    lenis?.stop();
    lenis?.scrollTo(gateY(g), { immediate: true, force: true });
  }

  // copy lines: fade by their [a,b] window of chapter progress
  for (const l of lines) {
    const p = live.progress[chapters[l.chapter].id];
    // lines that start at 0 are visible immediately (no fade-in from nothing)
    const o = l.chapter !== active ? 0 : l.a <= 0.001 ? 1 - smoothstep(l.b - 0.07, l.b, p) : window01(p, l.a, l.b, 0.07);
    l.el.style.opacity = o.toFixed(3);
    l.el.style.transform = `translate3d(0, ${((1 - o) * 18).toFixed(1)}px, 0)`;
    l.el.style.filter = o < 0.99 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "none";
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
}

export function scrollToChapter(i: number) {
  if (!lenis) return;
  lenis.scrollTo(top(i) + 2, { duration: useStory.getState().reducedMotion ? 0 : 1.6 });
}

function jumpTo(i: number) {
  if (!lenis) return;
  lenis.scrollTo(top(i) + 2, { immediate: true, force: true });
  onScroll(top(i) + 2);
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
