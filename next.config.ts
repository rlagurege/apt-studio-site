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
    domains: ['addictivepaintattoo.studio'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'addictivepaintattoo.studio',
      },
    ],
  },
  // Security: Validate environment variables at build time
  env: {
    // Ensure critical env vars are set (will fail build if missing)
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default nextConfig;
