"use client";
import { Html, PresentationControls } from "@react-three/drei";
import { useMemo } from "react";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import { CityGrid } from "../fx/CityGrid";
import { SegmentedRings } from "../fx/SegmentedRings";
import { useChapter, type SceneProps } from "../useChapter";

// Chapter 7 — finale: the world becomes the product. Drag to look around,
// hotspots open HTML cards (content in story.config → hotspots).
export default function FinaleScene(props: SceneProps) {
  const { root } = useChapter(props);
  const setHotspot = useStory((s) => s.setHotspot);
  // Html must live in a FIXED layer: the canvas event source is <body>, and
  // drei would otherwise append the labels to <body> where they scroll away.
  const portal = useMemo(() => ({ current: document.getElementById("hotspot-layer") as HTMLElement }), []);
  return (
    <group ref={root}>
      <hemisphereLight args={["#ffffff", "#27463a", 1.1]} />
      <directionalLight position={[5, 10, 4]} intensity={2.2} />
      <PresentationControls global snap polar={[-0.2, 0.3]} azimuth={[-0.6, 0.6]} speed={1.2}>
        <group position={[0, -1.1, -1.5]} rotation={[0.55, 0.3, 0]} scale={0.8}>
          <CityGrid base="#c9d6d0" />
          <group position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.7}>
            <SegmentedRings color="#39ff9f" core={false} />
          </group>
          {story.hotspots.map((h) => (
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
