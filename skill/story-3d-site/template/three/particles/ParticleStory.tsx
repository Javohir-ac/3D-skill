"use client";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, NormalBlending, Plane, Points,
  Quaternion, Raycaster, ShaderMaterial, Vector3,
} from "three";
import { live } from "@/lib/live";
import { damp, rand } from "@/lib/math";
import { useStory } from "@/lib/store";
import { story } from "@/story/story.config";
import type { ParticleKey } from "@/story/types";
import { buildShape } from "./shapes";

// The particle language: one persistent cloud of particles that tells the story
// by flowing from shape to shape (clock → hourglass → plane → book → …).
// Morphs are staggered per particle with a turbulent "swirl" mid-flight, so a
// shape never cuts to the next one — it pours into it. The mouse (or finger)
// parts the particles like a hand through sand.

const vert = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uTurb;
  uniform float uFlow;
  uniform vec3 uMouse;
  uniform float uMouseR;
  uniform float uSize;
  uniform float uPR;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  attribute vec3 aB;
  attribute vec4 aRand;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = clamp(uMix * 1.5 - aRand.x * 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(position, aB, t);
    // mid-flight swirl: particles pour into the next shape instead of sliding
    float bump = sin(3.14159 * t);
    p += vec3(
      sin(p.y * 2.1 + uTime * 1.3 + aRand.y * 6.28),
      cos(p.x * 1.7 + uTime * 1.1 + aRand.z * 6.28),
      sin((p.x + p.y) * 1.3 + uTime + aRand.w * 6.28)
    ) * bump * uTurb * (0.4 + aRand.x);
    // idle life: every particle breathes a little
    p += vec3(sin(uTime * 0.7 + aRand.y * 6.28), cos(uTime * 0.6 + aRand.z * 6.28), sin(uTime * 0.5 + aRand.w * 6.28)) * uFlow * 0.035 * (0.5 + aRand.x);
    // the pointer parts the particles
    vec2 d = p.xy - uMouse.xy;
    float dist = length(d);
    float f = smoothstep(uMouseR, 0.0, dist);
    p.xy += normalize(d + 1e-4) * f * uMouseR * 0.5;
    p.z += f * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand.w * 0.9) * uPR * (9.5 / max(0.5, -mv.z));
    vColor = mix(uColorA, uColorB, aRand.y) * (1.0 + f * 0.25);
    float tw = 0.75 + 0.25 * sin(uTime * (1.5 + aRand.z * 3.0) + aRand.x * 30.0);
    vAlpha = uOpacity * (0.6 + 0.4 * aRand.z) * tw;
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const cssFont = (v: string, fb: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fb;
const DUST: ParticleKey = { at: 0, shape: "dust", colors: ["#cfe9df", "#ffffff"], size: 1, flow: 1, opacity: 0.6 };

/** Pick the key whose `at` was passed most recently. */
function stepKey(keys: ParticleKey[] | undefined, p: number): ParticleKey | null {
  if (!keys?.length) return null;
  let k = keys[0];
  for (const key of keys) if (p >= key.at) k = key;
  return k;
}

export function ParticleStory() {
  const camera = useThree((s) => s.camera);
  const pts = useRef<Points>(null);
  const group = useRef<Group>(null);
  const N = useMemo(() => (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 14000 : 26000), []);
  const fonts = useMemo(() => ({ serif: cssFont("--font-serif", "Georgia, serif"), sans: cssFont("--font-sans", "sans-serif") }), []);

  const { geometry, material } = useMemo(() => {
    const g = new BufferGeometry();
    const start = buildShape("dust", N, fonts);
    g.setAttribute("position", new BufferAttribute(new Float32Array(start), 3));
    g.setAttribute("aB", new BufferAttribute(new Float32Array(start), 3));
    const r = new Float32Array(N * 4);
    for (let i = 0; i < N * 4; i++) r[i] = rand(i * 0.731 + 5);
    g.setAttribute("aRand", new BufferAttribute(r, 4));
    const m = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uMix: { value: 1 }, uTime: { value: 0 }, uTurb: { value: 0 }, uFlow: { value: 1 },
        uMouse: { value: new Vector3(99, 99, 0) }, uMouseR: { value: 0.7 }, uSize: { value: 1 },
        uPR: { value: 1 }, uOpacity: { value: 0 },
        uColorA: { value: new Color("#cfe9df") }, uColorB: { value: new Color("#ffffff") },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
    });
    return { geometry: g, material: m };
  }, [N, fonts]);

  const state = useRef({ shape: "dust", scale: 1, spin: 0, tA: new Color(), tB: new Color() });
  const ray = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new Vector3(), []);
  const wq = useMemo(() => new Quaternion(), []);
  const wp = useMemo(() => new Vector3(), []);
  const reduced = useStory((s) => s.reducedMotion);

  /** Freeze the in-flight positions, then morph toward a new shape. */
  function morphTo(spec: string) {
    const pos = geometry.getAttribute("position") as BufferAttribute;
    const b = geometry.getAttribute("aB") as BufferAttribute;
    const r = geometry.getAttribute("aRand") as BufferAttribute;
    const mix = material.uniforms.uMix.value as number;
    for (let i = 0; i < N; i++) {
      let t = Math.min(1, Math.max(0, mix * 1.5 - r.getX(i) * 0.5));
      t = t * t * (3 - 2 * t);
      pos.setXYZ(i, pos.getX(i) + (b.getX(i) - pos.getX(i)) * t, pos.getY(i) + (b.getY(i) - pos.getY(i)) * t, pos.getZ(i) + (b.getZ(i) - pos.getZ(i)) * t);
    }
    b.copyArray(buildShape(spec, N, fonts));
    pos.needsUpdate = true;
    b.needsUpdate = true;
    gsap.killTweensOf(material.uniforms.uMix);
    gsap.killTweensOf(material.uniforms.uTurb);
    material.uniforms.uMix.value = 0;
    const d = reduced ? 0.5 : 1.8;
    gsap.to(material.uniforms.uMix, { value: 1, duration: d, ease: "power2.inOut" });
    gsap.fromTo(material.uniforms.uTurb, { value: 0 }, { value: reduced ? 0 : 0.55, duration: d / 2, yoyo: true, repeat: 1, ease: "sine.inOut" });
  }

  useFrame((s, dt) => {
    const ui = useStory.getState();
    const ch = story.chapters[live.active];
    const p = live.progress[ch.id] ?? 0;
    const introOn = story.intro?.type === "notifications" && !ui.introDone;
    const key = introOn ? DUST : stepKey(ch.particles, p);
    const u = material.uniforms;
    const S = state.current;
    const L = 3;

    const shape = key?.shape ?? S.shape;
    if (shape !== S.shape) {
      S.shape = shape;
      morphTo(shape);
    }
    const targetOpacity = !key ? 0 : introOn ? 0.12 + live.fx.introClear * 0.75 : key.opacity ?? 1;
    u.uOpacity.value = damp(u.uOpacity.value, targetOpacity, L, dt);
    u.uSize.value = damp(u.uSize.value, (key?.size ?? 1) * (1 + live.fx.pulse * 0.4), L, dt);
    u.uFlow.value = damp(u.uFlow.value, key?.flow ?? 1, L, dt);
    u.uTime.value += dt;
    u.uPR.value = Math.min(2, s.gl.getPixelRatio());
    if (key?.colors) {
      S.tA.set(key.colors[0]);
      S.tB.set(key.colors[1]);
      (u.uColorA.value as Color).lerp(S.tA, 1 - Math.exp(-L * dt));
      (u.uColorB.value as Color).lerp(S.tB, 1 - Math.exp(-L * dt));
    }
    const additive = key?.additive ?? true;
    const blend = additive ? AdditiveBlending : NormalBlending;
    if (material.blending !== blend) material.blending = blend;

    const g = group.current;
    if (g) {
      const kp = key?.pos ?? [0, 0, 0];
      g.position.set(damp(g.position.x, kp[0], L, dt), damp(g.position.y, kp[1], L, dt), damp(g.position.z, kp[2], L, dt));
      // gate "charge": particles are squeezed into the core, then blown outward
      const implode = Math.min(1, live.fx.charge * 2);
      const explode = Math.max(0, live.fx.charge * 2 - 1);
      const chargeMul = (1 - implode * 0.6) * (1 + explode * explode * 7);
      S.scale = damp(S.scale, (key?.scale ?? 1) * chargeMul, live.fx.charge > 0 ? 10 : L, dt);
      g.scale.setScalar(S.scale);
      S.spin = damp(S.spin, key?.spin ?? 0, L, dt);
      g.rotation.y += S.spin * dt;
      if (!key?.spin) g.rotation.y = damp(g.rotation.y, 0, 1.5, dt);
      // pointer → the particles' local plane
      ray.setFromCamera(s.pointer, camera);
      plane.normal.set(0, 0, 1).applyQuaternion(g.getWorldQuaternion(wq));
      plane.constant = -plane.normal.dot(g.getWorldPosition(wp));
      if (ray.ray.intersectPlane(plane, hit)) (u.uMouse.value as Vector3).copy(g.worldToLocal(hit));
      u.uMouseR.value = reduced ? 0 : 0.45 / Math.max(0.3, S.scale);
    }
  });

  return (
    <group ref={group}>
      <points ref={pts} geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />
    </group>
  );
}
