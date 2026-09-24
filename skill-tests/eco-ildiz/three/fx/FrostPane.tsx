"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { frostMask } from "@/lib/frostMask";
import { live } from "@/lib/live";

// A pane of frosted glass glued in front of the camera (the intro's "window").
// Crystalline frost (voronoi veins + fbm haze) hides the world behind it;
// wherever the viewer draws, the frost is wiped clear (lib/frostMask).
const frag = /* glsl */ `
  uniform sampler2D uMask;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec2 uAspect;
  uniform vec3 uTint;
  varying vec2 vUv;
  vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.07; a *= 0.5; } return v; }
  float veins(vec2 x){
    vec2 p = floor(x), f = fract(x); float f1 = 8.0, f2 = 8.0;
    for (int j=-1;j<=1;j++) for (int i=-1;i<=1;i++){ vec2 g = vec2(float(i),float(j)); vec2 r = g + h2(p+g) - f; float d = dot(r,r);
      if (d < f1){ f2 = f1; f1 = d; } else if (d < f2){ f2 = d; } }
    return 1.0 - smoothstep(0.0, 0.06, sqrt(f2) - sqrt(f1));
  }
  void main() {
    vec2 p = vUv * uAspect;
    // fine ice crystals (small, irregular) over a soft milky haze — not big cells
    float haze = fbm(p * 3.0 + uTime * 0.01);
    vec2 warp = vec2(fbm(p * 4.0), fbm(p * 4.0 + 7.3)) * 0.35;
    float crystals = veins(p * 22.0 + warp * 6.0) * 0.22 + veins(p * 41.0 + warp * 9.0) * 0.14;
    crystals *= smoothstep(0.35, 0.75, fbm(p * 5.0 + 3.0)); // patchy, like real frost
    float mask = texture2D(uMask, vUv).r;
    // edges of the frame are thicker frost (like a real window)
    float rim = smoothstep(0.25, 0.75, length((vUv - 0.5) * vec2(1.2, 1.0)));
    float a = (0.72 + haze * 0.18 + rim * 0.12 + crystals * 0.1) * (1.0 - mask * 0.93) * uOpacity;
    vec3 col = uTint * (0.86 + haze * 0.12) + crystals * 0.35;
    // a faint bright rim along the wiped edge (water on glass)
    float edge = smoothstep(0.05, 0.35, mask) * (1.0 - smoothstep(0.35, 0.8, mask));
    col += edge * 0.18;
    gl_FragColor = vec4(col, a);
  }
`;

export function FrostPane({ distance = 1.05 }: { distance?: number }) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: frag,
        uniforms: {
          uMask: { value: frostMask().texture }, uOpacity: { value: 0 }, uTime: { value: 0 },
          uAspect: { value: [1.6, 1] }, uTint: { value: new Color("#dcefe7") },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    m.visible = live.fx.frost > 0.001;
    if (!m.visible) return;
    const cam = state.camera as typeof state.camera & { fov?: number };
    const aspect = state.size.width / state.size.height;
    const h = Math.tan(((cam.fov ?? 35) * Math.PI) / 360) * distance * 1.02;
    material.uniforms.uOpacity.value = live.fx.frost;
    material.uniforms.uTime.value += dt;
    material.uniforms.uAspect.value = [aspect, 1];
    m.position.copy(cam.position);
    m.quaternion.copy(cam.quaternion);
    m.translateZ(-distance);
    m.scale.set(h * aspect, h, 1);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={998} frustumCulled={false} />;
}
