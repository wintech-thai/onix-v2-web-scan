/**
 * Verification Page - Server Component
 * 
 * Handles verification requests with encrypted QR code data.
 * Server-side decryption, validation, TTL checking, and theme rendering.
 * Matches C# VerifyController.cs implementation exactly.
 * 
 * Query Parameters:
 * - data: Base64-encoded encrypted verification data (required, URL-encoded)
 * - theme: Theme name for rendering (optional, default: 'default')
 * - org: Organization identifier (required)
 * - lang: Language preference (optional, default: 'th')
 */

import { decrypt } from '@/lib/encryption';
import type { 
  VerifyViewModel, 
  VerifyPayload, 
  ProductApiResponse 
} from '@/lib/types';
import VerifyView from '@/components/themes/default/VerifyView';
import Link from 'next/link';

interface VerifyPageProps {
  searchParams: Promise<{
    data?: string;
    theme?: string;
    org?: string;
    lang?: 'th' | 'en';
  }>;
}

/**
 * Layout wrapper with header and footer (matching test page)
 */
function PageLayout({ 
  children, 
  lang, 
  currentUrl 
}: { 
  children: React.ReactNode; 
  lang: 'th' | 'en';
  currentUrl: string;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f7f8fb' }}>
      {/* Header - Matching C# Layout */}
      <header>
        <nav style={{ 
          background: '#183153', 
          borderBottom: '1px solid #25406b',
          boxShadow: '0 4px 14px rgba(24,49,83,0.08)',
          padding: '1rem 0'
        }}>
          <div style={{ 
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link 
              href="https://please-scan.com" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 700,
                letterSpacing: '0.2px',
                color: '#f3f7fa',
                textDecoration: 'none'
              }}
            >
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.10)'
                }}
              >
                PS
              </span>
              <span>Please Scan</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Language Toggle in Header */}
              <Link
                href={`${currentUrl}${currentUrl.includes('?') ? '&' : '?'}lang=th`}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: lang === 'th' ? '#2563eb' : 'transparent',
                  color: lang === 'th' ? '#fff' : '#d1d5db',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                🇹🇭 ไทย
              </Link>
              <Link
                href={`${currentUrl}${currentUrl.includes('?') ? '&' : '?'}lang=en`}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: lang === 'en' ? '#2563eb' : 'transparent',
                  color: lang === 'en' ? '#fff' : '#d1d5db',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                🇬🇧 EN
              </Link>
              <Link 
                href="https://please-scan.com/privacy" 
                style={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#b6c6e3',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area - Centered like C# */}
      <main role="main" className="flex-1 grid place-items-center py-8">
        {children}
      </main>

      {/* Footer - Matching C# Layout */}
      <footer style={{ 
        borderTop: '1px solid #25406b', 
        background: '#183153' 
      }}>
        <div 
          style={{ 
            maxWidth: '960px',
            margin: '0 auto',
            padding: '14px 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#b6c6e3',
            fontSize: '14px'
          }}
        >
          <div>© {new Date().getFullYear()} Please Scan</div>
          <div>
            <Link 
              href="https://please-scan.com/privacy" 
              style={{ 
                color: '#b6c6e3',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Whitelist of allowed themes (matching C# controller)
// Add new themes here as you create them in components/themes/{themeName}/
const ALLOWED_THEMES = ['default', 'modern', 'minimal'];

/**
 * Fetch product data from external API (matching C# FetchProductData)
 */
async function fetchProductData(url: string): Promise<ProductApiResponse | null> {
  try {
    console.log(`Calling Product API: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error(`Product API failed with status: ${response.status}`);
      return null;
    }

    const jsonContent = await response.text();
    console.log(`Product API Response: ${jsonContent.substring(0, 200)}`);
    
    return JSON.parse(jsonContent) as ProductApiResponse;
  } catch (error) {
    console.error('Error calling Product API:', error);
    return null;
  }
}

/**
 * Build TTL display string (matching C# BuildTtl method)
 */
function buildTtlDisplay(
  dataGeneratedDate?: string,
  ttlMinute?: number,
  lang: 'th' | 'en' = 'th'
): string {
  if (!dataGeneratedDate || !ttlMinute || ttlMinute <= 0) {
    return '-';
  }

  try {
    const generatedDate = new Date(dataGeneratedDate);
    const expiryDate = new Date(generatedDate.getTime() + ttlMinute * 60000);
    const now = new Date();

    if (expiryDate <= now) {
      return lang === 'th' ? 'หมดอายุแล้ว' : 'Expired';
    }

    const leftMs = expiryDate.getTime() - now.getTime();
    const minutes = Math.floor(leftMs / 60000);
    const seconds = Math.floor((leftMs % 60000) / 1000);

    if (lang === 'th') {
      return `${minutes} นาที ${seconds} วินาที`;
    } else {
      return `${minutes} min ${seconds} sec`;
    }
  } catch (error) {
    console.error('Error calculating TTL:', error);
    return '-';
  }
}

/**
 * Verify Page Component (Server Component)
 * Matching C# VerifyController.Index() exactly
 */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { data, theme, org, lang = 'th' } = params;

  // Construct current URL for language switching (without lang param)
  const urlParams = new URLSearchParams();
  if (data) urlParams.set('data', data);
  if (theme) urlParams.set('theme', theme);
  if (org) urlParams.set('org', org);
  const baseUrl = `/verify${urlParams.toString() ? '?' + urlParams.toString() : ''}`;

  // Validate theme (matching C# whitelist check)
  const selectedTheme = (theme && ALLOWED_THEMES.includes(theme)) ? theme : 'default';

  // Case 1: No query parameters at all (matching C# Case 1)
  if (!data && !theme && !org) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'PARAMETER_MISSING',
            message: 'Query parameters are missing',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 2: Missing 'data' parameter (matching C# Case 2)
  if (!data) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'PARAM_MISSING',
            message: 'Data parameter is missing',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 3: Empty data parameter (matching C# Case 3)
  if (data.trim() === '') {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'NO_DATA',
            message: 'Data parameter is empty',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 4: Missing theme parameter (matching C# Case - missing theme)
  if (!theme || theme.trim() === '') {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'MISSING_THEME',
            message: 'Theme parameter is missing',
            scanData: null,
            productData: null,
            theme: 'default',
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 5: Missing org parameter (matching C# Case - missing org)
  if (!org || org.trim() === '') {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'MISSING_ORG',
            message: 'Organization parameter is missing',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Get encryption config from environment (matching C# GetEncryptionConfig)
  const key = process.env.ENCRYPTION_KEY;
  const iv = process.env.ENCRYPTION_IV;

  if (!key || !iv) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'FAILED',
            message: 'Server Configuration Error',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Validate key/IV lengths (matching C# Aes.Create() - supports 16/24/32 byte keys)
  if (![16, 24, 32].includes(key.length) || iv.length !== 16) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'FAILED',
            message: `Server Configuration Error - Invalid key/IV length (key: ${key.length}, iv: ${iv.length})`,
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 6: Decrypt the data (matching C# Case 4)
  let decrypted: string;
  try {
    // URL-decode first (data comes URL-encoded from query string)
    const urlDecodedData = decodeURIComponent(data);
    decrypted = decrypt(urlDecodedData, key, iv);
    console.log(`Decryption successful, length: ${decrypted.length}`);
  } catch (error: any) {
    console.error('Decryption failed:', error.message);
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'DECRYPT_FAIL',
            message: `Decrypt Error: ${error.message}`,
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 7: Parse JSON (matching C# Case 4 - JSON parse error)
  let payload: any; // Use any initially to handle both PascalCase and camelCase
  try {
    const rawPayload = JSON.parse(decrypted);
    
    // C# returns PascalCase (Status, DescriptionThai, ScanItem), 
    // but our types expect camelCase (status, descriptionThai, scanItem)
    // Normalize to camelCase for consistency
    
    // Normalize ScanItem fields (also likely in PascalCase from C#)
    const rawScanItem = rawPayload.ScanItem || rawPayload.scanItem;
    const normalizedScanItem = rawScanItem ? {
      id: rawScanItem.Id || rawScanItem.id,
      orgId: rawScanItem.OrgId || rawScanItem.orgId,
      serial: rawScanItem.Serial || rawScanItem.serial,
      pin: rawScanItem.Pin || rawScanItem.pin,
      tags: rawScanItem.Tags || rawScanItem.tags,
      productCode: rawScanItem.ProductCode || rawScanItem.productCode,
      sequenceNo: rawScanItem.SequenceNo || rawScanItem.sequenceNo,
      url: rawScanItem.Url || rawScanItem.url,
      runId: rawScanItem.RunId || rawScanItem.runId,
      uploadedPath: rawScanItem.UploadedPath || rawScanItem.uploadedPath,
      itemGroup: rawScanItem.ItemGroup || rawScanItem.itemGroup,
      registeredFlag: rawScanItem.RegisteredFlag || rawScanItem.registeredFlag,
      usedFlag: rawScanItem.UsedFlag || rawScanItem.usedFlag,
      createdDate: rawScanItem.CreatedDate || rawScanItem.createdDate,
      registeredDate: rawScanItem.RegisteredDate || rawScanItem.registeredDate,
    } : null;
    
    payload = {
      status: rawPayload.Status || rawPayload.status,
      descriptionThai: rawPayload.DescriptionThai || rawPayload.descriptionThai,
      descriptionEng: rawPayload.DescriptionEng || rawPayload.descriptionEng,
      scanItem: normalizedScanItem,
      redirectUrl: rawPayload.RedirectUrl || rawPayload.redirectUrl,
      getProductUrl: rawPayload.GetProductUrl || rawPayload.getProductUrl,
      dataGeneratedDate: rawPayload.DataGeneratedDate || rawPayload.dataGeneratedDate,
      ttlMinute: rawPayload.TtlMinute || rawPayload.ttlMinute,
      productData: rawPayload.ProductData || rawPayload.productData,
    };
    
    console.log(`Payload parsed successfully, status: ${payload.status}`);
    console.log(`ScanItem data:`, payload.scanItem); // Debug: Check what's in scanItem
  } catch (error: any) {
    console.error('JSON parsing failed:', error.message);
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: 'INVALID',
            message: 'Invalid / JSON Parse Error',
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Step 8: Pass product URL to client for lazy loading (improved performance)
  // Product data will be fetched only when user clicks "View Product" button
  const productUrl = payload.getProductUrl || null;

  // Calculate TTL display (matching C# BuildTtl)
  const ttlDisplay = buildTtlDisplay(payload.dataGeneratedDate, payload.ttlMinute, lang);

  // Build VerifyViewModel and return (matching C# final return)
  return (
    <PageLayout lang={lang} currentUrl={baseUrl}>
      <VerifyView
        verifyData={{
          status: payload.status || 'UNKNOWN',
          message: lang === 'th' 
            ? (payload.descriptionThai || payload.descriptionEng || '')
            : (payload.descriptionEng || payload.descriptionThai || ''),
          scanData: payload.scanItem || null,
          productData: null, // Will be fetched lazily on client
          productUrl: productUrl, // Pass URL for lazy loading
          theme: selectedTheme,
          language: lang,
          ttl: payload.ttlMinute ? payload.ttlMinute * 60 : undefined, // Convert minutes to seconds
          createdDate: payload.dataGeneratedDate,
        }}
      />
    </PageLayout>
  );
}
