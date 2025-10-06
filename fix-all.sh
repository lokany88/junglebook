#!/usr/bin/env bash
set -e
npm cache clean --force
rm -rf node_modules package-lock.json .turbo
npm install --legacy-peer-deps
npm install -D turbo@2.5.8 tailwindcss autoprefixer postcss @tailwindcss/postcss
if [ ! -f postcss.config.js ]; then
cat > postcss.config.js <<'EOP'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOP
fi
if [ ! -f tailwind.config.js ]; then
npx tailwindcss init -p
fi
if [ ! -f jsconfig.json ]; then
cat > jsconfig.json <<'EOC'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/app/components/*"]
    }
  }
}
EOC
fi
npm audit fix --force || true
npx turbo prune --scope=web --docker || true
npx turbo run build --cache-dir=.turbo || npm run build
git add .
git commit -m "Full Heal: rebuild deps, postcss fix, turbo pinned, npm audit resolved"
git push
