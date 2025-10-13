'use client';

import { VerifyViewModel } from '@/lib/types';
import { translations, getStatusTitle, getStatusMessages } from '@/lib/translations';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertTriangle, XCircle, Copy, Check } from 'lucide-react';

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

export default function VerifyView({ verifyData }: VerifyViewProps) {
  const lang = verifyData.language || 'th';
  const t = translations[lang];
  const status = verifyData.status?.toUpperCase() || 'UNKNOWN';

  // Determine status type
  const isSuccess = ['OK', 'SUCCESS', 'VALID'].includes(status);
  const isWarning = ['ALREADY_REGISTERED', 'WARN', 'EXPIRED'].includes(status);
  const isError = !isSuccess && !isWarning;

  // Get appropriate icon and colors
  const getStatusIcon = () => {
    if (isSuccess) {
      return {
        Icon: CheckCircle2,
        bgGradient: 'linear-gradient(135deg, #6FE10A 0%, #58CD04 100%)',
        shadow: 'rgba(111, 225, 10, 0.3)',
        badgeText: '✓ ตรวจสอบสำเร็จ'
      };
    }
    if (isWarning) {
      return {
        Icon: AlertTriangle,
        bgGradient: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
        shadow: 'rgba(255, 167, 38, 0.3)',
        badgeText: '⚠️ ระวัง'
      };
    }
    return {
      Icon: XCircle,
      bgGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      shadow: 'rgba(255, 107, 107, 0.3)',
      badgeText: '⚠️ พบปัญหา'
    };
  };

  const statusIcon = getStatusIcon();

  // Copy button state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Confetti effect for success
  useEffect(() => {
    if (['OK', 'SUCCESS', 'VALID'].includes(status)) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
  }, [status]);

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const statusTitle = getStatusTitle(status, lang);
  const statusMessages = getStatusMessages(status, lang);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="mb-4 text-right">
          <div className="inline-flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('lang', 'th');
                window.location.href = url.toString();
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'th' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('lang', 'en');
                window.location.href = url.toString();
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Status Badge and Icon Section */}
          <div className="text-center py-8 px-6 bg-white">
            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              <div
                className="text-white px-4 py-2 rounded-full font-semibold shadow-sm"
                style={{
                  background: statusIcon.bgGradient,
                  boxShadow: `0 3px 8px ${statusIcon.shadow}`
                }}
              >
                {statusIcon.badgeText}
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="rounded-full p-4 shadow-lg"
                style={{
                  background: statusIcon.bgGradient,
                  boxShadow: `0 6px 16px ${statusIcon.shadow}`
                }}
              >
                <statusIcon.Icon className="text-white" size={64} strokeWidth={2} />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {statusTitle}
            </h1>
            
            {/* Messages */}
            <div className="space-y-2">
              {statusMessages.map((msg, index) => (
                <p key={index} className="text-base text-gray-600">
                  {msg}
                </p>
              ))}
            </div>

            {/* Serial and Pin Section */}
            {(verifyData.scanData?.serialNumber || verifyData.scanData?.pin) && (
              <div className="mt-6 space-y-3">
                {/* Serial */}
                {verifyData.scanData.serialNumber && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Serial :</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      {verifyData.scanData.serialNumber}
                    </span>
                    <button
                      onClick={() => copyToClipboard(verifyData.scanData!.serialNumber!, 'serial')}
                      className="inline-flex items-center justify-center p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      title="Copy Serial"
                      aria-label="Copy Serial"
                    >
                      {copiedField === 'serial' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                )}

                {/* Pin */}
                {verifyData.scanData.pin && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Pin :</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      {verifyData.scanData.pin}
                    </span>
                    <button
                      onClick={() => copyToClipboard(verifyData.scanData!.pin!, 'pin')}
                      className="inline-flex items-center justify-center p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      title="Copy Pin"
                      aria-label="Copy Pin"
                    >
                      {copiedField === 'pin' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200"></div>

          {/* Scan Data Section */}
          {verifyData.scanData && (
            <div className="px-6 py-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t.scanDetails}
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {verifyData.scanData.id && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.scanId}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.id}</td>
                      </tr>
                    )}
                    {verifyData.scanData.orgId && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.organization}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.orgId}</td>
                      </tr>
                    )}
                    {verifyData.scanData.productId && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.productId}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.productId}</td>
                      </tr>
                    )}
                    {verifyData.scanData.batchNumber && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.batchNumber}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.batchNumber}</td>
                      </tr>
                    )}
                    {verifyData.scanData.serialNumber && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.serialNumber}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.serialNumber}</td>
                      </tr>
                    )}
                    {verifyData.scanData.location && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.location}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.scanData.location}</td>
                      </tr>
                    )}
                    {verifyData.scanData.timestamp && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.timestamp}</td>
                        <td className="py-3 text-sm text-gray-900">{formatDate(verifyData.scanData.timestamp)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {verifyData.scanData.metadata && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-2">{t.metadata}</div>
                    <div className="space-y-1">
                      {Object.entries(verifyData.scanData.metadata).map(([key, value]) => (
                        <div key={key} className="flex text-sm">
                          <span className="font-medium text-gray-600 mr-2">{key}:</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TTL Information */}
          {(verifyData.ttl || verifyData.createdDate || verifyData.expiryDate) && (
            <div className="px-6 py-6 bg-white border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t.ttlInfo}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {verifyData.ttl && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.ttl}</td>
                        <td className="py-3 text-sm text-gray-900">{verifyData.ttl} {t.seconds}</td>
                      </tr>
                    )}
                    {verifyData.createdDate && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.createdDate}</td>
                        <td className="py-3 text-sm text-gray-900">{formatDate(verifyData.createdDate)}</td>
                      </tr>
                    )}
                    {verifyData.expiryDate && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-500">{t.expiryDate}</td>
                        <td className="py-3 text-sm text-gray-900">{formatDate(verifyData.expiryDate)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Product Information */}
          {verifyData.productData?.items && verifyData.productData.items.length > 0 && (
            <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t.productInfo}
              </h2>
              {verifyData.productData.items.map((item, index) => (
                <div key={item.id || index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  
                  {item.code && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">{t.productCode}:</span>{' '}
                      <span className="font-mono">{item.code}</span>
                    </div>
                  )}

                  {item.properties && (
                    <>
                      {item.properties.description && (
                        <p className="text-gray-700 mb-4">{item.properties.description}</p>
                      )}
                      
                      <table className="w-full mb-4">
                        <tbody className="divide-y divide-gray-200">
                          {item.properties.category && (
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500">{t.category}</td>
                              <td className="py-2 text-sm text-gray-900">{item.properties.category}</td>
                            </tr>
                          )}
                          {item.properties.manufacturer && (
                            <tr>
                              <td className="py-2 text-sm font-medium text-gray-500">{t.manufacturer}</td>
                              <td className="py-2 text-sm text-gray-900">{item.properties.manufacturer}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {item.properties.metadata && (
                        <div className="bg-gray-50 rounded p-3 mb-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">{t.additionalInfo}</div>
                          <div className="space-y-1">
                            {Object.entries(item.properties.metadata).map(([key, value]) => (
                              <div key={key} className="flex text-sm">
                                <span className="text-gray-600 mr-2">{key}:</span>
                                <span className="text-gray-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {item.images && item.images.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{t.productImages}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group cursor-pointer">
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={image.url}
                                alt={image.altText || `Product image ${imgIndex + 1}`}
                                fill
                                className="object-cover hover:scale-110 transition-transform"
                                onClick={() => window.open(image.url, '_blank')}
                              />
                            </div>
                            {image.altText && (
                              <div className="text-xs text-gray-600 mt-1 text-center truncate">
                                {image.altText}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-100 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">{t.footer}</p>
            <p className="mt-1 text-xs text-gray-500">
              {t.theme}: {verifyData.theme || 'default'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
