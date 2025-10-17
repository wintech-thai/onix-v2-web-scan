/**
 * API Route: /api/product
 * 
 * Fetches product data from external API
 * Called client-side when user clicks "View Product" button
 * This improves initial page load performance by lazy-loading product data
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ProductApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get product URL from query parameter
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`[API /api/product] Fetching product data from: ${url}`);

    // Fetch product data from external API
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[API /api/product] Failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Product API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const productData: ProductApiResponse = await response.json();
    console.log(`[API /api/product] Successfully fetched product data`);

    return NextResponse.json(productData);
  } catch (error) {
    console.error('[API /api/product] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product data' },
      { status: 500 }
    );
  }
}
