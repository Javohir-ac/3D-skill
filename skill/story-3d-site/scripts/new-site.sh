#!/usr/bin/env bash
# Create a new story site from the template.
#   scripts/new-site.sh <target-dir>
# Copies template/ (without node_modules/.next), installs dependencies.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:?usage: new-site.sh <target-dir>}"
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "error: $TARGET exists and is not empty" >&2; exit 1
fi
mkdir -p "$TARGET"
if command -v rsync >/dev/null; then
  rsync -a --exclude node_modules --exclude .next --exclude .claude "$SKILL_DIR/template/" "$TARGET/"
else
  (cd "$SKILL_DIR/template" && tar --exclude=node_modules --exclude=.next --exclude=.claude -cf - .) | (cd "$TARGET" && tar -xf -)
fi
cd "$TARGET"
# some networks (Fedora + broken IPv6) need IPv4-first DNS for npm
NODE_OPTIONS="${NODE_OPTIONS:---dns-result-order=ipv4first}" npm install --no-audit --no-fund
echo "✓ site created in $TARGET — run: cd $TARGET && npx next dev --port 3100"
