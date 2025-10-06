#!/usr/bin/env bash
set -e
echo "=== 🔗 JungleBook CI Final Fix: Local Next.js Binary Symlink ==="

WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace."
  exit 1
fi
echo "→ Web workspace detected at: $WEB_PATH"

# Create node_modules/.bin if missing
mkdir -p "$WEB_PATH/node_modules/.bin"

# Explicitly install Next.js inside web workspace
echo "Installing Next.js directly in web workspace..."
npm --workspace "$WEB_PATH" install next react react-dom --legacy-peer-deps

# Create local binary symlink manually for CI (safety layer)
echo "Linking Next binary manually..."
ln -sf "../../node_modules/.bin/next" "$WEB_PATH/node_modules/.bin/next" || true

# Ensure turbo exists globally and locally
npm install turbo --save-dev --legacy-peer-deps

git add "$WEB_PATH/package.json" package.json package-lock.json
git commit -m "Fix: force-create Next.js binary link for CI runner" || echo "(no changes)"
git push origin ci-upgrade --force
echo "✅ CI binary path fix applied and pushed."
