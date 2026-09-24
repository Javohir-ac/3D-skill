"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { story } from "@/story/story.config";
import type { Backdrop as BackdropCfg } from "@/story/types";

// Procedural living background drawn behind everything (a clip-space quad):
// vertical gradient + slow aurora/fog flow + god rays from above + twinkling
// stars. Every chapter defines its own values; they crossfade smoothly.
// Replaces flat clear colours — the frame is never "dead".

const frag = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uAccent;
  uniform float uFlow;
  uniform float uRays;
  uniform float uStars;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + 3.1; a *= 0.5; } return v; }

  void main() {
    vec2 uv = vUv;
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    vec2 par = uPointer * 0.015; // tiny parallax: the backdrop is "far away"
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y + par.y));

    // aurora / fog: domain-warped fbm bands drifting sideways
    vec2 q = (uv + par) * asp * 2.2;
    float w = fbm(q + vec2(uTime * 0.03, 0.0));
    float band = fbm(q * vec2(0.8, 2.4) + vec2(w * 2.0 - uTime * 0.05, uTime * 0.02));
    float aur = smoothstep(0.45, 0.85, band) * (0.35 + 0.65 * smoothstep(0.1, 0.9, uv.y));
    col += uAccent * aur * uFlow * 0.55;

    // god rays: soft shafts fanning down from a point above the frame
    vec2 src = vec2(0.5 + par.x * 4.0, 1.25);
    vec2 d = (uv - src) * asp;
    float ang = atan(d.x, -d.y);
    float shafts = fbm(vec2(ang * 7.0, uTime * 0.05)) * fbm(vec2(ang * 13.0 + 2.0, -uTime * 0.04));
    float fall = smoothstep(1.6, 0.2, length(d));
    col += mix(uTop, vec3(1.0), 0.6) * smoothstep(0.18, 0.55, shafts) * fall * uRays * 0.5;

    // stars: sparse hashed points that twinkle
    vec2 g = (uv + par * 0.5) * uRes / 2.2;
    vec2 cell = floor(g);
    float h = hash(cell);
    float star = step(1.0 - 0.012 * uStars, h) * smoothstep(0.45, 0.0, length(fract(g) - 0.5));
    col += star * (0.6 + 0.4 * sin(uTime * 2.0 + h * 40.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

type Target = { top: Color; bottom: Color; accent: Color; flow: number; rays: number; stars: number };

function toTarget(bg: string, b?: BackdropCfg): Target {
  const base = new Color(bg);
  return {
    top: new Color(b?.top ?? base.clone().offsetHSL(0, 0, 0.06)),
    bottom: new Color(b?.bottom ?? base.clone().offsetHSL(0, 0, -0.06)),
    accent: new Color(b?.accent ?? base.clone().offsetHSL(0, 0.1, 0.1)),
    flow: b?.flow ?? 0.3,
    rays: b?.rays ?? 0,
    stars: b?.stars ?? 0,
  };
}
const targets = story.chapters.map((c) => toTarget(c.background, c.backdrop));

export function Backdrop() {
  const { geometry, material } = useMemo(() => {
    const t = targets[0];
    const material = new ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
      fragmentShader: frag,
      uniforms: {
        uTop: { value: t.top.clone() }, uBottom: { value: t.bottom.clone() }, uAccent: { value: t.accent.clone() },
        uFlow: { value: t.flow }, uRays: { value: t.rays }, uStars: { value: t.stars },
        uTime: { value: 0 }, uRes: { value: new Vector2(1, 1) }, uPointer: { value: new Vector2() },
      },
      depthTest: false,
      depthWrite: false,
    });
    return { geometry: new PlaneGeometry(2, 2), material };
  }, []);

  useFrame((state, dt) => {
    const t = targets[live.active] ?? targets[0];
    const u = material.uniforms;
    const k = 1 - Math.exp(-2.5 * dt);
    (u.uTop.value as Color).lerp(t.top, k);
    (u.uBottom.value as Color).lerp(t.bottom, k);
    (u.uAccent.value as Color).lerp(t.accent, k);
    u.uFlow.value = damp(u.uFlow.value, t.flow, 2.5, dt);
    u.uRays.value = damp(u.uRays.value, t.rays, 2.5, dt);
    u.uStars.value = damp(u.uStars.value, t.stars, 2.5, dt);
    u.uTime.value += dt;
    (u.uRes.value as Vector2).set(state.size.width, state.size.height);
    (u.uPointer.value as Vector2).copy(live.pointer);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-1000} />;
}
