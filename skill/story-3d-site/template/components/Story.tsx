"use client";
import dynamic from "next/dynamic";
import Chapters from "./Chapters";
import { Cursor } from "./ui/Cursor";
import { DrawIntro } from "./ui/DrawIntro";
import { HoldGate } from "./ui/HoldGate";
import { ChapterNav, CTA, HotspotCard, MotionToggle, ProgressRuler, XP } from "./ui/Hud";
import { Loader } from "./ui/Loader";

// WebGL only runs in the browser; the HTML story (Chapters) is server-rendered.
const Experience = dynamic(() => import("@/three/Experience"), { ssr: false });

export default function Story() {
  return (
    <>
      <Experience />
      <Chapters />
      <ProgressRuler />
      <XP />
      <ChapterNav />
      <CTA />
      <MotionToggle />
      <HoldGate />
      <DrawIntro />
      <HotspotCard />
      <Loader />
      <Cursor />
    </>
  );
}
