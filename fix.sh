#!/bin/bash
set -e

echo "🚀 Running Junglebook Fix Script..."

# Path to web app
WEB_DIR="apps/dashboard-charts/apps/web"

# 1. Fix Next.js config
NEXT_CONFIG="$WEB_DIR/next.config.ts"
if [ -f "$NEXT_CONFIG" ]; then
  echo "✅ Patching Next.js config..."
  # Replace experimental.outputFileTracingRoot with root-level outputFileTracingRoot
  sed -i.bak 's/experimental: { *outputFileTracingRoot: __dirname *},/outputFileTracingRoot: __dirname,/' "$NEXT_CONFIG"
  rm -f "$NEXT_CONFIG.bak"
else
  echo "⚠️ No next.config.ts found, skipping"
fi

# 2. Fix PostCSS config
POSTCSS_CONFIG="$WEB_DIR/postcss.config.js"
echo "✅ Writing correct PostCSS config..."
cat > "$POSTCSS_CONFIG" << 'EOF'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
EOF

# 3. Ensure deps are installed
echo "📦 Installing required PostCSS/Tailwind deps..."
npm install -D @tailwindcss/postcss autoprefixer --workspace web

echo "🎉 Fix complete! Try running 'npm run build:web' again."

