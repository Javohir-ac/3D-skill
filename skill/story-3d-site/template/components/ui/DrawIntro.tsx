"use client";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { live } from "@/lib/live";
import { startScroll } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";

// Opening interaction (Zero's "draw a zero", improved): the viewer draws a
// circle with mouse/finger; a glowing trail follows; the shape is recognised
// (closed, round, ~full turn). Success → burst + XP + the story begins.
// Keyboard / assistive users get a visible "Skip" (Enter) — never a dead end.

type Pt = { x: number; y: number };

export function isCircle(pts: Pt[]): { ok: boolean; reason?: string } {
  if (pts.length < 18) return { ok: false, reason: "short" };
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const r = radii.reduce((s, v) => s + v, 0) / radii.length;
  if (r < 35) return { ok: false, reason: "small" };
  const sd = Math.sqrt(radii.reduce((s, v) => s + (v - r) ** 2, 0) / radii.length);
  if (sd / r > 0.3) return { ok: false, reason: "not round" };
  let turn = 0;
  for (let i = 1; i < pts.length; i++) {
    let d = Math.atan2(pts[i].y - cy, pts[i].x - cx) - Math.atan2(pts[i - 1].y - cy, pts[i - 1].x - cx);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    turn += d;
  }
  if (Math.abs(turn) < Math.PI * 1.7) return { ok: false, reason: "not closed" };
  return { ok: true };
}

export function DrawIntro() {
  const intro = story.intro;
  const ready = useStory((s) => s.ready);
  const done = useStory((s) => s.introDone);
  const finishIntro = useStory((s) => s.finishIntro);
  const reduced = useStory((s) => s.reducedMotion);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [miss, setMiss] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!intro || !ready || done) return;
    const c = canvas.current!;
    const g = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    let pts: Pt[] = [];
    let drawing = false;
    let fade = 0;
    let raf = 0;
    const render = () => {
      g.clearRect(0, 0, innerWidth, innerHeight);
      if (pts.length > 1) {
        g.lineCap = "round";
        g.lineJoin = "round";
        for (const [w, a] of [[18, 0.12], [8, 0.35], [3, 1]] as const) {
          g.strokeStyle = `rgba(210, 255, 232, ${a * (1 - fade)})`;
          g.lineWidth = w;
          g.shadowColor = "rgba(157,255,208,0.9)";
          g.shadowBlur = w * 1.5;
          g.beginPath();
          g.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
          g.stroke();
        }
      }
      if (!drawing && fade < 1 && pts.length) fade = Math.min(1, fade + 0.04);
      if (fade >= 1) pts = [];
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      drawing = true;
      fade = 0;
      pts = [{ x: e.clientX, y: e.clientY }];
      c.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      const last = pts[pts.length - 1];
      if (Math.hypot(e.clientX - last.x, e.clientY - last.y) > 3) pts.push({ x: e.clientX, y: e.clientY });
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      if (isCircle(pts).ok) {
        setSolved(true);
        live.fx.burst++;
        gsap.fromTo(live.fx, { flash: 0 }, { flash: 0.35, duration: 0.15, yoyo: true, repeat: 1 });
        gsap.fromTo(live.fx, { pulse: 0 }, { pulse: 1, duration: 0.3, yoyo: true, repeat: 1 });
        setTimeout(() => {
          finishIntro(intro.xp ?? 100);
          startScroll();
        }, reduced ? 200 : 900);
      } else {
        setMiss((m) => m + 1);
      }
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
    };
  }, [intro, ready, done, finishIntro, reduced]);

  if (!intro || !ready || done) return null;
  const skip = () => {
    finishIntro(0);
    startScroll();
  };
  return (
    <div className={`intro ${solved ? "is-solved" : ""}`}>
      <canvas ref={canvas} className="intro-canvas" aria-hidden="true" />
      <div className="intro-guide" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" className="intro-ring" />
          <circle cx="100" cy="14" r="5" className="intro-start" />
        </svg>
      </div>
      <div className="intro-copy">
        <p className="intro-prompt" key={miss} data-miss={miss > 0 || undefined}>{miss > 0 ? "Almost — close the circle" : intro.prompt}</p>
        {intro.hint && <p className="intro-hint">{intro.hint}</p>}
      </div>
      <button className="intro-skip" onClick={skip} autoFocus>
        Skip <span aria-hidden="true">↵</span>
      </button>
    </div>
  );
}
