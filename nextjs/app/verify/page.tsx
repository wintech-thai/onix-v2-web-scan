/**
 * Verification Page - Server Component
 * 
 * Handles verification requests with encrypted QR code data.
 * Server-side decryption, validation, TTL checking, and theme rendering.
 * 
 * Query Parameters:
 * - data: Base64-encoded encrypted verification data (required)
 * - theme: Theme name for rendering (optional, default: 'default')
 * - org: Organization identifier (optional)
 */

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { decrypt } from '@/lib/encryption';
import { getObjectAsync } from '@/lib/redis';
import type { 
  VerifyViewModel, 
  VerifyPayload, 
  EncryptionConfig,
  ProductApiResponse 
} from '@/lib/types';
import VerifyView from '@/components/themes/default/VerifyView';

interface VerifyPageProps {
  searchParams: Promise<{
    data?: string;
    theme?: string;
    org?: string;
  }>;
}

// Whitelist of allowed themes
const ALLOWED_THEMES = ['default', 'custom', 'branded'];

/**
 * Fetch product data from external API
 */
async function fetchProductData(productId: string): Promise<ProductApiResponse | null> {
  const productApiUrl = process.env.PRODUCT_API_URL;
  
  if (!productApiUrl) {
    console.warn('PRODUCT_API_URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${productApiUrl}/api/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache product data
    });

    if (!response.ok) {
      console.error(`Product API returned ${response.status} for product ${productId}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
}

/**
 * Check if TTL has expired
 */
function isTTLExpired(ttl: number, createdDate: Date): boolean {
  const now = new Date();
  const expirationDate = new Date(createdDate.getTime() + ttl * 1000);
  return now > expirationDate;
}

/**
 * Get encryption configuration from Redis or environment variables
 */
async function getEncryptionConfig(org?: string): Promise<EncryptionConfig> {
  // Try to get from Redis first (org-specific config)
  if (org) {
    try {
      const redisKey = `encryption:config:${org}`;
      const config = await getObjectAsync<EncryptionConfig>(redisKey);
      
      if (config && config.key && config.iv) {
        console.log(`Using encryption config from Redis for org: ${org}`);
        return config;
      }
    } catch (error) {
      console.warn(`Failed to retrieve encryption config from Redis for org ${org}:`, error);
    }
  }

  // Fallback to environment variables
  const key = process.env.ENCRYPTION_KEY;
  const iv = process.env.ENCRYPTION_IV;

  if (!key || !iv) {
    throw new Error('Encryption configuration not found in Redis or environment variables');
  }

  console.log('Using encryption config from environment variables');
  return { key, iv };
}

/**
 * Verify Page Component (Server Component)
 */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { data, theme = 'default', org } = params;

  // Validate theme
  const selectedTheme = ALLOWED_THEMES.includes(theme) ? theme : 'default';

  // Validate required parameters
  if (!data) {
    return (
      <VerifyView
        verifyData={{
          status: 'INVALID',
          message: 'Missing required parameter: data',
          scanData: null,
          productData: null,
          theme: selectedTheme,
        }}
      />
    );
  }

  try {
    // Step 1: Get encryption configuration
    const encryptionConfig = await getEncryptionConfig(org);

    // Step 2: Decrypt the data
    let decryptedData: string;
    try {
      decryptedData = decrypt(data, encryptionConfig.key, encryptionConfig.iv);
    } catch (error) {
      console.error('Decryption failed:', error);
      return (
        <VerifyView
          verifyData={{
            status: 'INVALID',
            message: 'Failed to decrypt verification data',
            scanData: null,
            productData: null,
            theme: selectedTheme,
          }}
        />
      );
    }

    // Step 3: Parse the JSON payload
    let payload: VerifyPayload;
    try {
      payload = JSON.parse(decryptedData);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return (
        <VerifyView
          verifyData={{
            status: 'INVALID',
            message: 'Invalid data format',
            scanData: null,
            productData: null,
            theme: selectedTheme,
          }}
        />
      );
    }

    // Step 4: Validate payload structure
    if (!payload.scanItem || !payload.ttl || !payload.createdDate) {
      return (
        <VerifyView
          verifyData={{
            status: 'INVALID',
            message: 'Missing required fields in verification data',
            scanData: null,
            productData: null,
            theme: selectedTheme,
          }}
        />
      );
    }

    // Step 5: Check TTL expiration
    const createdDate = new Date(payload.createdDate);
    const expired = isTTLExpired(payload.ttl, createdDate);

    if (expired) {
      return (
        <VerifyView
          verifyData={{
            status: 'EXPIRED',
            message: 'Verification data has expired',
            scanData: payload.scanItem,
            productData: null,
            theme: selectedTheme,
            ttl: payload.ttl,
            createdDate: createdDate.toISOString(),
            expiryDate: new Date(createdDate.getTime() + payload.ttl * 1000).toISOString(),
          }}
        />
      );
    }

    // Step 6: Fetch product data if productId is present
    let productData: ProductApiResponse | null = null;
    if (payload.scanItem.productId) {
      productData = await fetchProductData(payload.scanItem.productId);
    }

    // Step 7: Return success view
    const headersList = await headers();
    return (
      <VerifyView
        verifyData={{
          status: 'VALID',
          message: 'Verification successful',
          scanData: payload.scanItem,
          productData,
          theme: selectedTheme,
          ttl: payload.ttl,
          createdDate: createdDate.toISOString(),
          expiryDate: new Date(createdDate.getTime() + payload.ttl * 1000).toISOString(),
        }}
      />
    );
  } catch (error) {
    console.error('Verification error:', error);
    
    // Return error view
    return (
      <VerifyView
        verifyData={{
          status: 'ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          scanData: null,
          productData: null,
          theme: selectedTheme,
        }}
      />
    );
  }
}
