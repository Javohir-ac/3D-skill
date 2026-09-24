"use client";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { live } from "@/lib/live";
import { rand } from "@/lib/math";
import { startScroll } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { ui } from "@/lib/ui";

// Opening interaction: the screen is buried under buzzing notifications.
// Drag (or swipe) through them to fling them away — each one dissolves, and the
// story's particles fade in behind as the noise clears. Past ~70 % the rest
// silence themselves and the particles gather into the first shape.
// Keyboard / assistive: "Silence all" (Enter) — never a dead end.

const APPS = [
  { app: "Messages", c: "#34c759", t: "3 new messages", b: "Are you coming tonight?? 👀" },
  { app: "Mail", c: "#0a84ff", t: "Inbox (48)", b: "RE: RE: quick question about the deck" },
  { app: "Calendar", c: "#ff3b30", t: "Meeting in 5 min", b: "Weekly sync · Room 4B" },
  { app: "Shop", c: "#ff9f0a", t: "Flash sale ends in 2h", b: "Up to 70% off — don't miss out" },
  { app: "Social", c: "#bf5af2", t: "You were mentioned", b: "@you check this out 😂" },
  { app: "News", c: "#ff2d55", t: "Breaking", b: "Everything you need to know today" },
  { app: "Fitness", c: "#30d158", t: "Streak at risk", b: "You haven't moved in 6 hours" },
  { app: "Bank", c: "#64d2ff", t: "Payment due", b: "Your card bill is due tomorrow" },
  { app: "Video", c: "#ff453a", t: "New episode", b: "Autoplay starts in 5… 4… 3…" },
  { app: "Games", c: "#5e5ce6", t: "Your energy is full!", b: "Come back and claim your reward" },
  { app: "Work", c: "#ffd60a", t: "12 unread threads", b: "#general: can someone look at…" },
  { app: "Delivery", c: "#ac8e68", t: "Driver is nearby", b: "Your order arrives in 3 min" },
];

const CARD_COUNT = 34;

interface Card { id: number; x: number; y: number; r: number; d: number; a: (typeof APPS)[number]; mins: number }

export function NotificationWall() {
  const intro = story.intro;
  const ready = useStory((s) => s.ready);
  const done = useStory((s) => s.introDone);
  const finishIntro = useStory((s) => s.finishIntro);
  const reduced = useStory((s) => s.reducedMotion);
  const wall = useRef<HTMLDivElement>(null);
  const gone = useRef(new Set<number>());
  const [left, setLeft] = useState(CARD_COUNT);
  const [closing, setClosing] = useState(false);

  const cards = useMemo<Card[]>(() => {
    const n = CARD_COUNT;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      x: 4 + rand(i * 3.1) * 72, // % of viewport
      y: 6 + rand(i * 5.7) * 76,
      r: (rand(i * 1.3) - 0.5) * 12,
      d: rand(i * 9.1) * 2,
      a: APPS[i % APPS.length],
      mins: Math.floor(rand(i * 2.2) * 58) + 1,
    }));
  }, []);

  useEffect(() => {
    if (intro?.type !== "notifications" || !ready || done) return;
    live.fx.introClear = 0;
    const el = wall.current!;
    let last = { x: 0, y: 0, t: 0 };
    let dragging = false;
    let finished = false;

    const fling = (card: HTMLElement, vx: number, vy: number) => {
      const id = Number(card.dataset.id);
      if (gone.current.has(id)) return;
      gone.current.add(id);
      const speed = Math.hypot(vx, vy) || 1;
      const nx = vx / speed, ny = vy / speed;
      gsap.to(card, {
        x: `+=${nx * (380 + speed * 0.6)}`, y: `+=${ny * (380 + speed * 0.6)}`, rotation: `+=${nx * 40}`,
        opacity: 0, scale: 0.7, filter: "blur(10px)", duration: reduced ? 0.25 : 0.7, ease: "power3.out",
        onComplete: () => { card.style.visibility = "hidden"; },
      });
      const clear = gone.current.size / cards.length;
      live.fx.introClear = clear;
      setLeft(cards.length - gone.current.size);
      if (clear >= 0.7) silenceAll();
    };

    const silenceAll = () => {
      if (finished) return;
      finished = true;
      setClosing(true);
      const rest = Array.from(el.querySelectorAll<HTMLElement>(".nw-card")).filter((c) => !gone.current.has(Number(c.dataset.id)));
      rest.forEach((c, i) => {
        gone.current.add(Number(c.dataset.id));
        gsap.to(c, { opacity: 0, scale: 0.85, filter: "blur(12px)", y: "-=30", duration: 0.5, delay: reduced ? 0 : i * 0.03, ease: "power2.in" });
      });
      gsap.to(live.fx, { introClear: 1, duration: 0.6 });
      // the silence: particles gather, a soft pulse, the story begins
      setTimeout(() => {
        live.fx.burst++;
        gsap.fromTo(live.fx, { pulse: 0 }, { pulse: 1, duration: 0.35, yoyo: true, repeat: 1 });
        finishIntro(intro.xp ?? 100);
        startScroll();
      }, reduced ? 200 : 700 + rest.length * 30);
    };

    // Geometric hit-testing: card rects are read once per gesture, then the
    // swipe segment is tested against them with a generous brush radius.
    // (Cheap and reliable — no layout queries while the finger moves.)
    const BRUSH = 34;
    let rects: { el: HTMLElement; r: DOMRect }[] = [];
    const readRects = () => {
      rects = Array.from(el.querySelectorAll<HTMLElement>(".nw-card"))
        .filter((c) => !gone.current.has(Number(c.dataset.id)))
        .map((c) => ({ el: c, r: c.getBoundingClientRect() }));
    };
    const segHitsRect = (x0: number, y0: number, x1: number, y1: number, r: DOMRect) => {
      // closest point on the segment to the rect centre, then expanded-rect test
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = x1 - x0, dy = y1 - y0;
      const len2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((cx - x0) * dx + (cy - y0) * dy) / len2));
      const px = x0 + dx * t, py = y0 + dy * t;
      return px > r.left - BRUSH && px < r.right + BRUSH && py > r.top - BRUSH && py < r.bottom + BRUSH;
    };

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      dragging = true;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      readRects();
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - last.t);
      const vx = ((e.clientX - last.x) / dt) * 1000;
      const vy = ((e.clientY - last.y) / dt) * 1000;
      for (const { el: card, r } of rects) if (segHitsRect(last.x, last.y, e.clientX, e.clientY, r)) fling(card, vx, vy);
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    const up = (e: PointerEvent) => {
      if (dragging && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 4) {
        // a tap flicks the topmost card under the finger away
        const hit = rects.filter(({ r }) => segHitsRect(e.clientX, e.clientY, e.clientX, e.clientY, r)).pop();
        if (hit) fling(hit.el, (rand(e.clientX) - 0.5) * 900, -600);
      }
      dragging = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const btn = el.querySelector<HTMLButtonElement>(".nw-silence");
    const onSilence = () => silenceAll();
    btn?.addEventListener("click", onSilence);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      btn?.removeEventListener("click", onSilence);
    };
  }, [intro, ready, done, cards, finishIntro, reduced]);

  if (intro?.type !== "notifications" || !ready || done) return null;
  return (
    <div ref={wall} className={`nwall ${closing ? "is-closing" : ""}`}>
      <div className="nw-scrim" aria-hidden="true" />
      <div className="nw-cards" aria-hidden="true">
        {cards.map((c) => (
          <div
            key={c.id}
            className="nw-card"
            data-id={c.id}
            style={{ left: `${c.x}%`, top: `${c.y}%`, rotate: `${c.r}deg`, animationDelay: `${c.d}s`, zIndex: c.id }}
          >
            <span className="nw-icon" style={{ background: c.a.c }}>{c.a.app[0]}</span>
            <span className="nw-body">
              <span className="nw-head"><b>{c.a.app}</b><i>{c.mins}m ago</i></span>
              <span className="nw-title">{c.a.t}</span>
              <span className="nw-text">{c.a.b}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="nw-ui">
        <p className="nw-prompt">{intro.prompt}</p>
        {intro.hint && <p className="nw-hint">{intro.hint} · {left} left</p>}
        <button className="nw-silence" autoFocus>{ui.silenceAll} <span aria-hidden="true">↵</span></button>
      </div>
    </div>
  );
}
