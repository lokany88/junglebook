#!/usr/bin/env bash
set -e

echo "=== FORCING POSTCSS TO CJS FOR NEXT.JS ESM BUILDS ==="

# Go to repo root
cd "$(git rev-parse --show-toplevel)"

# Find all postcss.config.js and delete them
find . -type f -name "postcss.config.js" -exec rm -f {} \;
echo "🧹 Removed all postcss.config.js files."

# Locate web workspace
WEB_PATH=$(find . -type f -name "package.json" -exec grep -l '"name": "web"' {} \; | xargs dirname | head -n 1)

if [ -z "$WEB_PATH" ]; then
  echo "❌ Could not locate web workspace."
  exit 1
fi

# Create fresh, proper CommonJS config
cat > "$WEB_PATH/postcss.config.cjs" <<'EOC'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOC

# Verify content
echo "✅ Created $WEB_PATH/postcss.config.cjs"
cat "$WEB_PATH/postcss.config.cjs"

# Add a guard file so CI Heal doesn’t recreate .js
echo "CI_POSTCSS_MODE=CJS" > "$WEB_PATH/.ci-postcss-guard"

# Commit and push
git add -A
git commit -m "Force PostCSS to CommonJS (.cjs) only — prevent CI recreation"
git push origin ci-upgrade --force

echo "✅ All PostCSS configs converted to .cjs and pushed."
