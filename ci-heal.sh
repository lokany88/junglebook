#!/usr/bin/env bash
set -euo pipefail

WEB_APP_DIR="apps/dashboard-charts/apps/web"

git rev-parse --is-inside-work-tree >/dev/null

node - <<'NODE'
const fs=require('fs');const path=require('path');
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile()&&e.name==='package.json'){let j=JSON.parse(fs.readFileSync(p,'utf8'));for(const sec of ['dependencies','devDependencies','optionalDependencies']){if(j[sec]){for(const k of Object.keys(j[sec])){if(/^@next\/swc-/.test(k)){delete j[sec][k];}}}}fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');}}}
walk(process.cwd());
const web=process.env.WEB_APP_DIR||'apps/dashboard-charts/apps/web';
const tsPath=path.join(web,'tsconfig.json');
let ts={compilerOptions:{}};if(fs.existsSync(tsPath)){ts=JSON.parse(fs.readFileSync(tsPath,'utf8'));}
ts.compilerOptions=ts.compilerOptions||{};
ts.compilerOptions.baseUrl=ts.compilerOptions.baseUrl||'.';
ts.compilerOptions.paths=ts.compilerOptions.paths||{};
ts.compilerOptions.paths['@components/*']=['./src/app/components/*'];
fs.writeFileSync(tsPath,JSON.stringify(ts,null,2)+'\n');
const webDir=web;
const comps=path.join(webDir,'src','app','components');
fs.mkdirSync(comps,{recursive:true});
function ensureCopy(srcName){const src=path.join(webDir,'src','app','manager','(shell)','layoutParts',srcName);const dst=path.join(comps,srcName);if(fs.existsSync(src)&&!fs.existsSync(dst)){fs.copyFileSync(src,dst);}}
ensureCopy('Sidebar.tsx');ensureCopy('Topbar.tsx');
const js=path.join(webDir,'next.config.js');const mjs=path.join(webDir,'next.config.mjs');
if(fs.existsSync(js)&&!fs.existsSync(mjs)){fs.renameSync(js,mjs);}
if(!fs.existsSync(mjs)){fs.writeFileSync(mjs,"export default { reactStrictMode: true };\n");}
NODE

rm -rf node_modules package-lock.json "$WEB_APP_DIR/node_modules" "$WEB_APP_DIR/package-lock.json"

npm install --workspaces --legacy-peer-deps

npm install -D turbo@latest --legacy-peer-deps

npm install -w "$WEB_APP_DIR" -D @tailwindcss/postcss@latest tailwindcss@latest postcss@latest autoprefixer@latest --legacy-peer-deps

git add -A
git commit -m "ci: remove explicit @next/swc platform deps; ensure Next ESM config; add @components alias and Tailwind PostCSS plugin"
git push --no-verify
