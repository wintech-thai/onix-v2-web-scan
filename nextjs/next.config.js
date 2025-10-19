/** @type {import('next').NextConfig} */

import { execSync } from 'child_process';

function getGitCommitId() {
  try {
    // Try to get Git commit hash (short version)
    // Change to parent directory since next.config.js runs in nextjs/ folder
    const commitId = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf8',
      cwd: process.cwd() // Use current working directory (should be nextjs/)
    }).trim();
    console.log(`✅ Git commit ID detected: ${commitId}`);
    return commitId;
  } catch (error) {
    console.warn('⚠️ Failed to get Git commit ID:', error.message);
    return 'unknown';
  }
}

function getBuildTimestamp() {
  return new Date().toISOString();
}

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },

  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/scan-static/:path*',
        destination: '/scan-static/:path*',
      },
    ];
  },

  // Environment variables available to the client (use sparingly)
  env: {
    // Inject Git commit ID and build time at build time
    // These will be available as process.env.NEXT_PUBLIC_* in both server and client
    NEXT_PUBLIC_GIT_COMMIT: process.env.NEXT_PUBLIC_GIT_COMMIT || getGitCommitId(),
    NEXT_PUBLIC_BUILD_TIMESTAMP: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || getBuildTimestamp(),
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // Headers for security and monitoring
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Output configuration
  output: 'standalone', // For Docker deployment

  // Experimental features (use with caution)
  experimental: {
    // Enable server actions if needed
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
