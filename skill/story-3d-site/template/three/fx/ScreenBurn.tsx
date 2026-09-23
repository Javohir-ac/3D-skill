"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { live } from "@/lib/live";

// Full-screen char/burn curtain. Coverage 0 → nothing, 1 → screen fully charred.
// Scrolling INTO a "burn" boundary chars the frame from the edges with glowing
// ember rims; scrolling past it burns through to reveal the next chapter.
const frag = /* glsl */ `
  uniform float uCover;
  uniform float uTime;
  uniform vec2 uAspect;
  uniform vec3 uChar;
  uniform vec3 uEmber;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.05; a *= 0.5; } return v; }
  void main() {
    vec2 p = (vUv - 0.5) * uAspect;
    // edges burn first: distance-to-centre bias + organic fbm front
    float n = fbm(p * 3.2 + uTime * 0.04) * 0.55 + (1.0 - length(p) * 1.25) * 0.6;
    float front = uCover * 1.35 - 0.15;
    float charred = smoothstep(n + 0.015, n - 0.015, front);
    float rim = smoothstep(0.07, 0.0, abs(front - n)) * step(0.001, uCover) * step(uCover, 0.999);
    if (charred < 0.01 && rim < 0.01) discard;
    vec3 col = mix(uEmber * 3.0 * rim, uChar, charred);
    gl_FragColor = vec4(col, max(charred, rim));
  }
`;

export function ScreenBurn({ distance = 1 }: { distance?: number }) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: frag,
        uniforms: {
          uCover: { value: 0 }, uTime: { value: 0 }, uAspect: { value: [1.6, 1] },
          uChar: { value: new Color("#070302") }, uEmber: { value: new Color("#ff8a2a") },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const cover = Math.max(live.fx.burn, live.boundary.burn);
    m.visible = cover > 0.001;
    if (!m.visible) return;
    const cam = state.camera as { fov?: number } & typeof state.camera;
    const h = Math.tan(((cam.fov ?? 35) * Math.PI) / 360) * distance * 1.02;
    const aspect = state.size.width / state.size.height;
    material.uniforms.uCover.value = cover;
    material.uniforms.uTime.value += dt;
    material.uniforms.uAspect.value = [aspect, 1];
    m.position.copy(cam.position);
    m.quaternion.copy(cam.quaternion);
    m.translateZ(-distance);
    m.scale.set(h * aspect, h, 1);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={999} frustumCulled={false} />;
}
