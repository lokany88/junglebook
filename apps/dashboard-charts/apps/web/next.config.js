// apps/dashboard-charts/apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: __dirname, // Fix multi-lockfile warning
  },
};

module.exports = nextConfig;

