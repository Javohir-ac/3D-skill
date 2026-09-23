"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  DoubleSide,
  LatheGeometry,
  type Mesh,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  Vector2,
} from "three";
import { makeMatcapTexture } from "./textures";

// Hourglass generated with Blender (tools/models/hourglass.py): nodes "glass"
// and "frame". Height 2 (y -1..1), neck at y = 0. The sand is animated here:
// `fill()` = share of the sand that has already fallen (0 → all on top).

const URL = "/models/hourglass.glb";
const TOP = 0.84; // inner height of one bulb

/** Inner radius of a bulb at height |y| (mirrors bulb_profile() in hourglass.py). */
function bulbR(y: number) {
  const t = 1 - Math.min(1, Math.abs(y) / 0.86); // 0 base → 1 neck
  const bulge = Math.pow(Math.sin(Math.PI * Math.min(1, (1 - t) * 1.05)), 0.8);
  return (0.045 + 0.47 * bulge * (1 - t ** 3)) * 0.93;
}

/** Sand material that discards everything above a local-space height. */
function makeSand(matcap: ReturnType<typeof makeMatcapTexture>) {
  const cut = { value: 1 };
  const m = new MeshMatcapMaterial({ matcap, side: DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uCut = cut;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvY = position.y;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vY;\nuniform float uCut;")
      .replace("void main() {", "void main() {\nif (vY > uCut) discard;");
  };
  return { m, cut };
}

export interface HourglassProps {
  /** 0 = all sand on top, 1 = all fallen. Called every frame. */
  fill: () => number;
  sand?: { base?: string; light?: string; rim?: string; dark?: string };
  wood?: { base?: string; light?: string; rim?: string; dark?: string };
}

export const WALNUT = { base: "#6b4a36", light: "#f0d2b0", rim: "#ffd9b0", dark: "#1c100a" };
export const GOLD_SAND = { base: "#e0b25c", light: "#fff3cf", rim: "#ffe2a0", dark: "#6a4412" };

export function Hourglass({ fill, sand = GOLD_SAND, wood = WALNUT, ...group }: HourglassProps & Omit<ThreeElements["group"], "ref">) {
  const gltf = useGLTF(URL, false, true);
  const top = useRef<Mesh>(null);
  const bottom = useRef<Mesh>(null);
  const surface = useRef<Mesh>(null);
  const mound = useRef<Mesh>(null);
  const stream = useRef<Mesh>(null);

  const mats = useMemo(() => {
    const sandCap = makeMatcapTexture(sand);
    return {
      glass: new MeshPhysicalMaterial({
        color: "#ffffff", roughness: 0.04, metalness: 0, clearcoat: 1, transparent: true,
        opacity: 0.22, envMapIntensity: 1.6, depthWrite: false, side: DoubleSide,
      }),
      frame: new MeshMatcapMaterial({ matcap: makeMatcapTexture(wood) }),
      sandFlat: new MeshMatcapMaterial({ matcap: sandCap, side: DoubleSide }),
      top: makeSand(sandCap),
      bottom: makeSand(sandCap),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const isGlass = /glass/i.test(mesh.name) || /glass/i.test(mesh.parent?.name ?? "");
      mesh.material = isGlass ? mats.glass : mats.frame;
      if (isGlass) mesh.renderOrder = 2;
    });
    return root;
  }, [gltf, mats]);

  // sand volumes: interior of each bulb as a lathe, clipped in the shader
  const geo = useMemo(() => {
    const up: Vector2[] = [];
    for (let i = 0; i <= 32; i++) {
      const y = 0.015 + (i / 32) * (TOP - 0.015);
      up.push(new Vector2(bulbR(y), y));
    }
    const down = up.map((v) => new Vector2(v.x, -v.y)).reverse();
    return { top: new LatheGeometry(up, 48), bottom: new LatheGeometry(down, 48) };
  }, []);

  useFrame(() => {
    const f = Math.min(1, Math.max(0, fill()));
    // top level sinks toward the neck; bottom pile rises from the base
    const topY = 0.02 + (TOP - 0.2) * Math.pow(1 - f, 0.7);
    const botY = -TOP + (TOP - 0.28) * Math.pow(f, 0.8);
    mats.top.cut.value = topY;
    mats.bottom.cut.value = botY;
    if (top.current) top.current.visible = f < 0.995;
    if (surface.current) {
      surface.current.position.y = topY;
      surface.current.scale.setScalar(bulbR(topY));
      surface.current.visible = f < 0.995;
    }
    if (bottom.current) bottom.current.visible = f > 0.005;
    const moundH = 0.03 + 0.1 * Math.min(1, f * 4);
    if (mound.current) {
      mound.current.position.y = botY + moundH / 2;
      mound.current.scale.set(bulbR(botY), moundH, bulbR(botY));
      mound.current.visible = f > 0.005;
    }
    if (stream.current) {
      const len = Math.max(0.01, -(botY + moundH));
      stream.current.position.y = -len / 2;
      stream.current.scale.y = len;
      stream.current.visible = f > 0.002 && f < 0.995;
    }
  });

  return (
    <group {...group}>
      <mesh ref={top} geometry={geo.top} material={mats.top.m} />
      <mesh ref={surface} rotation={[-Math.PI / 2, 0, 0]} material={mats.sandFlat}>
        <circleGeometry args={[1, 48]} />
      </mesh>
      <mesh ref={bottom} geometry={geo.bottom} material={mats.bottom.m} />
      <mesh ref={mound} material={mats.sandFlat}>
        <coneGeometry args={[1, 1, 48, 1, true]} />
      </mesh>
      <mesh ref={stream} material={mats.sandFlat}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8, 1, true]} />
      </mesh>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(URL, false, true);
