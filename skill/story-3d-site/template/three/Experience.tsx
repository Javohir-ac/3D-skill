"use client";
import { AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { ACESFilmicToneMapping, Color } from "three";
import { live } from "@/lib/live";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { CameraRig } from "./CameraRig";
import { ScreenShatter } from "./fx/ScreenShatter";
import { PostFX } from "./postfx/PostFX";
import { scenes } from "./scenes";

const bgs = story.chapters.map((c) => new Color(c.background));

function Background() {
  const scene = useThree((s) => s.scene);
  const c = useRef(new Color(story.chapters[0].background));
  useEffect(() => {
    scene.background = c.current;
  }, [scene]);
  useFrame((_, dt) => c.current.lerp(bgs[live.active] ?? bgs[0], 1 - Math.exp(-4 * dt)));
  return null;
}

/** Marks the experience as loaded once suspense resolved and a few frames rendered. */
function LoadWatcher() {
  const frames = useRef(0);
  const setLoaded = useStory((s) => s.setLoaded);
  useFrame(() => {
    frames.current++;
    if (frames.current === 8) document.fonts.ready.then(() => setLoaded(true));
  });
  return null;
}

function Scenes() {
  const active = useStory((s) => s.active);
  // Only the active chapter and its neighbours are mounted (memory + GPU budget).
  return (
    <>
      {story.chapters.map((c, i) => {
        if (Math.abs(i - active) > 1) return null;
        const Scene = scenes[c.scene];
        return <Scene key={c.id} id={c.id} index={i} />;
      })}
    </>
  );
}

export default function Experience() {
  return (
    <div className="canvas-layer" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
        }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Background />
        <Environment resolution={128}>
          {/* procedural studio lighting — no HDR download needed */}
          <Lightformer intensity={2} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} scale={[2, 6, 1]} color="#ffe6f0" />
          <Lightformer intensity={1.2} position={[5, 0, 2]} scale={[2, 6, 1]} color="#dffaf0" />
        </Environment>
        <CameraRig>
          <Suspense fallback={null}>
            <Scenes />
          </Suspense>
        </CameraRig>
        <ScreenShatter />
        <PostFX />
        <AdaptiveDpr pixelated={false} />
        <LoadWatcher />
      </Canvas>
    </div>
  );
}
