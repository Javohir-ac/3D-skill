"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, DoubleSide, ShaderMaterial, type Texture } from "three";

// Dissolve-by-fire material: fbm noise threshold eats the plane, leaving a
// glowing ember rim (bloom picks it up). Drive `burn` 0 → 1 from scroll.
const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform vec3 uColor;
  uniform vec3 uEmber;
  uniform float uBurn;
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    // burn starts from the edges: bias noise by distance to centre
    float n = fbm(vUv * 5.0 + uTime * 0.05) * 0.75 + length(vUv - 0.5) * 0.55;
    float edge = uBurn * 1.35;
    if (n < edge - 0.02) discard;
    vec4 base = uHasMap > 0.5 ? texture2D(uMap, vUv) : vec4(uColor, 1.0);
    float rim = 1.0 - smoothstep(edge - 0.02, edge + 0.07, n);
    float char = 1.0 - smoothstep(edge + 0.02, edge + 0.18, n);
    vec3 col = mix(base.rgb, base.rgb * 0.15, char * step(0.001, uBurn));
    col += uEmber * rim * 4.0 * step(0.001, uBurn);
    gl_FragColor = vec4(col, base.a);
  }
`;

export function BurnPlane({
  burn, map, color = "#efe6d2", ember = "#ffae42", size = [2, 2.6],
}: { burn: () => number; map?: Texture; color?: string; ember?: string; size?: [number, number] }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: frag,
        uniforms: {
          uMap: { value: map ?? null }, uHasMap: { value: map ? 1 : 0 }, uColor: { value: new Color(color) },
          uEmber: { value: new Color(ember) }, uBurn: { value: 0 }, uTime: { value: 0 },
        },
        side: DoubleSide,
        transparent: true,
        toneMapped: false,
      }),
    [map, color, ember],
  );
  useFrame((_, dt) => {
    material.uniforms.uBurn.value = burn();
    material.uniforms.uTime.value += dt;
  });
  return (
    <mesh material={material}>
      <planeGeometry args={[size[0], size[1], 1, 1]} />
    </mesh>
  );
}
