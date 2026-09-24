"use client";
import { useEffect, useRef } from "react";
import { live } from "@/lib/live";
import { useStory } from "@/lib/store";
import { ui } from "@/lib/ui";

// Custom cursor: a precise dot + a lagging ring that reacts to what it is over
// (links/buttons → grows, gate → "hold", intro → "draw", finale scene → "drag").
// Elements with [data-magnetic] lean toward the pointer (via --mx/--my CSS vars).
// Only on fine pointers (mouse / trackpad); touch devices keep the native UX.

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const reduced = useStory((s) => s.reducedMotion);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;
    let magnets: HTMLElement[] = [];
    const refreshMagnets = () => (magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")));
    refreshMagnets();
    const mo = new MutationObserver(refreshMagnets);
    mo.observe(document.body, { childList: true, subtree: true });

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      live.mouse.x = e.clientX;
      live.mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const tick = () => {
      const k = reduced ? 1 : 0.18;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      // state from what is under the pointer
      const el = document.elementFromPoint(pos.x, pos.y) as HTMLElement | null;
      let mode = "";
      if (el?.closest(".intro, .frost-intro")) mode = "draw";
      else if (el?.closest(".nwall") && !el.closest("button")) mode = "swipe";
      else if (el?.closest(".gate-btn")) mode = "hold";
      else if (el?.closest("a, button, [role=button]")) mode = "link";
      if (ring.current && ring.current.dataset.mode !== mode) {
        ring.current.dataset.mode = mode;
        if (label.current) label.current.textContent = mode === "hold" ? ui.cursorHold : mode === "draw" ? ui.cursorDraw : mode === "drag" ? ui.cursorDrag : mode === "swipe" ? ui.cursorSwipe : "";
      }

      // magnetic elements
      for (const m of magnets) {
        const r = m.getBoundingClientRect();
        const cx = r.left + r.width / 2 - (parseFloat(m.style.getPropertyValue("--mx")) || 0);
        const cy = r.top + r.height / 2 - (parseFloat(m.style.getPropertyValue("--my")) || 0);
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const reach = Math.max(r.width, r.height) * 0.9 + 40;
        const inside = Math.hypot(dx, dy) < reach && !reduced;
        const tx = inside ? dx * 0.28 : 0;
        const ty = inside ? dy * 0.28 : 0;
        const px = parseFloat(m.style.getPropertyValue("--mx")) || 0;
        const py = parseFloat(m.style.getPropertyValue("--my")) || 0;
        m.style.setProperty("--mx", `${(px + (tx - px) * 0.2).toFixed(2)}px`);
        m.style.setProperty("--my", `${(py + (ty - py) * 0.2).toFixed(2)}px`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onDown = () => ring.current?.classList.add("is-down");
    const onUp = () => ring.current?.classList.remove("is-down");
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [reduced]);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
