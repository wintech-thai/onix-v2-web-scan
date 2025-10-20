/**
 * TEST PAGE - Development Only
 * 
 * This page displays the verification UI with mock         id: 'ITEM-001',
        name: 'Premium Wireless Headphones',
        code: 'WH-PRO-2024',
        propertiesObj: { for testing purposes.
 * Access different scenarios via query parameter:
 * - /test?scenario=valid (default)
 * - /test?scenario=expired
 * - /test?scenario=error
 * - /test?scenario=with-product
 * 
 * DO NOT USE IN PRODUCTION
 */

import VerifyView from '@/components/themes/default/VerifyView';
import type { VerifyViewModel } from '@/lib/types';
import Link from 'next/link';

interface TestPageProps {
  searchParams: Promise<{
    scenario?: string;
    lang?: 'th' | 'en';
  }>;
}

// Mock data scenarios
const mockScenarios: Record<string, Omit<VerifyViewModel, 'language'>> = {
  valid: {
    status: 'VALID',
    message: 'Verification successful! This scan is authentic and valid.',
    theme: 'default',
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    scanData: {
      id: 'SCAN-12345',
      orgId: 'ORG-ACME',
      productCode: 'PROD-001',
      serial: 'SN-123456789',
      pin: 'PIN-9876',
      tags: 'BATCH-2024-001',
      createdDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    productData: null,
  },

  expired: {
    status: 'EXPIRED',
    message: 'This verification code has expired. Please request a new one.',
    theme: 'default',
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    expiryDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    scanData: {
      id: 'SCAN-67890',
      orgId: 'ORG-ACME',
      productCode: 'PROD-002',
      serial: 'SN-987654321',
      pin: 'PIN-1234',
      tags: 'BATCH-2024-002',
      createdDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    productData: null,
  },

  error: {
    status: 'INVALID',
    message: 'Invalid verification data. The QR code may be corrupted or tampered with.',
    theme: 'default',
    scanData: null,
    productData: null,
  },

  'with-product': {
    status: 'VALID',
    message: 'Product verified successfully with complete information.',
    theme: 'default',
    ttl: 7200,
    createdDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 105).toISOString(),
    scanData: {
      id: 'SCAN-PREMIUM-001',
      orgId: 'ORG-PREMIUM',
      productCode: 'PROD-PREMIUM-100',
      serial: 'SN-PREMIUM-1234567890',
      pin: 'PIN-PREM-5678',
      tags: 'BATCH-PREMIUM-2024-Q4',
      createdDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    productData: {
      status: 'active',
      description: 'Premium Product Information Retrieved',
      item: {
        id: 'ITEM-001',
        name: 'Premium Wireless Headphones',
        code: 'WH-PRO-2024',
        propertiesObj: {
          category: 'Electronics - Audio',
          weight: 250,
          weightUnit: 'g',
          productUrl: 'https://example.com/products/wh-pro-2024',
          supplierUrl: 'https://example.com/supplier/techaudio',
        },
      },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          altText: 'Wireless Headphones - Front View',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
          altText: 'Wireless Headphones - Side View',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
          altText: 'Wireless Headphones - Folded',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400',
          altText: 'Wireless Headphones - Charging Case',
        },
      ],
    },
  },

  'already-registered': {
    status: 'ALREADY_REGISTERED',
    message: 'This product has already been registered. First registration was on September 15, 2024.',
    theme: 'default',
    ttl: 3600,
    createdDate: new Date('2024-09-15T10:30:00Z').toISOString(),
    expiryDate: new Date('2024-09-15T11:30:00Z').toISOString(),
    scanData: {
      id: 'SCAN-REG-001',
      orgId: 'ORG-RETAIL',
      productCode: 'PROD-RETAIL-050',
      serial: 'SN-RETAIL-REG-001',
      pin: 'PIN-REG-4321',
      tags: 'BATCH-2024-SEP',
      createdDate: new Date('2024-09-15T10:30:00Z').toISOString(),
      registeredDate: new Date('2024-09-15T10:30:00Z').toISOString(),
    },
    productData: null,
  },
};

export default async function TestPage({ searchParams }: TestPageProps) {
  const params = await searchParams;
  const scenario = params.scenario || 'valid';
  const lang = params.lang || 'th';
  const mockData: VerifyViewModel = {
    ...(mockScenarios[scenario] || mockScenarios.valid),
    language: lang,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f7f8fb' }}>
      {/* Header - Matching C# Layout with inline styles */}
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
                href={`/test?scenario=${scenario}&lang=th`}
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
                href={`/test?scenario=${scenario}&lang=en`}
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
        <VerifyView verifyData={mockData} />
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
