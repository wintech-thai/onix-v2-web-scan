/**
 * TEST PAGE - Development Only
 * 
 * This page displays the verification UI with mock data for testing purposes.
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
import { CheckCircle2, AlertTriangle, XCircle, Package } from 'lucide-react';

interface TestPageProps {
  searchParams: Promise<{
    scenario?: string;
    lang?: 'th' | 'en';
  }>;
}

// Scenario metadata for display
const scenarioMeta = {
  valid: { icon: CheckCircle2, color: 'text-green-600', label: 'Valid (Success)' },
  expired: { icon: AlertTriangle, color: 'text-yellow-600', label: 'Expired (Warning)' },
  error: { icon: XCircle, color: 'text-red-600', label: 'Error (Invalid)' },
  'with-product': { icon: Package, color: 'text-blue-600', label: 'With Product Info' },
  'already-registered': { icon: AlertTriangle, color: 'text-orange-600', label: 'Already Registered' },
};

// Mock data scenarios
const mockScenarios: Record<string, Omit<VerifyViewModel, 'language'>> = {
  valid: {
    status: 'VALID',
    message: 'Verification successful! This scan is authentic and valid.',
    theme: 'default',
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    expiryDate: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes from now
    scanData: {
      id: 'SCAN-12345',
      orgId: 'ORG-ACME',
      productId: 'PROD-001',
      batchNumber: 'BATCH-2024-001',
      serialNumber: 'SN-123456789',
      location: 'Warehouse A - Section 12',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: {
        inspector: 'John Doe',
        station: 'QC-01',
      },
    },
    productData: null,
  },

  expired: {
    status: 'EXPIRED',
    message: 'This verification code has expired. Please request a new one.',
    theme: 'default',
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    expiryDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago (expired)
    scanData: {
      id: 'SCAN-67890',
      orgId: 'ORG-ACME',
      productId: 'PROD-002',
      batchNumber: 'BATCH-2024-002',
      serialNumber: 'SN-987654321',
      location: 'Warehouse B - Section 5',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
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
      productId: 'PROD-PREMIUM-100',
      batchNumber: 'BATCH-PREMIUM-2024-Q4',
      serialNumber: 'SN-PREMIUM-1234567890',
      location: 'Premium Storage Facility',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      metadata: {
        inspector: 'Jane Smith',
        quality_grade: 'A+',
        certification: 'ISO-9001',
      },
    },
    productData: {
      status: 'active',
      description: 'Premium Product Information Retrieved',
      items: [
        {
          id: 'ITEM-001',
          name: 'Premium Wireless Headphones',
          code: 'WH-PRO-2024',
          properties: {
            description: 'High-fidelity wireless headphones with active noise cancellation, 30-hour battery life, and premium build quality.',
            category: 'Electronics - Audio',
            manufacturer: 'TechAudio Corp',
            metadata: {
              color: 'Midnight Black',
              weight: '250g',
              warranty: '2 years',
            },
          },
          images: [
            {
              url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
              altText: 'Wireless Headphones - Front View',
            },
            {
              url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
              altText: 'Wireless Headphones - Side View',
            },
            {
              url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
              altText: 'Wireless Headphones - Folded',
            },
            {
              url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400',
              altText: 'Wireless Headphones - Charging Case',
            },
          ],
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
      productId: 'PROD-RETAIL-050',
      batchNumber: 'BATCH-2024-SEP',
      serialNumber: 'SN-RETAIL-REG-001',
      location: 'Retail Store - Downtown',
      timestamp: new Date('2024-09-15T10:30:00Z').toISOString(),
      metadata: {
        registered_by: 'customer@example.com',
        registration_date: '2024-09-15',
      },
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
    <div className="min-h-screen bg-gray-100">
      {/* Test Banner */}
      <div className="bg-yellow-500 text-black py-2 px-4 text-center font-bold">
        ⚠️ TEST MODE - Development Only - Mock Data
      </div>

      {/* Scenario Selector */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📋 Select Test Scenario
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(mockScenarios).map((key) => {
              const meta = scenarioMeta[key as keyof typeof scenarioMeta];
              const Icon = meta?.icon;
              return (
                <Link
                  key={key}
                  href={`/test?scenario=${key}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    scenario === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${scenario === key ? 'text-white' : meta.color}`} />}
                  {meta?.label || key}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Scenario:</strong> {scenario}
              <br />
              <strong>Status:</strong> {mockData.status}
              <br />
              <strong>Has Product Data:</strong> {mockData.productData ? 'Yes' : 'No'}
              <br />
              <strong>Has Scan Data:</strong> {mockData.scanData ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-2">
        <Link
          href={`/test?scenario=${scenario}&lang=th`}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            lang === 'th' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇹🇭 ไทย
        </Link>
        <Link
          href={`/test?scenario=${scenario}&lang=en`}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            lang === 'en' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇬🇧 English
        </Link>
      </div>

      {/* Verification View */}
      <VerifyView verifyData={mockData} />

      {/* Footer Info */}
      <div className="bg-gray-800 text-white py-8 px-4 mt-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">🧪 Test Page Information</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Purpose:</strong> This page allows you to test the verification UI with mock data
              without needing encryption keys or real encrypted payloads.
            </p>
            <p>
              <strong>Scenarios:</strong> Try different scenarios to see how the UI handles various states.
            </p>
            <p>
              <strong>Production:</strong> This page should NOT be accessible in production environments.
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">Available Test Scenarios:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>valid</strong> - Valid scan with all data (OK badge)</li>
              <li><strong>expired</strong> - Expired verification code (WARN badge)</li>
              <li><strong>error</strong> - Invalid/corrupted data (ERR badge)</li>
              <li><strong>with-product</strong> - Valid scan with complete product information and images</li>
              <li><strong>already-registered</strong> - Product already registered (WARN badge)</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
