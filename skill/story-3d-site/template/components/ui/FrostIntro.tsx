"use client";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { clearFrostMask, resizeFrostMask, wipe } from "@/lib/frostMask";
import { live } from "@/lib/live";
import { startScroll } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { isCircle } from "./DrawIntro";
import { ui } from "@/lib/ui";

// Opening interaction "frost": the whole screen is a pane of frosted glass
// (three/fx/FrostPane). Behind it the story's hero object is
// only a blur. Drawing on the glass wipes the frost away like a finger on a
// fogged window. A drawn circle becomes a clock face (ticks + spinning hands),
// then the pane cracks and shatters toward the viewer — the story begins.
// Scrubbing a lot also counts; "Skip" (Enter) is always there.

type Pt = { x: number; y: number };

export function FrostIntro() {
  const intro = story.intro;
  const ready = useStory((s) => s.ready);
  const done = useStory((s) => s.introDone);
  const finishIntro = useStory((s) => s.finishIntro);
  const reduced = useStory((s) => s.reducedMotion);
  const layer = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<{ x: number; y: number; r: number } | null>(null);
  const [miss, setMiss] = useState(0);

  useEffect(() => {
    if (intro?.type !== "frost" || !ready || done) return;
    const el = layer.current!;
    resizeFrostMask();
    clearFrostMask();
    gsap.to(live.fx, { frost: 1, duration: 0.6 });
    let pts: Pt[] = [];
    let drawing = false;
    let scrubbed = 0; // total wiped path length (px)
    let solved = false;

    const shatter = () => {
      // the pane cracks: frost off, frosted shards fly at the viewer
      live.fx.shatterColor.set("#dcefe7");
      live.fx.shatterAlpha = 0.85;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(live.fx, { introPush: 0, duration: 1.2, ease: "power2.out" });
          live.fx.shatterArmed = 0;
          live.fx.shatterAlpha = 1;
          clearFrostMask();
        },
      });
      tl.set(live.fx, { shatter: 0, shatterArmed: 1, frost: 0 })
        .to(live.fx, { flash: 0.3, duration: 0.08 }, 0)
        .to(live.fx, { flash: 0, duration: 0.6 }, 0.08)
        .fromTo(live.fx, { shake: 0.9 }, { shake: 0, duration: 0.8, ease: "power3.out" }, 0)
        .to(live.fx, { shatter: 1, duration: reduced ? 0.5 : 1.5, ease: "power3.out" }, 0)
        .call(() => {
          live.fx.burst++;
          finishIntro(intro.xp ?? 100);
          startScroll();
        }, [], 0.35);
    };

    const succeed = (c: { x: number; y: number; r: number }) => {
      if (solved) return;
      solved = true;
      setClock(c);
      gsap.fromTo(live.fx, { pulse: 0 }, { pulse: 1, duration: 0.4, yoyo: true, repeat: 1 });
      // the hero behind the glass presses toward it while the clock ticks
      gsap.to(live.fx, { introPush: 1, duration: reduced ? 0.2 : 1.4, ease: "power2.in" });
      // the clock ticks, the world behind pushes against the glass… then it gives
      setTimeout(shatter, reduced ? 250 : 1500);
    };

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button") || solved) return;
      drawing = true;
      pts = [{ x: e.clientX, y: e.clientY }];
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      const p = pts[pts.length - 1];
      const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
      if (d < 3) return;
      wipe(p.x, p.y, e.clientX, e.clientY);
      scrubbed += d;
      pts.push({ x: e.clientX, y: e.clientY });
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      if (isCircle(pts).ok) {
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const r = pts.reduce((s, p) => s + Math.hypot(p.x - cx, p.y - cy), 0) / pts.length;
        succeed({ x: cx, y: cy, r });
      } else if (scrubbed > Math.min(innerWidth, innerHeight) * 3) {
        // the viewer simply wiped a lot of glass — honour it
        succeed({ x: innerWidth / 2, y: innerHeight / 2, r: Math.min(innerWidth, innerHeight) * 0.22 });
      } else if (pts.length > 8) {
        setMiss((m) => m + 1);
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const onResize = () => resizeFrostMask();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      window.removeEventListener("resize", onResize);
    };
  }, [intro, ready, done, finishIntro, reduced]);

  if (intro?.type !== "frost" || !ready || done) return null;
  const skip = () => {
    gsap.to(live.fx, { frost: 0, duration: 0.5 });
    finishIntro(0);
    startScroll();
  };
  return (
    <div ref={layer} className={`frost-intro ${clock ? "is-solved" : ""}`}>
      {clock && (
        // the drawn circle becomes a cup of coffee seen from above (demo brand:
        // coffee). For other briefs swap this for the brand's own "circle" object
        // (a clock face, a planet, a lens…).
        <svg
          className="frost-cup"
          aria-hidden="true"
          viewBox="-100 -100 200 200"
          style={{ left: clock.x - clock.r, top: clock.y - clock.r, width: clock.r * 2, height: clock.r * 2 }}
        >
          <circle className="cup-saucer" r="94" />
          <path className="cup-handle" d="M62,-13 h20 a13,13 0 0 1 0,26 h-20" />
          <circle className="cup-rim" r="66" />
          <circle className="cup-coffee" r="57" />
          <circle className="cup-crema" r="54" />
          <path className="cup-heart" d="M0,26 C-34,2 -36,-22 -17,-29 C-7,-33 0,-26 0,-19 C0,-26 7,-33 17,-29 C36,-22 34,2 0,26 Z" pathLength={1} />
        </svg>
      )}
      <div className="frost-copy">
        <p className="frost-prompt" key={miss} data-miss={miss > 0 || undefined}>{miss > 0 ? ui.almostCircle : intro.prompt}</p>
        {intro.hint && <p className="frost-hint">{intro.hint}</p>}
      </div>
      <button className="frost-skip" onClick={skip} autoFocus>
        {ui.skip} <span aria-hidden="true">↵</span>
      </button>
    </div>
  );
}
