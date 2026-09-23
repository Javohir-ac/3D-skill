"use client";
import { useEffect } from "react";
import { scrollToChapter } from "@/lib/scroll";
import { useStory } from "@/lib/store";
import { plain } from "@/lib/text";
import { story } from "@/story/story.config";

// Persistent chrome: progress ruler (top), XP (top-right), chapter nav (right),
// CTA (bottom), motion toggle (bottom-left), hotspot card.

export function ProgressRuler() {
  const active = useStory((s) => s.active);
  const n = story.chapters.length;
  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler-ticks">
        {Array.from({ length: n * 6 }, (_, i) => (
          <span key={i} className={i === active * 6 ? "tick is-major" : "tick"} />
        ))}
        <span className="ruler-needle" style={{ left: `${((active + 0.5) / n) * 100}%` }} />
      </div>
      <span className="ruler-label">{story.chapters[active]?.title}</span>
    </div>
  );
}

export function XP() {
  const xp = useStory((s) => s.xp);
  const burst = useStory((s) => s.xpBurst);
  return (
    <div className="xp" aria-live="polite">
      <span className="xp-star" aria-hidden="true">✦</span>
      <span>{xp}</span>
      <span className="xp-unit">XP</span>
      {/* re-keyed on every award so the CSS animation replays; it ends invisible */}
      {burst > 0 && <span key={burst} className="xp-pop" aria-hidden="true">+100 XP</span>}
    </div>
  );
}

export function ChapterNav() {
  const active = useStory((s) => s.active);
  const done = useStory((s) => s.completedGates);
  // a chapter is reachable if no unfinished gate stands before it
  const reachable = (i: number) => story.chapters.slice(0, i).every((c) => !c.gate || done.includes(c.id));
  return (
    <nav className="chapter-nav" aria-label="Chapters">
      {story.chapters.map((c, i) => (
        <button
          key={c.id}
          className={`nav-dot ${i === active ? "is-active" : ""}`}
          disabled={!reachable(i)}
          aria-current={i === active ? "step" : undefined}
          aria-label={`Go to chapter ${i + 1}: ${plain(c.title)}`}
          onClick={() => scrollToChapter(i)}
        >
          <span className="nav-tip">{c.title}</span>
        </button>
      ))}
    </nav>
  );
}

export function CTA() {
  return (
    <a className="cta" href={story.cta.href} data-magnetic>
      <span className="cta-mark" aria-hidden="true" />
      {story.cta.label}
    </a>
  );
}

export function MotionToggle() {
  const reduced = useStory((s) => s.reducedMotion);
  const set = useStory((s) => s.setReducedMotion);
  return (
    <button className="motion-toggle" aria-pressed={reduced} onClick={() => set(!reduced)}>
      {reduced ? "Motion: reduced" : "Motion: full"}
    </button>
  );
}

export function HotspotCard() {
  const id = useStory((s) => s.hotspot);
  const close = useStory((s) => s.setHotspot);
  const h = story.hotspots.find((x) => x.id === id);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  if (!h) return null;
  return (
    <div className="card" role="dialog" aria-modal="false" aria-labelledby={`card-${h.id}`}>
      <button className="card-close" onClick={() => close(null)} aria-label="Close">×</button>
      <p className="card-kicker">{h.label}</p>
      <h3 id={`card-${h.id}`}>{h.title}</h3>
      <p>{h.body}</p>
      {h.tags && (
        <ul className="card-tags">
          {h.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
      )}
      {h.cta && <a className="card-cta" href={h.cta.href}>{h.cta.label}</a>}
    </div>
  );
}
