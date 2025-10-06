#!/usr/bin/env bash
set -e

echo "=== FIXING POSTCSS CONFIG (ESM → CJS) ==="
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)

if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not find web workspace."
  exit 1
fi

if [ -f "$WEB_PATH/postcss.config.js" ]; then
  mv "$WEB_PATH/postcss.config.js" "$WEB_PATH/postcss.config.cjs"
  echo "Renamed to postcss.config.cjs"
else
  echo "No existing postcss.config.js found, skipping rename."
fi

# Recreate clean CommonJS version
cat > "$WEB_PATH/postcss.config.cjs" <<'EOC'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOC

git add "$WEB_PATH/postcss.config.cjs"
git commit -m "Fix: convert PostCSS config to CommonJS (.cjs) for Next.js ESM compatibility"
git push origin ci-upgrade --force

echo "✅ PostCSS config successfully fixed and pushed."
