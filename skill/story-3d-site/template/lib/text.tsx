import { Fragment, type ReactNode } from "react";

/** "*C*ollege would" → <span class="swash">C</span>ollege would */
export function renderSwash(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="swash" aria-hidden="false">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Plain text for aria / metadata. */
export const plain = (text: string) => text.replace(/\*/g, "");
