/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,            // replaces experimental.typedRoutes
  reactStrictMode: true,
  compiler: { removeConsole: false },
  images: { domains: [] },      // update as needed
};

export default nextConfig;
