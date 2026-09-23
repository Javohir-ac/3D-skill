"use client";
import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import { startScroll } from "@/lib/scroll";
import { story } from "@/story/story.config";
import { useStory } from "@/lib/store";

// Short, honest loader: real asset progress, eased counter, fades out and
// releases the scroll. Target: < 3–5 s on a normal connection.
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
      }, 350);
      return () => clearTimeout(t);
    }
  }, [loaded, shown, setReady]);

  return (
    <div className={`loader ${gone ? "is-gone" : ""}`} role="status" aria-live="polite" aria-hidden={gone}>
      <span className="loader-count">{Math.round(shown)}</span>
      <span className="loader-label">{loaded ? "Ready" : "Loading"}</span>
    </div>
  );
}
