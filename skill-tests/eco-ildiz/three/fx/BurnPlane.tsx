"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, DoubleSide, ShaderMaterial, type Texture } from "three";

// Dissolve-by-fire material: fbm noise threshold eats the plane, leaving a
// glowing ember rim (bloom picks it up). Drive `burn` 0 → 1 from scroll.
// The sheet is real paper, not a flat card: it bows around a cylinder, the
// lower corner curls up in the heat (`curl`, defaults to follow `burn`), it
// flutters a little, and its back side is blank, darker paper.
const vert = /* glsl */ `
  uniform float uCurl;
  uniform float uTime;
  uniform vec2 uSize;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float R = mix(9.0, 1.1, uCurl) * uSize.x;        // bow radius: gentle → tight
    float a = p.x / R;
    p.x = R * sin(a);
    p.z = R * (1.0 - cos(a));
    // bottom-right corner lifts toward the camera
    float c = smoothstep(0.35, 1.0, (uv.x + 1.0 - uv.y) * 0.5) * uCurl;
    p.z += c * c * uSize.y * 0.55;
    p.y += c * c * uSize.y * 0.12;
    p.z += sin(uv.y * 5.0 + uv.x * 2.0 + uTime * 1.3) * 0.015 * (1.0 + uCurl * 2.0);
    // cheap lighting from the bow normal (light upper-left-front)
    vec3 n = normalize(vec3(-sin(a), 0.0, cos(a)) + vec3(0.0, c * 0.6, 0.0));
    vShade = 0.72 + 0.28 * max(0.0, dot(n, normalize(vec3(-0.4, 0.3, 1.0))));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform vec3 uColor;
  uniform vec3 uEmber;
  uniform float uBurn;
  uniform float uTime;
  varying vec2 vUv;
  varying float vShade;
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
    vec4 base = uHasMap > 0.5 && gl_FrontFacing ? texture2D(uMap, vUv) : vec4(uColor * (gl_FrontFacing ? 1.0 : 0.78), 1.0);
    base.rgb *= vShade;
    float rim = 1.0 - smoothstep(edge - 0.02, edge + 0.07, n);
    float char = 1.0 - smoothstep(edge + 0.02, edge + 0.18, n);
    vec3 col = mix(base.rgb, base.rgb * 0.15, char * step(0.001, uBurn));
    col += uEmber * rim * 4.0 * step(0.001, uBurn);
    gl_FragColor = vec4(col, base.a);
  }
`;

export function BurnPlane({
  burn, curl, map, color = "#efe6d2", ember = "#ffae42", size = [2, 2.6],
}: {
  burn: () => number;
  /** 0 flat-ish → 1 tightly curled; defaults to the burn progress. */
  curl?: () => number;
  map?: Texture;
  color?: string;
  ember?: string;
  size?: [number, number];
}) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uMap: { value: map ?? null }, uHasMap: { value: map ? 1 : 0 }, uColor: { value: new Color(color) },
          uEmber: { value: new Color(ember) }, uBurn: { value: 0 }, uTime: { value: 0 },
          uCurl: { value: 0 }, uSize: { value: [size[0], size[1]] },
        },
        side: DoubleSide,
        transparent: true,
        toneMapped: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, color, ember, size[0], size[1]],
  );
  useFrame((_, dt) => {
    const b = burn();
    material.uniforms.uBurn.value = b;
    material.uniforms.uCurl.value = curl ? curl() : Math.min(1, b * 1.4);
    material.uniforms.uTime.value += dt;
  });
  return (
    <mesh material={material}>
      <planeGeometry args={[size[0], size[1], 48, 60]} />
    </mesh>
  );
}
