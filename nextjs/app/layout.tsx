/**
 * Root Layout Component
 *
 * Main layout wrapper for the entire Next.js application.
 * Includes HTML structure, metadata, and global styles.
 */

import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Please Scan Verify - Verification System",
  description:
    "Secure QR code verification system with encrypted data validation and TTL checking",
  keywords: ["verification", "QR code", "security", "encryption", "validation"],
  authors: [{ name: "Please Scan Development Team" }],
  robots: "noindex, nofollow", // Prevent indexing of verification pages
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/scan-static/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${notoSansThai.variable}`}
        style={{
          fontFamily:
            '"Inter", "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
