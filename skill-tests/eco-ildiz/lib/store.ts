import { create } from "zustand";

// React-level UI state (changes rarely). Per-frame values live in lib/live.ts.
interface StoryState {
  loaded: boolean;
  active: number;
  /** Chapter id whose gate is currently blocking the scroll. */
  gate: string | null;
  /** True while a gate cinematic is playing. */
  transitioning: boolean;
  completedGates: string[];
  xp: number;
  xpBurst: number; // increments to trigger the "+XP" animation
  reducedMotion: boolean;
  hotspot: string | null;
  /** Loader finished — the intro interaction (if any) may start. */
  ready: boolean;
  /** Intro interaction (draw-to-begin) solved or skipped. */
  introDone: boolean;
  setReady: (v: boolean) => void;
  finishIntro: (xp: number) => void;
  setLoaded: (v: boolean) => void;
  setActive: (i: number) => void;
  openGate: (id: string) => void;
  startTransition: () => void;
  completeGate: (id: string, xp: number) => void;
  setReducedMotion: (v: boolean) => void;
  setHotspot: (id: string | null) => void;
}

export const useStory = create<StoryState>((set) => ({
  loaded: false,
  active: 0,
  gate: null,
  transitioning: false,
  completedGates: [],
  xp: 0,
  xpBurst: 0,
  reducedMotion: false,
  hotspot: null,
  ready: false,
  introDone: false,
  setReady: (ready) => set({ ready }),
  finishIntro: (xp) => set((s) => (s.introDone ? s : { introDone: true, xp: s.xp + xp, xpBurst: xp ? s.xpBurst + 1 : s.xpBurst })),
  setLoaded: (loaded) => set({ loaded }),
  setActive: (active) => set((s) => (s.active === active ? s : { active })),
  openGate: (gate) => set({ gate }),
  startTransition: () => set({ transitioning: true }),
  completeGate: (id, xp) =>
    set((s) => ({
      gate: null,
      transitioning: false,
      completedGates: s.completedGates.includes(id) ? s.completedGates : [...s.completedGates, id],
      xp: s.completedGates.includes(id) ? s.xp : s.xp + xp,
      xpBurst: s.completedGates.includes(id) ? s.xpBurst : s.xpBurst + 1,
    })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setHotspot: (hotspot) => set({ hotspot }),
}));
