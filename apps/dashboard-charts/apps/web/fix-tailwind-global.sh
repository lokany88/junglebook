#!/usr/bin/env bash
set -e

echo "=== GLOBAL FIX: Ensuring Tailwind + PostCSS are visible to all workspaces ==="

# Go to repo root
cd "$(git rev-parse --show-toplevel)"

# 1. Install globally at root
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# 2. Verify postcss.config.js at workspace level
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
if [ -z "$WEB_PATH" ]; then
  echo "❌ Cannot find web workspace"
  exit 1
fi

cat > "$WEB_PATH/postcss.config.js" <<'EOC'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
EOC

# 3. Ensure Tailwind config exists
cat > "$WEB_PATH/tailwind.config.js" <<'EOT'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
EOT

# 4. Commit and push fix
git add package.json package-lock.json "$WEB_PATH/postcss.config.js" "$WEB_PATH/tailwind.config.js"
git commit -m "Fix: globalize @tailwindcss/postcss to root for CI resolution"
git push origin ci-upgrade --force

echo "✅ Global Tailwind CI fix applied, committed, and pushed."
