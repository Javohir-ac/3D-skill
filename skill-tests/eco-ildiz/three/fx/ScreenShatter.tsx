"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Mesh, ShaderMaterial } from "three";
import { live } from "@/lib/live";
import { rand } from "@/lib/math";

// A full-screen pane glued to the camera that breaks into triangular shards and
// flies apart (live.fx.shatter 0 → 1), revealing the scene behind it.
// Used by the "breakToDark" transition: the darkness itself shatters.

const COLS = 14;
const ROWS = 9;

const vert = /* glsl */ `
  uniform float uT;
  attribute vec3 aCenter;
  attribute vec4 aRand;
  varying float vFade;
  varying float vLight;
  vec3 rotate(vec3 v, vec3 axis, float a) {
    float s = sin(a), c = cos(a);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }
  void main() {
    // shards near the impact point (centre) go first
    float delay = length(aCenter.xy) * 0.35 + aRand.w * 0.15;
    float t = clamp((uT * 1.6 - delay) / 0.9, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 axis = normalize(aRand.xyz - 0.5 + 0.001);
    vec3 local = rotate(position - aCenter, axis, t * (2.0 + aRand.x * 5.0));
    vec2 dir = normalize(aCenter.xy + (aRand.yz - 0.5) * 0.3 + 0.0001);
    vec3 c = aCenter + vec3(dir * t * (0.6 + aRand.y * 1.4), t * (0.4 + aRand.z * 0.8));
    c.y -= t * t * 0.6;
    vFade = 1.0 - smoothstep(0.75, 1.0, t);
    vLight = abs(sin(t * (3.0 + aRand.x * 4.0) + aRand.y * 6.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c + local * (1.0 - t * 0.35), 1.0);
  }
`;
const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vFade;
  varying float vLight;
  void main() {
    if (vFade < 0.01) discard;
    // facets catch a little light as they tumble (reads as glass, not paper)
    gl_FragColor = vec4(uColor * (0.85 + vLight * 0.35), vFade * uAlpha);
  }
`;

export function ScreenShatter({ color = "#000000", distance = 1 }: { color?: string; distance?: number }) {
  const { camera, size } = useThree();
  const mesh = useRef<Mesh>(null);

  const { geometry, material } = useMemo(() => {
    // jittered grid → two triangles per cell, each triangle its own shard
    const pts: [number, number][][] = [];
    for (let y = 0; y <= ROWS; y++) {
      pts[y] = [];
      for (let x = 0; x <= COLS; x++) {
        const edge = x === 0 || y === 0 || x === COLS || y === ROWS;
        const jx = edge ? 0 : (rand(x * 31 + y * 7) - 0.5) * 0.8;
        const jy = edge ? 0 : (rand(x * 17 + y * 13) - 0.5) * 0.8;
        pts[y][x] = [((x + jx) / COLS) * 2 - 1, ((y + jy) / ROWS) * 2 - 1];
      }
    }
    const pos: number[] = [];
    const cen: number[] = [];
    const rnd: number[] = [];
    let k = 0;
    const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
      const cx = (a[0] + b[0] + c[0]) / 3;
      const cy = (a[1] + b[1] + c[1]) / 3;
      const r = [rand(k * 3.1), rand(k * 5.7), rand(k * 7.3), rand(k * 11.9)];
      k++;
      for (const p of [a, b, c]) {
        pos.push(p[0], p[1], 0);
        cen.push(cx, cy, 0);
        rnd.push(...r);
      }
    };
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const flip = rand(x * 3 + y * 91) > 0.5;
        const [a, b, c, d] = [pts[y][x], pts[y][x + 1], pts[y + 1][x + 1], pts[y + 1][x]];
        if (flip) { tri(a, b, c); tri(a, c, d); } else { tri(a, b, d); tri(b, c, d); }
      }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    geometry.setAttribute("aCenter", new BufferAttribute(new Float32Array(cen), 3));
    geometry.setAttribute("aRand", new BufferAttribute(new Float32Array(rnd), 4));
    const material = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { uT: { value: 0 }, uColor: { value: new Color(color) }, uAlpha: { value: 1 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { geometry, material };
  }, [color]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    m.visible = live.fx.shatterArmed > 0.5;
    if (!m.visible) return;
    material.uniforms.uT.value = live.fx.shatter;
    material.uniforms.uColor.value.copy(live.fx.shatterColor);
    material.uniforms.uAlpha.value = live.fx.shatterAlpha;
    // glue to camera, scaled to exactly cover the viewport at `distance`
    const fov = ((camera as { fov?: number }).fov ?? 35) * (Math.PI / 180);
    const h = Math.tan(fov / 2) * distance * 1.02;
    m.position.copy(camera.position);
    m.quaternion.copy(camera.quaternion);
    m.translateZ(-distance);
    m.scale.set(h * (size.width / size.height), h, 1);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={1000} frustumCulled={false} />;
}
