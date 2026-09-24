#!/usr/bin/env bash
# Run a model script headless in Blender (4.2+ / 5.x).
#   scripts/blender/run.sh <script.py> <out_dir> [args...]
# Uses `blender` from PATH, else the Flatpak (org.blender.Blender), else $BLENDER.
set -euo pipefail
SCRIPT="$(realpath "${1:?script.py}")"; OUT="$(realpath -m "${2:?out_dir}")"; shift 2
mkdir -p "$OUT"
if [ -n "${BLENDER:-}" ]; then B=("$BLENDER")
elif command -v blender >/dev/null; then B=(blender)
elif command -v flatpak >/dev/null && flatpak info org.blender.Blender >/dev/null 2>&1; then
  B=(flatpak run --filesystem=/tmp --filesystem=home org.blender.Blender)
else echo "Blender not found (install it or set BLENDER=/path/to/blender)" >&2; exit 1; fi
"${B[@]}" -b --factory-startup --python "$SCRIPT" -- "$OUT" "$@"
