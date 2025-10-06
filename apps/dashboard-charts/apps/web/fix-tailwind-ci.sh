#!/usr/bin/env bash
set -e

echo "=== PATCHING @tailwindcss/postcss INTO WEB WORKSPACE ==="

# Detect workspace root automatically
if [ -f "package.json" ] && grep -q '"name": "web"' package.json 2>/dev/null; then
  echo "Detected: running inside web workspace."
else
  echo "Searching for web workspace..."
  WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | head -n 1 | xargs dirname)
  if [ -z "$WEB_PATH" ]; then
    echo "❌ Could not find web workspace package.json"
    exit 1
  fi
  cd "$WEB_PATH"
  echo "Entered: $PWD"
fi

# Install missing dependencies locally
npm install -D @tailwindcss/postcss tailwindcss autoprefixer postcss

# Ensure PostCSS config
if [ ! -f postcss.config.js ]; then
cat > postcss.config.js <<'EOC'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOC
fi

# Ensure Tailwind config
if [ ! -f tailwind.config.js ]; then
cat > tailwind.config.js <<'EOT'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOT
fi

# Commit changes
cd "$(git rev-parse --show-toplevel)"
git add -A
git commit -m "Fix: Scoped @tailwindcss/postcss correctly for CI build"
git push origin ci-upgrade --force

echo "=== ✅ FIX COMMITTED & PUSHED SUCCESSFULLY ==="
