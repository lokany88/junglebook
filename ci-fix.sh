SIDEBAR_PATH=$(find apps -type f -path "*/layoutParts/Sidebar.tsx" | head -n 1)
if [ -z "$SIDEBAR_PATH" ]; then
  echo "Sidebar.tsx not found"
  exit 1
fi
echo "Patching: $SIDEBAR_PATH"
npx tsx -e "
import fs from 'fs';
const path = '$SIDEBAR_PATH';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/href=\{[^}]+\}/g, 'href={item.href as any}');
fs.writeFileSync(path, code);
console.log('✅ Patched', path);
"
npm install --legacy-peer-deps
npx turbo run build
