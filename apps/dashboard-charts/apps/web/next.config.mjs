import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/app/components'),
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: false // keep strict; remove if you want bypass
  }
};

export default nextConfig;

