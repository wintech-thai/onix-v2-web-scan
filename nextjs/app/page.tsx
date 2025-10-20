/**
 * Home Page Component
 * 
 * Landing page for the Onix v2 Web Scan application.
 * Provides information about the verification system and usage instructions.
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Onix v2 Web Scan
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Secure QR Code Verification System
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/api/health"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Check System Health
            </Link>
            <a
              href="/docs"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              View Documentation
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Secure Encryption
            </h3>
            <p className="text-gray-700">
              AES-256-CBC encryption ensures your verification data is protected with industry-standard security.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              TTL Validation
            </h3>
            <p className="text-gray-700">
              Time-based validation with expiration checking prevents unauthorized use of expired verification codes.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Redis Caching
            </h3>
            <p className="text-gray-700">
              High-performance Redis integration for configuration caching and session management.
            </p>
          </div>
        </div>

        {/* Usage Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            How to Use
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                1. Scan QR Code
              </h3>
              <p className="text-gray-700">
                Use your mobile device to scan the QR code containing encrypted verification data.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                2. Verification Process
              </h3>
              <p className="text-gray-700">
                The system will automatically decrypt the data, validate TTL, and check product information.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                3. View Results
              </h3>
              <p className="text-gray-700">
                Verification results are displayed with clear status indicators: 
                <span className="inline-block ml-2 px-3 py-1 bg-green-500 text-white rounded text-sm">OK</span>
                <span className="inline-block ml-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm">WARN</span>
                <span className="inline-block ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm">ERR</span>
              </p>
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            API Endpoints
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <code className="text-sm font-mono text-gray-800">
                GET /verify?data=[encrypted_data]&theme=[theme_name]&org=[org_id]
              </code>
              <p className="text-gray-700 mt-2">
                Verify encrypted QR code data with optional theme and organization parameters.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <code className="text-sm font-mono text-gray-800">
                GET /api/health
              </code>
              <p className="text-gray-700 mt-2">
                Check system health status and service availability.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="mb-2">
            Built with Next.js 15, TypeScript, and Redis
          </p>
          <p>
            © {new Date().getFullYear()} Onix Development Team. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
