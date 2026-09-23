import { Fragment, type CSSProperties, type ReactNode } from "react";

/** Plain text for aria / metadata. */
export const plain = (text: string) => text.replace(/\*/g, "");

/** "*C*ollege would" → <span class="swash">C</span>ollege would (static, no animation). */
export function renderSwash(text: string): ReactNode {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? <span key={i} className="swash">{part}</span> : <Fragment key={i}>{part}</Fragment>,
  );
}

/**
 * Animated copy: every character is a span with --d (0..1 stagger position).
 * CSS combines it with the line's --in (set by lib/scroll.ts) so letters rise
 * in one after another and swash capitals "write" themselves in with a wipe.
 * Screen readers get the plain sentence once (sr-only), not letter spans.
 */
export function renderAnimated(text: string): ReactNode {
  const segs = text.split(/\*([^*]+)\*/g).flatMap((part, i) => [...part].map((ch) => ({ ch, swash: i % 2 === 1 })));
  const total = Math.max(1, segs.length - 1);
  const words: { ch: string; swash: boolean; i: number }[][] = [[]];
  segs.forEach((s, i) => {
    if (s.ch === " ") words.push([]);
    else words[words.length - 1].push({ ...s, i });
  });
  return (
    <>
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={wi}>
            {wi > 0 && " "}
            <span className="word">
              {w.map((c) => (
                <span key={c.i} className={c.swash ? "ch swash" : "ch"} style={{ "--d": (c.i / total).toFixed(3) } as CSSProperties}>
                  {c.ch}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
