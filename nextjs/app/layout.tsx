/**
 * Root Layout Component
 * 
 * Main layout wrapper for the entire Next.js application.
 * Includes HTML structure, metadata, and global styles.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Onix v2 Web Scan - Verification System',
  description: 'Secure QR code verification system with encrypted data validation and TTL checking',
  keywords: ['verification', 'QR code', 'security', 'encryption', 'validation'],
  authors: [{ name: 'Onix Development Team' }],
  robots: 'noindex, nofollow', // Prevent indexing of verification pages
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/scan-static/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
