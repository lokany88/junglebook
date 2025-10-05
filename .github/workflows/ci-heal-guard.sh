#!/usr/bin/env bash
set -e

echo "🩺 Running JungleBook CI Auto-Heal Guard v2..."

# ---------- 1. Verify and auto-heal PostCSS + Tailwind ----------
REQUIRED_PACKAGES=(
  postcss
  tailwindcss
  autoprefixer
  "@tailwindcss/postcss"
)

for pkg in "${REQUIRED_PACKAGES[@]}"; do
  if ! npm list "$pkg" >/dev/null 2>&1; then
    echo "Installing missing package: $pkg"
    npm install "$pkg"@latest --save-dev --legacy-peer-deps
  fi
done

# ---------- 2. Ensure compatible PostCSS config ----------
if [ ! -f postcss.config.js ]; then
  echo "Creating default postcss.config.js..."
  cat > postcss.config.js <<'CONFIG'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
CONFIG
else
  if ! grep -q "@tailwindcss/postcss" postcss.config.js; then
    echo "Patching existing postcss.config.js for @tailwindcss/postcss..."
    sed -i.bak 's/postcss://g' postcss.config.js 2>/dev/null || true
    echo "module.exports = { plugins: { '@tailwindcss/postcss': {}, autoprefixer: {}, }, }" > postcss.config.js
  fi
fi

# ---------- 3. Ensure jsconfig alias for @components ----------
if [ ! -f jsconfig.json ] || ! grep -q '"@components/*"' jsconfig.json; then
  echo "Creating jsconfig.json with @components alias..."
  cat > jsconfig.json <<'CONFIG'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["apps/dashboard-charts/apps/web/src/app/manager/(shell)/layoutParts/*"]
    }
  }
}
CONFIG
fi

# ---------- 4. Workspace dependency reconciliation ----------
echo "Healing workspace dependencies..."
npm install --workspaces --legacy-peer-deps || true

# ---------- 5. Sidebar/Topbar fallback relink ----------
find apps -type d -path "*/src/app" | while read -r app; do
  mkdir -p "$app/components"
  [ -f "$app/components/Sidebar.tsx" ] || ln -sf "$app/manager/(shell)/layoutParts/Sidebar.tsx" "$app/components/Sidebar.tsx" 2>/dev/null || true
  [ -f "$app/components/Topbar.tsx" ] || ln -sf "$app/manager/(shell)/layoutParts/Topbar.tsx" "$app/components/Topbar.tsx" 2>/dev/null || true
done

# ---------- 6. Auto-detect Tailwind/Next version drift ----------
NEXT_VERSION=$(npx --yes next --version 2>/dev/null || echo "0")
TAILWIND_VERSION=$(npx --yes tailwindcss --version 2>/dev/null || echo "0")
echo "Detected Next.js: $NEXT_VERSION | Tailwind: $TAILWIND_VERSION"

# If mismatch likely (>2 major versions apart), realign
if [[ "$NEXT_VERSION" != "0" && "$TAILWIND_VERSION" != "0" ]]; then
  NEXT_MAJOR=$(echo "$NEXT_VERSION" | cut -d'.' -f1)
  TAILWIND_MAJOR=$(echo "$TAILWIND_VERSION" | cut -d'.' -f1)
  DIFF=$(( NEXT_MAJOR - TAILWIND_MAJOR ))
  if (( DIFF > 1 || DIFF < -1 )); then
    echo "Version drift detected: Next $NEXT_VERSION vs Tailwind $TAILWIND_VERSION. Realigning..."
    npm install tailwindcss@latest postcss@latest autoprefixer@latest "@tailwindcss/postcss@latest" --save-dev --legacy-peer-deps
  fi
fi

echo "✅ CI Heal Guard v2 completed successfully."
