import type gsap from "gsap";
import type { LiveFx } from "@/lib/live";
import type { TransitionName } from "./types";

// Gate cinematics. Each builder appends tweens to a paused-by-caller timeline and
// MUST call ctx.jump() exactly once — at the moment the screen is fully hidden
// (black, white or covered). That is where the next chapter's scene is swapped in.
// Pattern learned from why.zero.university: hide the swap inside darkness / light.

export interface TransitionCtx {
  jump: () => void;
  reduced: boolean;
}

type Builder = (tl: gsap.core.Timeline, fx: LiveFx, ctx: TransitionCtx) => void;

const builders: Record<TransitionName, Builder> = {
  // Paradise → betrayal. Glitch strobe, colour collapses to red-black, a beat of
  // total darkness, then the darkness shatters like glass revealing the new world.
  breakToDark(tl, fx, { jump, reduced }) {
    fx.curtainColor.set("#000000");
    if (!reduced) {
      tl.to(fx, { glitch: 1, rgbShift: 1, duration: 0.06 })
        .to(fx, { glitch: 0.15, duration: 0.09, repeat: 5, yoyo: true, ease: "steps(1)" })
        .to(fx, { rgbShift: 0.2, duration: 0.3 }, "<");
    }
    tl.to(fx, { curtain: 1, duration: reduced ? 0.4 : 0.9, ease: "power2.in" })
      .set(fx, { glitch: 0, rgbShift: 0 })
      .call(jump)
      .set(fx, { shatter: 0, shatterArmed: 1 })
      .to({}, { duration: reduced ? 0.1 : 0.7 }) // hold the dark: let it land
      .set(fx, { curtain: 0 }) // shards (black) now cover the screen
      .to(fx, { shatter: 1, duration: reduced ? 0.5 : 1.5, ease: "power3.out" })
      .set(fx, { shatterArmed: 0 });
  },

  // Despair → hope. Rings implode (breath held), explode with a double flash,
  // everything melts into white, next chapter fades up from the light.
  implodeToLight(tl, fx, { jump, reduced }) {
    fx.flashColor.set("#b8ffd9");
    tl.to(fx, { charge: 0.5, duration: reduced ? 0.4 : 1.3, ease: "power2.inOut" })
      .to(fx, { charge: 1, duration: reduced ? 0.3 : 0.9, ease: "expo.in" })
      .to(fx, { flash: 0.8, duration: 0.12, ease: "power2.in" }, "-=0.25")
      .to(fx, { flash: 0.35, duration: 0.08 })
      .call(() => { fx.flashColor.set("#d9efe5"); }) // soft mint, never pure white (eye comfort)
      .to(fx, { flash: 1, duration: 0.25, ease: "power2.out" })
      .call(jump)
      .set(fx, { charge: 0 })
      .to({}, { duration: reduced ? 0.1 : 0.45 }) // the "new world" beat
      .to(fx, { flash: 0, duration: reduced ? 0.5 : 1.6, ease: "power2.out" });
  },

  // Memory fades: colour drains to sepia with heavy grain, hard cut on the
  // greyest frame, colour flows back into the new chapter.
  drainCut(tl, fx, { jump, reduced }) {
    fx.curtainColor.set("#2a2118");
    tl.to(fx, { drain: 1, grainBoost: 1, duration: reduced ? 0.4 : 1.4, ease: "power1.in" })
      .to(fx, { curtain: 0.85, duration: 0.25, ease: "power2.in" })
      .call(jump)
      .to(fx, { curtain: 0, duration: 0.3 }, "+=0.15")
      .to(fx, { drain: 0, grainBoost: 0, duration: reduced ? 0.4 : 1.6, ease: "power2.out" });
  },

  // The whole frame chars from the edges and burns through into the next world.
  burnThrough(tl, fx, { jump, reduced }) {
    tl.to(fx, { burn: 1, duration: reduced ? 0.5 : 1.6, ease: "power1.in" })
      .call(jump)
      .to({}, { duration: 0.25 })
      .to(fx, { burn: 0, duration: reduced ? 0.5 : 1.8, ease: "power2.out" });
  },

  whiteout(tl, fx, { jump, reduced }) {
    fx.flashColor.set("#e4efea");
    tl.to(fx, { flash: 1, duration: reduced ? 0.3 : 0.8, ease: "power2.in" })
      .call(jump)
      .to(fx, { flash: 0, duration: reduced ? 0.4 : 1.2, ease: "power2.out" }, "+=0.2");
  },

  blackout(tl, fx, { jump, reduced }) {
    fx.curtainColor.set("#000000");
    tl.to(fx, { curtain: 1, duration: reduced ? 0.3 : 0.8, ease: "power2.in" })
      .call(jump)
      .to(fx, { curtain: 0, duration: reduced ? 0.4 : 1.2, ease: "power2.out" }, "+=0.3");
  },
};

export function buildTransition(name: TransitionName, tl: gsap.core.Timeline, fx: LiveFx, ctx: TransitionCtx) {
  builders[name](tl, fx, ctx);
}
