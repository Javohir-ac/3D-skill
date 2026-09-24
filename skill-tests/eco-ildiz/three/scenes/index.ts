import type { ComponentType } from "react";
import type { SceneName } from "@/story/types";
import type { SceneProps } from "../useChapter";
import ChargeScene from "./ChargeScene";
import DreamScene from "./DreamScene";
import EvidenceScene from "./EvidenceScene";
import FinaleScene from "./FinaleScene";
import FractureScene from "./FractureScene";
import IntroScene from "./IntroScene";
import RevealScene from "./RevealScene";

// Register every scene here; chapters reference them by name in story.config.ts.
export const scenes: Record<SceneName, ComponentType<SceneProps>> = {
  intro: IntroScene,
  dream: DreamScene,
  fracture: FractureScene,
  evidence: EvidenceScene,
  charge: ChargeScene,
  reveal: RevealScene,
  finale: FinaleScene,
};
