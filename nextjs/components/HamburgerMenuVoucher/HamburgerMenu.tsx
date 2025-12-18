'use client';

/**
 * HamburgerMenu Component - Client Component
 *
 * Mobile-responsive hamburger menu for language selection and navigation.
 * Slide-in panel from the right with language options and privacy link.
 */

import React from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

interface HamburgerMenuProps {
  lang: 'th' | 'en';
  currentUrl: string;
}

export default function HamburgerMenu({ lang, currentUrl }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Toggle language in URL
  const toggleUrl = (newLang: 'th' | 'en') => {
    try {
      const url = new URL(currentUrl, 'http://localhost');
      url.searchParams.set('lang', newLang);
      return url.pathname + url.search;
    } catch {
      return `?lang=${newLang}`;
    }
  };

  // Close menu when clicking outside or on a link
  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6 text-gray-500" />
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {lang === 'th' ? 'เมนู' : 'Menu'}
          </h2>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Panel Content */}
        <nav className="p-4 space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Globe className="w-4 h-4" />
              <span>{lang === 'th' ? 'ภาษา' : 'Language'}</span>
            </div>

            <div className="space-y-2">
              {/* Thai Option */}
              <Link
                href={toggleUrl('th')}
                onClick={closeMenu}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  lang === 'th'
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇹🇭</span>
                  <div>
                    <div className="font-medium">ไทย</div>
                    <div className="text-xs text-gray-500">Thai</div>
                  </div>
                  {lang === 'th' && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </div>
              </Link>

              {/* English Option */}
              <Link
                href={toggleUrl('en')}
                onClick={closeMenu}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  lang === 'en'
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="font-medium">English</div>
                    <div className="text-xs text-gray-500">English</div>
                  </div>
                  {lang === 'en' && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Privacy Policy Link */}
          <div className="space-y-2">
            <a
              href="https://www.please-scan.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="block w-full px-4 py-3 rounded-lg text-left bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔒</span>
                <div>
                  <div className="font-medium">
                    {lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lang === 'th' ? 'ดูรายละเอียด' : 'View details'}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            {lang === 'th' ? 'โดย Please Scan' : 'Powered by Please Scan'}
          </p>
        </div>
      </div>
    </>
  );
}
