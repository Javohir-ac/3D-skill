"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, IcosahedronGeometry, Mesh,
  PlaneGeometry, Points, PointsMaterial, Vector3,
} from "three";
import { sampleKeys } from "@/lib/keys";
import { live } from "@/lib/live";
import { damp } from "@/lib/math";
import { story } from "@/story/story.config";
import type { HeroKey } from "@/story/types";
import { makeDotTexture } from "../fx/textures";
import { createHaloMaterial, createHeroMaterial } from "./heroMaterial";

// The recurring protagonist object. It exists across ALL chapters and glides
// between the forms each chapter asks for (story.config → chapter.hero keys).
// Chapters without keys hide it (scale 0). Beats can make it pulse or burst.

const HIDDEN: HeroKey = { at: 0, scale: 0 };
const BURST = 160;

export function Hero() {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const points = useRef<Points>(null);
  const material = useMemo(() => createHeroMaterial(), []);
  const haloMat = useMemo(() => createHaloMaterial(), []);
  const geo = useMemo(() => new IcosahedronGeometry(1, 48), []);
  const haloGeo = useMemo(() => new PlaneGeometry(1, 1), []);

  const cur = useRef({ pos: new Vector3(0, 0, 0), scale: 0, noise: 0.2, crack: 0, glow: 0, glass: 0, spin: 0.2, color: new Color("#29d38a"), accent: new Color("#9dffd0") });

  // burst particles
  const burst = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(BURST * 3), 3));
    const vel = new Float32Array(BURST * 3);
    const m = new PointsMaterial({ size: 0.06, map: makeDotTexture(), transparent: true, depthWrite: false, blending: AdditiveBlending, color: "#ffffff", toneMapped: false });
    return { g, vel, m, age: 99, seen: 0 };
  }, []);

  const tc = useMemo(() => new Color(), []);
  const ta = useMemo(() => new Color(), []);

  useFrame((state, dt) => {
    const ch = story.chapters[live.active];
    const p = live.progress[ch.id] ?? 0;
    const k = ch.hero?.length ? sampleKeys(ch.hero, p) : HIDDEN;
    const c = cur.current;
    const L = 3.2;
    const fx = live.fx;

    if (k.pos) c.pos.set(damp(c.pos.x, k.pos[0], L, dt), damp(c.pos.y, k.pos[1], L, dt), damp(c.pos.z, k.pos[2], L, dt));
    // gate "charge": the hero is the core of the implosion / explosion
    const implode = Math.min(1, fx.charge * 2);
    const explode = Math.max(0, fx.charge * 2 - 1);
    const chargeMul = (1 - implode * 0.45) * (1 + explode * explode * 9);
    c.scale = damp(c.scale, (k.scale ?? 1) * (1 + fx.pulse * 0.12) * chargeMul, fx.charge > 0 ? 12 : L, dt);
    c.noise = damp(c.noise, k.noise ?? 0.2, L, dt);
    c.crack = damp(c.crack, k.crack ?? 0, L, dt);
    c.glow = damp(c.glow, (k.glow ?? 0) + fx.pulse * 1.5 + implode * 2 + explode * 6, L, dt);
    c.glass = damp(c.glass, k.glass ?? 0, L, dt);
    c.spin = damp(c.spin, k.spin ?? 0.2, L, dt);
    if (k.color) c.color.lerp(tc.set(k.color), 1 - Math.exp(-L * dt));
    if (k.accent) c.accent.lerp(ta.set(k.accent), 1 - Math.exp(-L * dt));

    const u = material.uniforms;
    u.uTime.value += dt;
    u.uNoise.value = c.noise;
    u.uCrack.value = c.crack;
    u.uGlow.value = c.glow;
    u.uGlass.value = c.glass;
    u.uColor.value.copy(c.color);
    u.uAccent.value.copy(c.accent);

    if (group.current) {
      group.current.position.copy(c.pos);
      group.current.visible = c.scale > 0.01;
    }
    if (mesh.current) {
      mesh.current.scale.setScalar(Math.max(0.0001, c.scale));
      mesh.current.rotation.y += dt * c.spin;
      mesh.current.rotation.x += dt * c.spin * 0.35;
    }
    if (halo.current) {
      halo.current.scale.setScalar(c.scale * 4.2);
      halo.current.quaternion.copy(state.camera.quaternion);
      haloMat.uniforms.uColor.value.copy(c.accent);
      haloMat.uniforms.uStrength.value = 0.18 + c.glow * 0.25 + c.glass * 0.2;
    }
    live.hero.pos.copy(c.pos);
    live.hero.scale = c.scale;

    // particle burst
    if (fx.burst !== burst.seen) {
      burst.seen = fx.burst;
      burst.age = 0;
      const pos = burst.g.getAttribute("position") as BufferAttribute;
      for (let i = 0; i < BURST; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 1.2 + Math.random() * 2.6;
        burst.vel.set([Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp, Math.sin(ph) * Math.sin(th) * sp], i * 3);
        pos.setXYZ(i, 0, 0, 0);
      }
      pos.needsUpdate = true;
      burst.m.color.copy(c.accent).multiplyScalar(2.5);
    }
    if (burst.age < 3 && points.current) {
      burst.age += dt;
      const pos = burst.g.getAttribute("position") as BufferAttribute;
      const drag = Math.exp(-2.2 * dt);
      for (let i = 0; i < BURST; i++) {
        burst.vel[i * 3] *= drag;
        burst.vel[i * 3 + 1] = burst.vel[i * 3 + 1] * drag - 0.4 * dt;
        burst.vel[i * 3 + 2] *= drag;
        pos.setXYZ(i, pos.getX(i) + burst.vel[i * 3] * dt, pos.getY(i) + burst.vel[i * 3 + 1] * dt, pos.getZ(i) + burst.vel[i * 3 + 2] * dt);
      }
      pos.needsUpdate = true;
      burst.m.opacity = Math.max(0, 1 - burst.age / 2.2);
    }
    if (points.current) points.current.visible = burst.age < 2.2;
  });

  return (
    <group ref={group}>
      <mesh ref={halo} geometry={haloGeo} material={haloMat} renderOrder={-1} />
      <mesh ref={mesh} geometry={geo} material={material} />
      <points ref={points} geometry={burst.g} material={burst.m} frustumCulled={false} />
    </group>
  );
}
