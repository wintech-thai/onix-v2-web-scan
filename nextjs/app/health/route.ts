/**
 * Health Check Route
 * 
 * Provides a simple health check endpoint for Docker healthcheck and monitoring.
 * Returns system status, timestamp, version, and Git commit ID.
 * 
 * Endpoint: GET /health
 * Response: { status: 'OK', timestamp: ISO8601 string, version, commit }
 */

import { NextResponse } from 'next/server';
import { getVersionInfo } from '@/lib/version';
import { isRedisAvailable } from '@/lib/redis';

/**
 * GET handler for health check endpoint
 * 
 * @returns JSON response with health status and version info
 */
export async function GET() {
  const versionInfo = getVersionInfo();
  const redisStatus = isRedisAvailable() ? 'connected' : 'not configured';

  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'onix-v2-web-scan',
    version: versionInfo.version,
    commit: versionInfo.commit,
    buildTime: versionInfo.buildTime,
    environment: versionInfo.nodeEnv,
    redis: redisStatus,
    uptime: process.uptime(),
  });
}
