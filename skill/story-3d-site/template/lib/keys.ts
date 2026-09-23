import { Color } from "three";
import { smoothstep } from "./math";

// Keyframe sampling for hero / camera tracks. Numeric fields and tuples are
// eased between neighbouring keys; hex colours are blended in linear space.
// A field missing on a key inherits the last value defined before it.

type KeyLike = { at: number };
type Rec = Record<string, unknown>;

const tmpA = new Color();
const tmpB = new Color();

function resolved<K extends KeyLike>(keys: K[]): K[] {
  const out: K[] = [];
  let acc: Rec = {};
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    acc = { ...acc, ...(k as Rec) };
    out.push({ ...acc } as K);
  }
  return out;
}

const cache = new WeakMap<object, KeyLike[]>();

export function sampleKeys<K extends KeyLike>(keys: K[], p: number): K {
  let r = cache.get(keys) as K[] | undefined;
  if (!r) {
    r = resolved(keys);
    cache.set(keys, r);
  }
  if (p <= r[0].at) return r[0];
  const last = r[r.length - 1];
  if (p >= last.at) return last;
  let i = 0;
  while (i < r.length - 1 && r[i + 1].at < p) i++;
  const a = r[i] as unknown as Rec;
  const b = r[i + 1] as unknown as Rec;
  const t = smoothstep(a.at as number, b.at as number, p);
  const out: Rec = { at: p };
  for (const key of Object.keys(b)) {
    const va = a[key] ?? b[key];
    const vb = b[key];
    if (typeof vb === "number" && typeof va === "number") out[key] = va + (vb - va) * t;
    else if (Array.isArray(vb) && Array.isArray(va)) out[key] = (vb as number[]).map((x, j) => (va[j] as number) + (x - (va[j] as number)) * t);
    else if (typeof vb === "string" && typeof va === "string" && vb.startsWith("#")) out[key] = "#" + tmpA.set(va).lerp(tmpB.set(vb), t).getHexString();
    else out[key] = vb;
  }
  return out as unknown as K;
}
