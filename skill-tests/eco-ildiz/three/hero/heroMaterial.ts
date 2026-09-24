import { AdditiveBlending, Color, ShaderMaterial, Vector3 } from "three";

// One stylised material that can be alive (liquid noise), broken (glowing
// voronoi fissures), glass (rim-only, transparent) or pure light — every form
// the hero takes during the story, blended by uniforms. No textures needed.
// uShape morphs the silhouette: 0 = orb, 1 = coffee bean (oval, flat face, S crease), 2 = acorn.

const noise = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uNoise;
  uniform float uShape;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vObj;
  varying float vGroove;
  varying float vCap;
  ${noise}
  float field(vec3 p){ return snoise(p * 1.25 + vec3(0.0, uTime * 0.35, uTime * 0.2)) * 0.6 + snoise(p * 2.6 - uTime * 0.25) * 0.25; }
  // S-shaped centre crease of a coffee bean, on the flat (+Z) side
  float groove(vec3 p){
    float s = 0.09 * sin(p.y * 2.6);
    float g = exp(-pow((p.x - s) / 0.075, 2.0));
    return g * smoothstep(-0.05, 0.35, p.z) * smoothstep(1.0, 0.7, abs(p.y));
  }
  // unit-sphere point → displaced surface; uShape morphs orb (0) → coffee bean (1)
  vec3 surface(vec3 p){
    vec3 n = normalize(p);
    vec3 orb = p + n * field(p) * uNoise;
    vec3 b = p * vec3(0.74, 1.0, 1.0);
    b.z *= b.z > 0.0 ? 0.36 : 0.62;                 // flat face, domed back
    b.z -= groove(p) * 0.2;                           // the crease
    b += n * field(p) * uNoise * 0.12;                // keep a little life
    // acorn: glossy nut with a pointed tip + a wider, rough cap with a stem
    vec3 a = p * vec3(0.56, 0.92, 0.56);
    float below = smoothstep(0.1, -1.0, p.y);
    a.xz *= mix(1.0, 0.72, below * below);            // taper toward the tip
    a.y -= smoothstep(-0.75, -1.0, p.y) * 0.1;        // the point
    float cap = smoothstep(0.42, 0.5, p.y);
    a.xz *= 1.0 + cap * 0.16;                         // cap overhangs the nut
    a.y = mix(a.y, 0.5 + (a.y - 0.5) * 0.4, cap);  // flattened dome
    a += n * cap * snoise(p * 9.0) * 0.012;          // scaly cap texture
    float stem = smoothstep(0.93, 0.99, p.y);
    a.xz *= 1.0 - stem * 0.85;
    a.y += stem * 0.2;
    a += n * field(p) * uNoise * 0.1;
    float s1 = clamp(uShape, 0.0, 1.0), s2 = clamp(uShape - 1.0, 0.0, 1.0);
    return mix(mix(orb, b, s1), a, s2);
  }
  void main() {
    vObj = position;
    vec3 n = normalize(position);
    vec3 displaced = surface(position);
    // displaced normal from two neighbour samples along tangents
    vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 b = cross(n, t);
    float e = 0.02;
    vec3 dt = surface(normalize(position + t * e));
    vec3 db = surface(normalize(position + b * e));
    vec3 nn = normalize(cross(dt - displaced, db - displaced));
    if (dot(nn, displaced) < 0.0) nn = -nn;
    vGroove = groove(position) * clamp(uShape, 0.0, 1.0) * (1.0 - clamp(uShape - 1.0, 0.0, 1.0));
    vCap = smoothstep(0.42, 0.5, normalize(position).y) * clamp(uShape - 1.0, 0.0, 1.0);
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * nn);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uCrack;
  uniform float uGlow;
  uniform float uGlass;
  uniform float uTime;
  uniform vec3 uLightDir;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vObj;
  varying float vGroove;
  varying float vCap;

  vec3 hash3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
  // distance to the nearest voronoi cell edge (F2 - F1)
  float voronoiEdge(vec3 x){
    vec3 p = floor(x); vec3 f = fract(x); float f1 = 8.0, f2 = 8.0;
    for (int k=-1;k<=1;k++) for (int j=-1;j<=1;j++) for (int i=-1;i<=1;i++){
      vec3 g = vec3(float(i),float(j),float(k)); vec3 r = g + hash3(p+g) - f; float d = dot(r,r);
      if (d < f1){ f2 = f1; f1 = d; } else if (d < f2){ f2 = d; }
    }
    return sqrt(f2) - sqrt(f1);
  }

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(vViewDir);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    float lambert = max(dot(n, normalize(uLightDir)), 0.0);
    float spec = pow(max(dot(reflect(-normalize(uLightDir), n), v), 0.0), 40.0);

    vec3 body = uColor * (0.28 + 0.72 * lambert) + spec * 0.6;
    body *= 1.0 - vGroove * 0.55;                    // the crease sits in shadow
    body = mix(body, body * vec3(0.55, 0.5, 0.42), vCap); // acorn cap: darker, duller
    // broken: body darkens, fissures glow
    float edge = voronoiEdge(vObj * 2.4);
    float fissure = (1.0 - smoothstep(0.0, 0.07, edge)) * uCrack;
    float flicker = 0.8 + 0.2 * sin(uTime * 7.0 + vObj.y * 9.0);
    body = mix(body, body * 0.18, uCrack * 0.85);
    vec3 col = body + uAccent * fissure * 3.5 * flicker;
    col += uAccent * fres * (0.5 + uGlass * 1.8);
    col += uColor * uGlow;

    float alpha = mix(1.0, clamp(fres * 1.4 + 0.06 + fissure, 0.0, 1.0), uGlass);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createHeroMaterial() {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uNoise: { value: 0.2 },
      uShape: { value: 0 },
      uCrack: { value: 0 },
      uGlow: { value: 0 },
      uGlass: { value: 0 },
      uColor: { value: new Color("#29d38a") },
      uAccent: { value: new Color("#9dffd0") },
      uLightDir: { value: new Vector3(0.6, 0.8, 0.7) },
    },
    transparent: true,
    toneMapped: false,
  });
}

/** Soft additive halo sprite material behind the hero. */
export function createHaloMaterial() {
  return new ShaderMaterial({
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `
      uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(1.0 - d, 0.0), 2.2) * uStrength; gl_FragColor = vec4(uColor * a, a); }
    `,
    uniforms: { uColor: { value: new Color("#9dffd0") }, uStrength: { value: 0.5 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
