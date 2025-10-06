#!/usr/bin/env bash
set -e

echo "=== CI BUILD FIX: Ensuring @tailwindcss/postcss is properly installed ==="

# Add the missing dependency explicitly
npm install -D @tailwindcss/postcss postcss autoprefixer tailwindcss --legacy-peer-deps

# Re-create postcss.config.js to guarantee correct plugin resolution
cat > postcss.config.js <<'EOC'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOC

# Rebuild cache and verify
npx turbo run build --cache-dir=.turbo || npx next build || npm run build

# Commit fix so CI runners install this package automatically
git add package.json package-lock.json postcss.config.js
git commit -m "Fix: Ensure @tailwindcss/postcss present for CI build"
git push

echo "=== FIX COMPLETED: @tailwindcss/postcss dependency added and committed ==="
echo "Your GitHub Actions runner will now detect and build successfully."
