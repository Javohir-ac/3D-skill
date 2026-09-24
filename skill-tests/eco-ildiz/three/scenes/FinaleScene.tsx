"use client";
import { Html, PresentationControls } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { CityGrid } from "../fx/CityGrid";
import { SegmentedRings } from "../fx/SegmentedRings";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 7 — finale: the world becomes the product. Drag to look around,
// hotspots open HTML cards (content in story.config → hotspots). The same
// daylight city the reveal fell into, now close enough to explore.
// (CityGrid's `lit` prop can switch windows on for a night variant.)
export default function FinaleScene(props: SceneProps) {
  const { root } = useChapter(props);
  const setHotspot = useStory((s) => s.setHotspot);
  // Html ignores the parent group's `visible`, so mount the labels only while
  // this chapter is on screen (otherwise they float over the previous chapter).
  const onScreen = useStory((s) => s.active === props.index);
  // Html must live in a FIXED layer: the canvas event source is <body>, and
  // drei would otherwise append the labels to <body> where they scroll away.
  const portal = useMemo(() => ({ current: document.getElementById("hotspot-layer") as HTMLElement }), []);
  return (
    <group ref={root}>
      <hemisphereLight args={["#ffffff", "#7f958f", 1.3]} />
      <directionalLight position={[5, 10, 4]} intensity={2.4} color="#fff4e6" />
      <PresentationControls global snap polar={[-0.2, 0.3]} azimuth={[-0.6, 0.6]} speed={1.2}>
        <group position={[0, -1.45, -1.2]} rotation={[0.3, 0.55, 0]} scale={0.95}>
          <Suspense fallback={null}>
            <CityGrid base="#a8b5ac" parks={0.4} />
          </Suspense>
          <group position={[0, 2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.45}>
            <SegmentedRings color="#6fe08a" core={false} />
          </group>
          {onScreen && story.hotspots.map((h) => (
            <Html key={h.id} position={h.position} center portal={portal} zIndexRange={[20, 0]}>
              <button className="hotspot" onClick={() => setHotspot(h.id)} aria-label={`${h.label}: ${h.title}`}>
                <span className="hotspot-dot" />
                <span className="hotspot-label">{h.label}</span>
              </button>
            </Html>
          ))}
        </group>
      </PresentationControls>
    </group>
  );
}
