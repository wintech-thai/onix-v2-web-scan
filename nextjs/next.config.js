/** @type {import('next').NextConfig} */

import { execSync } from 'child_process';

function getGitCommitId() {
  try {
    const commitId = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf8',
      cwd: process.cwd()
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

  // Configure static file serving & API Proxy
  async rewrites() {
    return [
      {
        source: '/scan-static/:path*',
        destination: '/scan-static/:path*',
      },
      {
        source: '/api/Voucher/:path*',
        destination: 'https://api-dev.please-scan.com/api/Voucher/:path*',
      },
    ];
  },

  // Environment variables available to the client (use sparingly)
  env: {
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
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;