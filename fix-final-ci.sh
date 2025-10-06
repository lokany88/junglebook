#!/usr/bin/env bash
set -e

echo "=== FINAL CI REPAIR: Ensuring Next.js + Tailwind chain ==="

# Move to repo root
cd "$(git rev-parse --show-toplevel)"

# Ensure clean environment
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall everything safely
npm install --legacy-peer-deps

# Navigate to web workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)
cd "$WEB_PATH"

# Ensure required deps exist
npm install -D next@latest tailwindcss postcss autoprefixer @tailwindcss/postcss

# Rebuild PostCSS config if missing
if [ ! -f postcss.config.cjs ]; then
  cat > postcss.config.cjs <<'EOC'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOC
fi

# Ensure tailwind.config.js exists
if [ ! -f tailwind.config.js ]; then
  cat > tailwind.config.js <<'EOT'
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
fi

cd -

# Stage and push
git add "$WEB_PATH/postcss.config.cjs" "$WEB_PATH/tailwind.config.js" package-lock.json
git commit -m "Final CI repair: ensure Next.js + Tailwind + PostCSS stable chain"
git push origin ci-upgrade --force

echo "✅ Final CI repair pushed successfully."
