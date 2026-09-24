#!/usr/bin/env bash
# Compress a GLB for the web with meshopt (decoder ships with three.js — no CDN).
#   scripts/optimize-glb.sh in.glb out.glb [simplifyRatio]
# simplifyRatio: 0.5 for organic sculpts (hands), omit/"false" for hard-surface
# models with modelled details (buildings, windows) — simplification ruins them.
set -euo pipefail
IN="${1:?in.glb}"; OUT="${2:?out.glb}"; RATIO="${3:-false}"
ARGS=(--compress meshopt --texture-compress false --join false)
if [ "$RATIO" = "false" ]; then ARGS+=(--simplify false); else ARGS+=(--simplify-ratio "$RATIO" --simplify-error 0.0004); fi
npx --yes @gltf-transform/cli optimize "$IN" "$OUT" "${ARGS[@]}"
