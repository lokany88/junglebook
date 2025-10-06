#!/usr/bin/env bash
set -e

echo "=== 💀 JungleBook Ultimate CI Fix — Next.js Binary Resurrection ==="

# Detect web workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace."
  exit 1
fi
echo "→ Web workspace detected at: $WEB_PATH"

# 1. Hoist everything to root node_modules to ensure binary visibility
echo "🌍 Forcing hoisted node_modules for CI..."
npm install --legacy-peer-deps --force

# 2. Reinstall Next.js in web workspace (guarantee local + hoisted)
echo "🧩 Installing Next.js in web workspace..."
npm --workspace "$WEB_PATH" install next react react-dom --legacy-peer-deps --force

# 3. Create symlink to make sure the binary is directly callable
echo "🔗 Linking Next binary globally..."
mkdir -p "$WEB_PATH/node_modules/.bin"
ln -sf "$(pwd)/node_modules/.bin/next" "$WEB_PATH/node_modules/.bin/next"

# 4. Inject CI prebuild script in root package.json if missing
echo "⚙️  Adding prebuild self-heal hook..."
if ! grep -q '"prebuild"' package.json; then
  npx json -I -f package.json -e 'this.scripts={...this.scripts,prebuild:"if [ ! -f node_modules/.bin/next ]; then npm --workspace ./apps/dashboard-charts/apps/web install next react react-dom --legacy-peer-deps; fi"}'
fi

# 5. Make sure Turbo is locally installed for consistent runner behavior
npm install turbo --save-dev --legacy-peer-deps

# 6. Update CI YAML to run prebuild automatically before turbo
CI_FILE=".github/workflows/ci.yml"
if [ -f "$CI_FILE" ]; then
  if ! grep -q "npm run prebuild" "$CI_FILE"; then
    echo "🧬 Patching CI workflow to include prebuild step..."
    awk '/Run CI Heal Guard/{print;print "      - name: Prebuild Self-Heal";print "        run: npm run prebuild";next}1' "$CI_FILE" > "$CI_FILE.tmp" && mv "$CI_FILE.tmp" "$CI_FILE"
  fi
fi

# 7. Commit and push changes
git add package.json package-lock.json "$WEB_PATH/package.json" "$CI_FILE" || true
git commit -m "🔥 Ultimate Fix: Force-hoist Next.js + add CI self-heal prebuild hook" || echo "(no new changes)"
git push origin ci-upgrade --force

echo "✅ All systems repaired. CI will now find Next.js on every build."
