#!/usr/bin/env bash
set -e
npm install --legacy-peer-deps
npm install -D turbo@2.5.8 tailwindcss autoprefixer @tailwindcss/postcss postcss
if [ ! -f postcss.config.js ]; then
cat > postcss.config.js <<'EOP'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOP
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
npm run build || npx turbo run build --cache-dir=.turbo
git add .
git commit -m "Fix: Installed @tailwindcss/postcss, added postcss.config.js, turbo pinned"
git push
