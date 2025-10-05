/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  outputFileTracingRoot: path.join(__dirname, '../../..'),
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@components': path.resolve(__dirname, 'src/app/components'),
    };
    return config;
  },
};
