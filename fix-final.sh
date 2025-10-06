#!/usr/bin/env bash
set -e
npm cache clean --force
rm -rf node_modules package-lock.json .turbo
npm install --legacy-peer-deps
npm install -D turbo@2.5.8 next@latest eslint@latest tailwindcss@latest autoprefixer@latest postcss@latest @tailwindcss/postcss@latest
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
npm rebuild
npx turbo prune --scope=web --docker || true
npx turbo run build --cache-dir=.turbo || npx next build || npm run build
git add .
git commit -m "Final Heal: rebuilt node_modules, upgraded Next.js, ESLint, Tailwind, fixed postcss and turbo"
git push
