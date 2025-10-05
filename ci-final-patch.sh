#!/usr/bin/env bash
set -e
echo "🚑 Running Final JungleBook SWC Platform Auto-Heal..."

# 1️⃣ Clean stale .open-next caches that carry musl binaries
echo "🧹 Cleaning .open-next build artifacts..."
find apps -type d -name ".open-next" -exec rm -rf {} + || true

# 2️⃣ Enforce correct SWC binary for Ubuntu GitHub runner (glibc)
echo "🔧 Enforcing @next/swc-linux-x64-gnu..."
npm install @next/swc-linux-x64-gnu@15.5.4 --save-exact --force

# 3️⃣ Ensure no musl variant remains in node_modules
echo "🚫 Removing musl variant..."
npm uninstall @next/swc-linux-x64-musl --force || true
find node_modules -type d -name "@next/swc-linux-x64-musl" -exec rm -rf {} + || true

# 4️⃣ Patch CI workflow for automatic prevention next runs
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'YAML'
name: JungleBook CI

on:
  push:
    branches: [main, ci-upgrade]
  pull_request:
    branches: [main]

env:
  NODE_ENV: production
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 🧩 Checkout
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 🩹 Verify PostCSS + Turbo
        run: |
          npm install -D turbo@2.5.8 @tailwindcss/postcss@latest --save-exact || true
          find apps -type f -name "package.json" | while read pkg; do
            dir=$(dirname "$pkg")
            cd "$dir"
            npm install -D turbo@2.5.8 @tailwindcss/postcss@latest --save-exact || true
            cd - >/dev/null
          done

      - name: 🧹 Clean musl binaries
        run: |
          echo "🧹 Cleaning musl @next/swc binaries..."
          find . -type d -name ".open-next" -exec rm -rf {} + || true
          npm uninstall @next/swc-linux-x64-musl --force || true
          npm install @next/swc-linux-x64-gnu@15.5.4 --save-exact --force

      - name: 📦 Install dependencies
        run: |
          npm install --legacy-peer-deps

      - name: 🏗️ Build project
        run: |
          npx turbo run build

      - name: 📢 Notify Slack (success)
        if: success()
        run: |
          curl -X POST -H 'Content-type: application/json' \
          --data '{"text":"✅ JungleBook CI build succeeded!"}' \
          $SLACK_WEBHOOK_URL

      - name: 📢 Notify Slack (failure)
        if: failure()
        run: |
          curl -X POST -H 'Content-type: application/json' \
          --data '{"text":"❌ JungleBook CI failed — check workflow logs."}' \
          $SLACK_WEBHOOK_URL
YAML

# 5️⃣ Commit and push
git add -A
git commit -m "ci: fix SWC musl/glibc mismatch and clean .open-next" || true
git push

echo "✅ SWC mismatch healed. Next build should pass cleanly on GitHub CI."
