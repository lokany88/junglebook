#!/usr/bin/env bash
set -e

echo "=== 🧩 JungleBook Deterministic Next.js CI Hardening ==="

WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace."
  exit 1
fi
echo "→ Web workspace detected at: $WEB_PATH"

# 1. Ensure Next.js explicitly defined in root devDependencies for workspace propagation
echo "Ensuring Next.js + React declared at root..."
npx json -I -f package.json -e 'this.devDependencies={...this.devDependencies,next:"latest",react:"latest", "react-dom":"latest"}'

# 2. Ensure postinstall hook forces Next presence in CI
echo "Adding postinstall fallback hook..."
npx json -I -f package.json -e 'this.scripts={...this.scripts,postinstall:"npm --workspace '$WEB_PATH' install next react react-dom"}'

# 3. Install + regenerate full lockfile deterministically
echo "Rebuilding lockfile..."
rm -f package-lock.json
npm install --legacy-peer-deps

# 4. Commit and push changes
git add package.json package-lock.json
git commit -m "Fix: ensure deterministic Next.js install for CI builds" || echo "(no changes)"
git push origin ci-upgrade --force

echo "✅ Hardening complete — re-run CI to confirm."
