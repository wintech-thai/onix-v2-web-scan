/**
 * Health Check API Route
 * 
 * Provides a simple health check endpoint for monitoring and service discovery.
 * Returns system status and timestamp.
 * 
 * Endpoint: GET /api/health
 * Response: { status: 'OK', timestamp: ISO8601 string }
 */

import { NextResponse } from 'next/server';

/**
 * GET handler for health check endpoint
 * 
 * @returns JSON response with health status
 */
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'onix-v2-web-scan',
    version: '2.0.0',
  });
}
