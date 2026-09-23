"use client";
import { useEffect, useRef } from "react";
import { initScroll } from "@/lib/scroll";
import { renderSwash } from "@/lib/text";
import { story } from "@/story/story.config";
import type { StoryLine } from "@/story/types";

// The scroll track. Each chapter is a tall <section>; its copy is real HTML
// (SEO + screen readers) laid out in a fixed layer and faded by lib/scroll.ts.
function Line({ line, chapter, first }: { line: StoryLine; chapter: number; first: boolean }) {
  const Tag = line.tag ?? (first ? "h2" : "p");
  const [a, b] = line.at ?? [0, 1];
  return (
    <div
      className={`line anchor-${line.anchor ?? "center"}`}
      data-line
      data-chapter={chapter}
      data-a={a}
      data-b={b}
      style={{ opacity: 0 }}
    >
      <Tag className={`copy style-${line.style ?? "serif"} size-${line.size ?? "lg"}`}>{renderSwash(line.text)}</Tag>
      {line.source && (
        <a className="source" href={line.source.href} target="_blank" rel="noreferrer">
          Source: {line.source.label}
        </a>
      )}
    </div>
  );
}

export default function Chapters() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? initScroll(root.current) : undefined), []);
  return (
    <main ref={root} className="track">
      {story.chapters.map((c, i) => (
        <section
          key={c.id}
          id={c.id}
          data-chapter={i}
          aria-label={c.title}
          style={{ height: `${c.length * 100}vh` }}
        >
          <div className="chapter-copy">
            {c.lines.map((l, j) => (
              <Line key={j} line={l} chapter={i} first={j === 0} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
