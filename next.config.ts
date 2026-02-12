import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
  // Security: Enable strict mode
  reactStrictMode: true,
  // Security: Compress responses
  compress: true,
  // Image optimization - allow your domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'addictivepaintattoo.studio',
      },
    ],
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  // Exclude seed file from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Security: Validate environment variables at build time
  env: {
    // Ensure critical env vars are set (will fail build if missing)
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Ensure static assets are accessible over network
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Headers for CORS and asset loading
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
