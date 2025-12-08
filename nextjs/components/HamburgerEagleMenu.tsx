'use client';

/**
 * Eagle Theme HamburgerMenu
 * * Customized for Dark/Red Sporty Aesthetic.
 */

import React from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

interface HamburgerEagleMenuProps {
  lang: 'th' | 'en';
  currentUrl: string;
}

export default function HamburgerMenuEagle({ lang, currentUrl }: HamburgerEagleMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Toggle language in URL (Logic เดิม)
  const toggleUrl = (newLang: 'th' | 'en') => {
    try {
      const url = new URL(currentUrl, 'http://localhost');
      url.searchParams.set('lang', newLang);
      return url.pathname + url.search;
    } catch {
      return `?lang=${newLang}`;
    }
  };

  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll (Logic เดิม)
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
      {/* Hamburger Button (ปรับให้เป็นสีขาวสำหรับพื้นหลังดำ) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop Overlay (ทำให้มืดลงกว่าเดิมเพื่อให้ดูเข้มขลัง) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 transition-opacity backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel (Dark Theme) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0f0f0f] border-l border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0a0a0a]">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {lang === 'th' ? 'เมนูหลัก' : 'Main Menu'}
          </h2>
          <button
            onClick={closeMenu}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Panel Content */}
        <nav className="p-4 space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">
              <Globe className="w-3 h-3" />
              <span>{lang === 'th' ? 'เลือกภาษา' : 'Select Language'}</span>
            </div>

            <div className="space-y-3">
              {/* Thai Option */}
              <Link
                href={toggleUrl('th')}
                onClick={closeMenu}
                className={`block w-full px-4 py-3 rounded border transition-all relative overflow-hidden group ${
                  lang === 'th'
                    ? 'bg-red-900/20 border-red-600 text-white'
                    : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                {/* Active Indicator Strip */}
                {lang === 'th' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>}
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow-lg">🇹🇭</span>
                  <div>
                    <div className="font-bold uppercase text-sm">ไทย</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Thai</div>
                  </div>
                  {lang === 'th' && (
                    <span className="ml-auto text-red-500 font-bold">●</span>
                  )}
                </div>
              </Link>

              {/* English Option */}
              <Link
                href={toggleUrl('en')}
                onClick={closeMenu}
                className={`block w-full px-4 py-3 rounded border transition-all relative overflow-hidden group ${
                  lang === 'en'
                    ? 'bg-red-900/20 border-red-600 text-white'
                    : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                {/* Active Indicator Strip */}
                {lang === 'en' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>}

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow-lg">🇬🇧</span>
                  <div>
                    <div className="font-bold uppercase text-sm">English</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">English</div>
                  </div>
                  {lang === 'en' && (
                    <span className="ml-auto text-red-500 font-bold">●</span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-4" />

          {/* Privacy Policy Link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">
               <span>INFO</span>
            </div>
            <a
              href="https://www.please-scan.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="block w-full px-4 py-3 rounded bg-[#1a1a1a] border border-gray-800 text-gray-300 hover:bg-[#222] hover:border-gray-600 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-500">🔒</span>
                <div>
                  <div className="font-bold text-sm uppercase">
                    {lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">
                    {lang === 'th' ? 'อ่านข้อตกลง' : 'Read Terms'}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-[#050505]">
          <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
            {lang === 'th' ? 'ระบบโดย Please Scan' : 'Powered by Please Scan'}
          </p>
        </div>
      </div>
    </>
  );
}