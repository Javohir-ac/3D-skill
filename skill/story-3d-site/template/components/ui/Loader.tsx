"use client";
import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import { startScroll } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { ui } from "@/lib/ui";

// Branded loader (Zero-style drum digits, but honest and short): each digit is a
// rolling 0–9 drum, a thin progress line, the brand name. Real asset progress
// is eased; when WebGL + fonts are ready it fades and hands over to the intro.

function Drum({ digit }: { digit: number }) {
  return (
    <span className="drum" aria-hidden="true">
      <span className="drum-strip" style={{ transform: `translateY(${-digit * 10}%)` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </span>
    </span>
  );
}

export function Loader() {
  const loaded = useStory((s) => s.loaded);
  const setReady = useStory((s) => s.setReady);
  const { progress } = useProgress();
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const target = loaded ? 100 : Math.max(progress, 12);
    const tick = () => {
      setShown((v) => {
        const n = v + (target - v) * 0.12;
        return Math.abs(target - n) < 0.5 ? target : n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded, progress]);

  useEffect(() => {
    if (loaded && shown >= 99.5) {
      const t = setTimeout(() => {
        setGone(true);
        setReady(true);
        // with an intro interaction, the intro releases the scroll when solved
        if (!story.intro) startScroll();
      }, 450);
      return () => clearTimeout(t);
    }
  }, [loaded, shown, setReady]);

  const value = Math.min(99, Math.round(shown));
  const digits = String(value).padStart(2, "0").split("").map(Number);

  return (
    <div className={`loader ${gone ? "is-gone" : ""}`} role="status" aria-live="polite" aria-hidden={gone}>
      <span className="sr-only">{loaded ? ui.ready : `${ui.loading} ${value}%`}</span>
      <div className="loader-brand" aria-hidden="true">{story.brand}</div>
      <div className="loader-count" aria-hidden="true">
        {digits.map((d, i) => (
          <Drum key={i} digit={d} />
        ))}
        <span className="loader-pct">%</span>
      </div>
      <div className="loader-line" aria-hidden="true">
        <span style={{ transform: `scaleX(${shown / 100})` }} />
      </div>
      <span className="loader-label" aria-hidden="true">{loaded ? ui.ready : ui.loading}</span>
    </div>
  );
}
