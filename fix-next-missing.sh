#!/usr/bin/env bash
set -e

echo "=== FIXING MISSING NEXT.JS DEPENDENCY ==="

# Locate the web workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)

if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not find web workspace."
  exit 1
fi

cd "$WEB_PATH"

# Install Next.js & React stack if missing
npm install next react react-dom autoprefixer tailwindcss postcss --save-dev --legacy-peer-deps

# Install Turborepo at the root level (so the runner finds it)
cd -
npm install turbo --save-dev --legacy-peer-deps

# Commit the changes
git add package.json package-lock.json "$WEB_PATH/package.json"
git commit -m "Fix: ensure Next.js and Turbo installed for web workspace and CI"
git push origin ci-upgrade --force

echo "✅ Next.js, React, and Turbo installed and pushed to ci-upgrade."
