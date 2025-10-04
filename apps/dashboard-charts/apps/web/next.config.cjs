// ✅ next.config.cjs — CommonJS config for Next.js 15.5+
// Compatible with `"type": "module"` package.json
// and removes deprecated experimental options.

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../../.."),

  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;

