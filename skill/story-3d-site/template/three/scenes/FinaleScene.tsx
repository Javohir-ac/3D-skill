"use client";
import { Html, PresentationControls } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { range } from "@/lib/math";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { CityGrid } from "../fx/CityGrid";
import { SegmentedRings } from "../fx/SegmentedRings";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 7 — finale: the world becomes the product. Drag to look around,
// hotspots open HTML cards (content in story.config → hotspots). The city
// seen by day in the reveal is now at night, and its windows switch on one by
// one as you scroll — every light is an hour someone got back.
export default function FinaleScene(props: SceneProps) {
  const { root, p } = useChapter(props);
  const setHotspot = useStory((s) => s.setHotspot);
  // Html ignores the parent group's `visible`, so mount the labels only while
  // this chapter is on screen (otherwise they float over the previous chapter).
  const onScreen = useStory((s) => s.active === props.index);
  // Html must live in a FIXED layer: the canvas event source is <body>, and
  // drei would otherwise append the labels to <body> where they scroll away.
  const portal = useMemo(() => ({ current: document.getElementById("hotspot-layer") as HTMLElement }), []);
  return (
    <group ref={root}>
      <hemisphereLight args={["#bfe9da", "#1a2e27", 0.9]} />
      <directionalLight position={[5, 10, 4]} intensity={1.4} color="#d6f5ea" />
      <PresentationControls global snap polar={[-0.2, 0.3]} azimuth={[-0.6, 0.6]} speed={1.2}>
        <group position={[0, -1.1, -1.5]} rotation={[0.55, 0.3, 0]} scale={0.8}>
          <Suspense fallback={null}>
            <CityGrid base="#3d514a" lit={() => 0.1 + range(p(), 0.05, 0.9) * 0.5} />
          </Suspense>
          <group position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.7}>
            <SegmentedRings color="#39ff9f" core={false} />
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
