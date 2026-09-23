"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Group, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { live } from "@/lib/live";
import { smoothstep } from "@/lib/math";

// Concentric segmented rings around a glowing core — the "charge" device.
// live.fx.charge: 0 idle → 0.5 fully imploded (held breath) → 1 exploded outwards.
function segmentedRing(inner: number, outer: number, segments: number, gap: number) {
  const step = (Math.PI * 2) / segments;
  const parts = Array.from({ length: segments }, (_, i) =>
    new RingGeometry(inner, outer, 24, 1, i * step + gap / 2, step - gap),
  );
  return mergeGeometries(parts);
}

const RINGS = [
  { r: 0.55, w: 0.035, seg: 6, gap: 0.5, speed: 0.6, bright: 2.2 },
  { r: 0.8, w: 0.05, seg: 9, gap: 0.35, speed: -0.35, bright: 1.6 },
  { r: 1.15, w: 0.09, seg: 5, gap: 0.6, speed: 0.22, bright: 1.1 },
  { r: 1.7, w: 0.16, seg: 7, gap: 0.45, speed: -0.12, bright: 0.6 },
];

export function SegmentedRings({ color = "#39ff9f", visible = () => 1 }: { color?: string; visible?: () => number }) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const rings = useMemo(
    () =>
      RINGS.map((R) => ({
        ...R,
        geo: segmentedRing(R.r, R.r + R.w, R.seg, R.gap),
        mat: new MeshBasicMaterial({
          color: new Color(color).multiplyScalar(R.bright),
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      })),
    [color],
  );
  const coreMat = useMemo(() => new MeshBasicMaterial({ color: new Color("#ffffff").multiplyScalar(3), toneMapped: false, transparent: true }), []);
  const refs = useRef<(Mesh | null)[]>([]);

  useFrame((state, dt) => {
    const c = live.fx.charge;
    const implode = smoothstep(0, 0.5, c);
    const explode = smoothstep(0.5, 1, c);
    const v = visible();
    rings.forEach((R, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.rotation.z += dt * R.speed * (1 + implode * 6 + explode * 10);
      const lag = i * 0.12; // outer rings react later → echo
      const s = (1 - 0.85 * smoothstep(lag, 0.5, c)) * (1 + 5 * smoothstep(0.5 + lag * 0.5, 1, c));
      m.scale.setScalar(Math.max(0.001, s));
      R.mat.opacity = v * (1 - explode * 0.7) * (0.75 + 0.25 * Math.sin(state.clock.elapsedTime * 3 + i));
    });
    if (core.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
      core.current.scale.setScalar((0.06 + implode * 0.05 + explode * 3) * pulse);
      coreMat.opacity = v;
    }
    if (group.current) group.current.rotation.x = 0.25 - implode * 0.25;
  });

  return (
    <group ref={group}>
      {rings.map((R, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} geometry={R.geo} material={R.mat} />
      ))}
      <mesh ref={core} geometry={useMemo(() => new SphereGeometry(1, 32, 16), [])} material={coreMat} />
    </group>
  );
}
