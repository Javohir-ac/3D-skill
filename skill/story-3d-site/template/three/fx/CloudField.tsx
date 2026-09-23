"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color, DoubleSide, DynamicDrawUsage, Euler, InstancedBufferAttribute, InstancedMesh,
  Matrix4, PlaneGeometry, Quaternion, ShaderMaterial, Vector3,
} from "three";
import { live } from "@/lib/live";
import { rand } from "@/lib/math";
import { makeCloudAtlas } from "./textures";

// Layered sprite clouds (technique studied on why.zero.university, re-implemented):
// ~200 textured quads in depth layers, ONE instanced draw call. Parallax drift
// (near = fast), endless horizontal wrap, gentle z-bob, scroll-velocity boost,
// and a "dive" that pulls every layer toward the camera. Quads fade near the
// camera, far away and at screen edges so no hard sprite borders ever show.

const LAYERS = [
  { z: -1.5, n: 1, s: [1.6, 2.6] }, { z: -3, n: 3, s: [2.2, 3.8] }, { z: -5, n: 5, s: [2.8, 5] },
  { z: -7, n: 8, s: [3.6, 6.2] }, { z: -9.5, n: 12, s: [4.4, 7.4] }, { z: -12, n: 20, s: [5.2, 8.6] },
  { z: -15, n: 22, s: [6, 9.8] }, { z: -18, n: 22, s: [7, 11] }, { z: -21, n: 22, s: [8, 12.5] },
  { z: -24, n: 20, s: [9, 14] }, { z: -28, n: 18, s: [10, 15.5] }, { z: -32, n: 15, s: [11, 17] },
  { z: -36, n: 12, s: [12, 19] }, { z: -40, n: 9, s: [13, 21] }, { z: -45, n: 6, s: [15, 24] },
];

const vert = /* glsl */ `
  attribute vec4 aRect;
  attribute float aAlpha;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vUv = aRect.xy + uv * aRect.zw;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vec4 t = texture2D(uMap, vUv);
    float a = t.a * vAlpha * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * t.rgb, a);
  }
`;

export interface CloudFieldProps {
  /** 0..1 — how far the camera has dived through the layers (drive from scroll). */
  dive?: () => number;
  /** Overall opacity 0..1 (drive from scroll for fade in/out). */
  opacity?: () => number;
  color?: string;
  /** Base horizontal drift speed (world units/s). */
  speed?: number;
  /** Total z travel of the dive. */
  depth?: number;
  seed?: number;
}

export function CloudField({ dive, opacity, color = "#ffffff", speed = 0.9, depth = 30, seed = 1 }: CloudFieldProps) {
  const { camera, size } = useThree();
  const mesh = useRef<InstancedMesh>(null);

  const { geometry, material, clouds } = useMemo(() => {
    const atlas = makeCloudAtlas();
    const counter = { n: seed * 9973 };
    const r = () => rand(counter.n++);
    const clouds = LAYERS.flatMap((L) =>
      Array.from({ length: L.n }, () => {
        const z = L.z + (r() - 0.5) * 2;
        const spreadX = Math.abs(z) * 0.62;
        const spreadY = Math.abs(z) * 0.4;
        const sc = L.s[0] + r() * (L.s[1] - L.s[0]);
        return {
          x: (r() * 2 - 1) * spreadX, y: (r() * 2 - 1) * spreadY, z,
          sx: sc, sy: sc * 0.55, rot: (r() - 0.5) * 0.5,
          rect: atlas.rects[Math.floor(r() * atlas.rects.length)],
          phase: r() * Math.PI * 2, freq: 0.25 + r() * 0.45, amp: 0.2 + r() * 0.4,
          wrap: Math.abs(z) * 0.62 + 6,
        };
      }),
    );
    const geometry = new PlaneGeometry(1, 1);
    const rect = new Float32Array(clouds.length * 4);
    clouds.forEach((c, i) => rect.set(c.rect, i * 4));
    geometry.setAttribute("aRect", new InstancedBufferAttribute(rect, 4));
    const alpha = new InstancedBufferAttribute(new Float32Array(clouds.length).fill(1), 1);
    alpha.setUsage(DynamicDrawUsage);
    geometry.setAttribute("aAlpha", alpha);
    const material = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { uMap: { value: atlas.texture }, uColor: { value: new Color(color) }, uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    return { geometry, material, clouds };
  }, [seed, color]);

  const tmp = useMemo(() => ({ m: new Matrix4(), p: new Vector3(), q: new Quaternion(), s: new Vector3(), e: new Euler() }), []);
  const state = useRef({ drift: 0, time: 0 });

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const st = state.current;
    const v = Math.min(Math.abs(live.velocity), 60);
    st.drift += (speed + v * 0.04) * dt;
    st.time += dt;
    const d = dive ? dive() : 0;
    const travel = d * d * (3 - 2 * d) * depth;
    material.uniforms.uOpacity.value = opacity ? opacity() : 1;

    const fov = ((camera as { fov?: number }).fov ?? 35) * (Math.PI / 180);
    const tanHalf = Math.tan(fov / 2);
    const aspect = size.width / size.height;
    const alpha = geometry.getAttribute("aAlpha") as InstancedBufferAttribute;

    clouds.forEach((c, i) => {
      const z = c.z - 6 + travel + Math.sin(st.time * c.freq + c.phase) * c.amp;
      const par = 1 / (Math.abs(c.z) * 0.08 + 1); // near layers drift faster
      const span = c.wrap * 2;
      const x = ((((c.x + st.drift * par + c.wrap) % span) + span) % span) - c.wrap;

      // fades: too close / too far / outside the frustum edge band
      const near = z > -0.4 ? 0 : z > -2.2 ? (-0.4 - z) / 1.8 : 1;
      const far = z < -62 ? 0 : z < -12 ? (z + 62) / 50 : 1;
      const halfH = tanHalf * Math.max(0.5, Math.abs(z));
      const halfW = halfH * aspect;
      const edgeX = Math.min(1, Math.max(0, (halfW * 1.35 - Math.abs(x)) / (halfW * 0.35)));
      const edgeY = Math.min(1, Math.max(0, (halfH * 1.35 - Math.abs(c.y)) / (halfH * 0.35)));
      alpha.setX(i, near * far * edgeX * edgeY);

      tmp.p.set(x, c.y, z);
      tmp.e.set(0, 0, c.rot);
      tmp.q.setFromEuler(tmp.e);
      tmp.s.set(c.sx, c.sy, 1);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      m.setMatrixAt(i, tmp.m);
    });
    m.instanceMatrix.needsUpdate = true;
    alpha.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, clouds.length]} frustumCulled={false} renderOrder={2} />;
}
