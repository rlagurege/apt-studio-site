import type { NextConfig } from "next";

// Configuration for Internet Computer static export
// Use this config when building for ICP deployment
const nextConfigICP: NextConfig = {
  output: 'export', // Static export required for ICP
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
  // Images must be unoptimized for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'addictivepaintattoo.studio',
      },
    ],
  },
  
  // Skip API routes during build (they won't work in static export anyway)
  // Skip middleware (server-side only)
  
  typescript: {
    ignoreBuildErrors: true, // Allow build to continue
  },
  
  // Environment variables that are safe for static export
  env: {
    // Only include client-side env vars
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  
  // Trailing slash helps with ICP routing
  trailingSlash: true,
};

export default nextConfigICP;
