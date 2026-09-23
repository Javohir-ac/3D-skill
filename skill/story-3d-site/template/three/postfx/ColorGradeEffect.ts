import { BlendFunction, Effect } from "postprocessing";
import { Color, Uniform, type WebGLRenderer, type WebGLRenderTarget } from "three";

// One pass that owns the whole "mood" of a chapter plus transition overlays:
// exposure · saturation · contrast · duotone tint · curtain (black/any colour)
// · flash (additive light) · glitch (slice displacement + strobe).
const fragment = /* glsl */ `
  uniform float uExposure;
  uniform float uSaturation;
  uniform float uContrast;
  uniform vec3 uTint;
  uniform float uTintAmount;
  uniform float uCurtain;
  uniform vec3 uCurtainColor;
  uniform float uFlash;
  uniform vec3 uFlashColor;
  uniform float uGlitch;
  uniform float uDrain;
  uniform float uTime;

  float h1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

  void mainUv(inout vec2 uv) {
    if (uGlitch > 0.001) {
      float frame = floor(uTime * 24.0);
      float band = floor(uv.y * 22.0 + h1(frame) * 7.0);
      float r = h1(band + frame * 3.1);
      uv.x += (r - 0.5) * 0.12 * uGlitch * step(0.72, r);
    }
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 c = inputColor.rgb * uExposure;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSaturation);
    c = (c - 0.5) * uContrast + 0.5;
    c = mix(c, uTint * (l * 1.35 + 0.08), uTintAmount);

    // drain: colour bleeds out to an old-photo sepia (memory / loss)
    float ld = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(c, vec3(ld * 1.05, ld * 0.93, ld * 0.78), clamp(uDrain, 0.0, 1.0));

    if (uGlitch > 0.001) {
      // strobe between normal and crushed frames (the "middle finger" flicker)
      float strobe = step(0.5, h1(floor(uTime * 18.0)));
      vec3 crushed = pow(max(c, 0.0), vec3(1.9)) * vec3(1.25, 0.55, 0.5);
      c = mix(c, crushed, strobe * uGlitch);
    }

    c = mix(c, uCurtainColor, clamp(uCurtain, 0.0, 1.0));
    c = mix(c, uFlashColor, clamp(uFlash, 0.0, 1.0));
    outputColor = vec4(clamp(c, 0.0, 1.0), inputColor.a);
  }
`;

export class ColorGradeEffect extends Effect {
  constructor() {
    super("ColorGradeEffect", fragment, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, Uniform>([
        ["uExposure", new Uniform(1)],
        ["uSaturation", new Uniform(1)],
        ["uContrast", new Uniform(1)],
        ["uTint", new Uniform(new Color("#ffffff"))],
        ["uTintAmount", new Uniform(0)],
        ["uCurtain", new Uniform(0)],
        ["uCurtainColor", new Uniform(new Color("#000000"))],
        ["uFlash", new Uniform(0)],
        ["uFlashColor", new Uniform(new Color("#ffffff"))],
        ["uGlitch", new Uniform(0)],
        ["uDrain", new Uniform(0)],
        ["uTime", new Uniform(0)],
      ]),
    });
  }

  u(name: string) {
    return this.uniforms.get(name)!;
  }

  override update(_r: WebGLRenderer, _i: WebGLRenderTarget, dt?: number) {
    this.u("uTime").value += dt ?? 0.016;
  }
}
