import gsap from "gsap";
import type { Beat } from "@/story/types";
import { live } from "./live";

// One-shot story beats (fired when scrolling forward past `at`). They keep the
// rhythm dense — something happens every few seconds, like in a film edit.
// (Sound is intentionally not wired in yet — add a hook here if a brief needs it.)
export function fireBeat(b: Beat, reduced: boolean) {
  const s = b.strength ?? 1;
  const fx = live.fx;
  switch (b.fx) {
    case "pulse":
      gsap.fromTo(fx, { pulse: 0 }, { pulse: s, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" });
      break;
    case "shake":
      if (reduced) break;
      gsap.fromTo(fx, { shake: s }, { shake: 0, duration: 0.7, ease: "power3.out", overwrite: "auto" });
      break;
    case "flash":
      gsap.fromTo(fx, { flash: 0 }, { flash: 0.22 * s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto" });
      break;
    case "burst":
      fx.burst++;
      gsap.fromTo(fx, { pulse: 0 }, { pulse: 0.8 * s, duration: 0.2, yoyo: true, repeat: 1, overwrite: "auto" });
      break;
  }
}
