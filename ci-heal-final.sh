set -euo pipefail

WEB_APP_DIR="apps/dashboard-charts/apps/web"

cd ~/junglebook

rm -rf node_modules package-lock.json "$WEB_APP_DIR/node_modules" "$WEB_APP_DIR/package-lock.json"

npm install --workspaces --legacy-peer-deps

npm install -D turbo@latest --legacy-peer-deps

npm install -w "$WEB_APP_DIR" -D tailwindcss@latest postcss@latest autoprefixer@latest postcss-import@latest --legacy-peer-deps

npm install -w "$WEB_APP_DIR" -D @tailwindcss/forms @tailwindcss/typography --legacy-peer-deps

mkdir -p "$WEB_APP_DIR/src/app/components"
if [ -f "$WEB_APP_DIR/src/app/manager/(shell)/layoutParts/Sidebar.tsx" ]; then
  cp "$WEB_APP_DIR/src/app/manager/(shell)/layoutParts/Sidebar.tsx" "$WEB_APP_DIR/src/app/components/Sidebar.tsx"
fi
if [ -f "$WEB_APP_DIR/src/app/manager/(shell)/layoutParts/Topbar.tsx" ]; then
  cp "$WEB_APP_DIR/src/app/manager/(shell)/layoutParts/Topbar.tsx" "$WEB_APP_DIR/src/app/components/Topbar.tsx"
fi

node - <<'NODE'
const fs=require('fs'),path=require('path');
const tsPath='apps/dashboard-charts/apps/web/tsconfig.json';
let ts=fs.existsSync(tsPath)?JSON.parse(fs.readFileSync(tsPath,'utf8')):{compilerOptions:{}};
ts.compilerOptions.baseUrl='.';
ts.compilerOptions.paths=ts.compilerOptions.paths||{};
ts.compilerOptions.paths['@components/*']=['./src/app/components/*'];
fs.writeFileSync(tsPath,JSON.stringify(ts,null,2));
NODE

NEXT_CONF="$WEB_APP_DIR/next.config.mjs"
if [ ! -f "$NEXT_CONF" ]; then
  echo "export default { reactStrictMode: true };" > "$NEXT_CONF"
fi

git add -A
git commit -m "ci: fix missing Tailwind PostCSS deps, @components alias, and ESM Next config" || true
git push --no-verify

npx turbo run build --cache-dir=.turbo
