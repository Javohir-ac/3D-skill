"use client";
import dynamic from "next/dynamic";
import Chapters from "./Chapters";
import { Cursor } from "./ui/Cursor";
import { DrawIntro } from "./ui/DrawIntro";
import { FrostIntro } from "./ui/FrostIntro";
import { HoldGate } from "./ui/HoldGate";
import { ChapterNav, CTA, HotspotCard, MotionToggle, ProgressRuler, XP } from "./ui/Hud";
import { Loader } from "./ui/Loader";
import { NotificationWall } from "./ui/NotificationWall";

// WebGL only runs in the browser; the HTML story (Chapters) is server-rendered.
const Experience = dynamic(() => import("@/three/Experience"), { ssr: false });

export default function Story() {
  return (
    <>
      <Experience />
      {/* fixed, accessible layer for 3D-anchored HTML (hotspots) — the canvas itself is aria-hidden */}
      <div id="hotspot-layer" className="hotspot-layer" />
      <Chapters />
      <ProgressRuler />
      <XP />
      <ChapterNav />
      <CTA />
      <MotionToggle />
      <HoldGate />
      <DrawIntro />
      <FrostIntro />
      <NotificationWall />
      <HotspotCard />
      <Loader />
      <Cursor />
    </>
  );
}
