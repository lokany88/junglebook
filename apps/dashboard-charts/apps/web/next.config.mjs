// =======================================================
// Next.js Configuration for JungleBook Web App
// =======================================================

// ESM-compatible dirname + path setup
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// -------------------------------------------------------
// Base Next.js Configuration
// -------------------------------------------------------
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enable experimental optimizations if needed
  experimental: {
    typedRoutes: true,
    esmExternals: "loose",
  },

  // Webpack Customization
  webpack: (config, { isServer }) => {
    // Ensure proper path resolution
    config.resolve.alias['@'] = path.join(__dirname, 'src');

    // Example: handle .svg imports as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Fix potential workspace path issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
};

// -------------------------------------------------------
// Export Config
// -------------------------------------------------------
export default nextConfig;

