#!/usr/bin/env bash
set -e

echo "=== 🧠 JungleBook One-Shot Next.js + Turbo Fix ==="

# Find the web workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace."
  exit 1
fi
echo "→ Web workspace detected at: $WEB_PATH"

# 1. Ensure Next.js + React + Tailwind stack exists in web workspace
cd "$WEB_PATH"
echo "Installing web workspace dependencies..."
npm install next react react-dom tailwindcss postcss autoprefixer @tailwindcss/postcss --save-dev --legacy-peer-deps

# 2. Create standard build script if missing
if ! grep -q '"build"' package.json; then
  echo "Adding build script..."
  npx json -I -f package.json -e 'this.scripts={...this.scripts,build:"next build"}'
fi

cd - >/dev/null

# 3. Ensure turbo installed at root for CI runner
echo "Ensuring turbo installed at repo root..."
npm install turbo --save-dev --legacy-peer-deps

# 4. Commit & push cleanly
echo "Committing fixed package.json files..."
git add package.json package-lock.json "$WEB_PATH/package.json"
git commit -m "Fix: add Next.js, React, Turbo, Tailwind dependencies for stable CI build" || echo "(no changes to commit)"
git push origin ci-upgrade --force

echo "✅ JungleBook fix applied and pushed to ci-upgrade"
