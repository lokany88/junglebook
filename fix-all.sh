#!/usr/bin/env bash
set -e

echo "🔧 Applying JungleBook one-shot CI fix..."

# Ensure latest npm and install local turbo
npm install -g npm@latest
npm install -D turbo@2.5.8

# Clean caches
rm -rf node_modules .turbo .next package-lock.json
npm cache clean --force

# Reinstall workspace dependencies
npm install --workspaces --legacy-peer-deps

# Ensure Tailwind and PostCSS dependencies are present
npm install -D tailwindcss autoprefixer postcss @tailwindcss/postcss

# Generate minimal PostCSS config if missing
if [ ! -f postcss.config.js ]; then
  cat > postcss.config.js <<'CONFIG'
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
CONFIG
fi

# Ensure jsconfig.json for imports alias
if [ ! -f jsconfig.json ]; then
  cat > jsconfig.json <<'CONFIG'
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@components/*": ["src/app/components/*"]
      }
    }
  }
CONFIG
fi

# Build Tailwind base files if missing
if [ ! -f tailwind.config.js ]; then
  npx tailwindcss init -p
fi

# Run Turbo build with cache directory
npx turbo run build --cache-dir=.turbo || {
  echo "⚠️  Turbo build failed, retrying locally..."
  cd apps/web || cd apps/dashboard-charts/apps/web
  npx next build
}

echo "✅ JungleBook CI Auto-Heal Fix completed."
