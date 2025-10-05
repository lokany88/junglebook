#!/bin/bash
# fix-imports.sh — normalize Sidebar/Topbar imports in layout.tsx files

ROOT="/Users/elokaanyaorah/junglebook/apps/dashboard-charts/apps/web/src/app"

echo "🔍 Scanning layout.tsx files under $ROOT"

find "$ROOT" -type f -name "layout.tsx" | while read -r file; do
  echo "Processing: $file"

  case "$file" in
    # Root-level: src/app/layout.tsx
    */src/app/layout.tsx)
      sed -i '' -e "s#../components/Sidebar#./components/Sidebar#g" "$file"
      sed -i '' -e "s#../components/Topbar#./components/Topbar#g" "$file"
      sed -i '' -e "s#../../components/Sidebar#./components/Sidebar#g" "$file"
      sed -i '' -e "s#../../components/Topbar#./components/Topbar#g" "$file"
      ;;

    # Nested one folder down: src/app/*/layout.tsx (dashboard, manager, etc.)
    */src/app/*/layout.tsx)
      sed -i '' -e "s#../components/Sidebar#../../components/Sidebar#g" "$file"
      sed -i '' -e "s#../components/Topbar#../../components/Topbar#g" "$file"
      sed -i '' -e "s#../../../components/Sidebar#../../components/Sidebar#g" "$file"
      sed -i '' -e "s#../../../components/Topbar#../../components/Topbar#g" "$file"
      sed -i '' -e "s#../../../../components/Sidebar#../../components/Sidebar#g" "$file"
      sed -i '' -e "s#../../../../components/Topbar#../../components/Topbar#g" "$file"
      ;;
  esac
done

echo "✅ Imports normalized!"

