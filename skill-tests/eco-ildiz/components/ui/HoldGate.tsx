"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { completeGate } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { fmt, ui } from "@/lib/ui";

// Press-and-hold gate (improved over Zero's): a dark glass disc that reads on
// ANY background, an exact progress ring + percentage, idle ripples inviting the
// press, smooth rewind on release, and mouse / touch / keyboard (Space, Enter)
// support with a screen-reader label. The scene behind is dimmed for focus.
const R = 50;
const C = 2 * Math.PI * R;

export function HoldGate() {
  const gateId = useStory((s) => s.gate);
  const transitioning = useStory((s) => s.transitioning);
  const reduced = useStory((s) => s.reducedMotion);
  const chapter = story.chapters.find((c) => c.id === gateId);
  const duration = reduced ? 500 : (chapter?.gate?.duration ?? 1800);

  const [value, setValue] = useState(0);
  const [pressed, setPressed] = useState(false);
  const holding = useRef(false);
  const v = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!gateId || transitioning) return;
    v.current = 0;
    btn.current?.focus({ preventScroll: true });
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      v.current = holding.current ? Math.min(1, v.current + dt / duration) : Math.max(0, v.current - dt / 500);
      setValue(v.current);
      if (v.current >= 1) {
        holding.current = false;
        setPressed(false);
        navigator.vibrate?.(30);
        completeGate(gateId);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gateId, transitioning, duration]);

  const down = useCallback(() => {
    holding.current = true;
    setPressed(true);
  }, []);
  const up = useCallback(() => {
    holding.current = false;
    setPressed(false);
  }, []);

  if (!gateId || transitioning || !chapter?.gate) return null;
  const label = chapter.gate.label ?? "Hold";

  return (
    <div className="gate" data-pressed={pressed || undefined}>
      <div className="gate-dim" aria-hidden="true" />
      <button
        ref={btn}
        className="gate-btn"
        data-magnetic
        aria-label={fmt(ui.holdAria, { label })}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          down();
        }}
        onPointerUp={up}
        onPointerCancel={up}
        onLostPointerCapture={up}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            down();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") up();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="gate-ripple" aria-hidden="true" />
        <span className="gate-ripple gate-ripple-2" aria-hidden="true" />
        <span className="gate-fillDisc" aria-hidden="true" style={{ transform: `scale(${value})` }} />
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={R} className="gate-track" />
          <circle cx="60" cy="60" r={R} className="gate-fill" strokeDasharray={C} strokeDashoffset={C * (1 - value)} />
        </svg>
        <span className="gate-inner" aria-hidden="true">
          <span className="gate-word">{label.toUpperCase()}</span>
          <span className="gate-pct">{Math.round(value * 100)}%</span>
        </span>
      </button>
      <p className="gate-hint" aria-hidden="true">
        {ui.pressHold} <span className="gate-key">{ui.spaceKey}</span>
      </p>
    </div>
  );
}
