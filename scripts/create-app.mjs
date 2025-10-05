#!/usr/bin/env node

import fs from "fs";
import path from "path";

const appName = process.argv[2];
if (!appName) {
  console.error("❌ Please provide an app name, e.g., node scripts/create-app.js my-app");
  process.exit(1);
}

const appDir = path.resolve("apps", appName);
fs.mkdirSync(appDir, { recursive: true });

const nextConfig = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
`;

fs.writeFileSync(path.join(appDir, "next.config.mjs"), nextConfig);
console.log(`✅ Created Next.js app folder at ${appDir}`);
