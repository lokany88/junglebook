#!/usr/bin/env bash
set -e

echo "=== 🧠 JungleBook CI: Force-Ensure Next.js Exists in Web Workspace ==="

# Find workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace"
  exit 1
fi
echo "→ Web workspace detected at: $WEB_PATH"

# Explicitly install Next.js as a *normal* dependency (not just dev)
cd "$WEB_PATH"
npm install next react react-dom --save --legacy-peer-deps
cd - >/dev/null

# Ensure Turbo is local at root
npm install turbo --save-dev --legacy-peer-deps

# Double-check Next.js binary presence
if [ ! -f "$WEB_PATH/node_modules/.bin/next" ]; then
  echo "❌ Next binary still missing — forcing re-install"
  cd "$WEB_PATH"
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  cd - >/dev/null
fi

# Commit and push changes
git add package.json package-lock.json "$WEB_PATH/package.json"
git commit -m "Fix: ensure Next.js is installed as runtime dependency for CI build" || echo "(no changes)"
git push origin ci-upgrade --force

echo "✅ Next.js CI dependency fix applied and pushed."
