/**
 * Voucher Verification Page - Server Component
 * path: app/voucher/page.tsx
 */

import React, { Suspense } from "react";
import Link from "next/link";
// เรียกใช้หน้าจอ Vortex ที่คุณทำเสร็จแล้ว
import VoucherVerifyView from "@/components/voucher-themes/default/VoucherVerifyView";
import HamburgerMenu from "@/components/HamburgerMenuVoucher/HamburgerMenu";

// --- LAYOUT: แบบเดิม (Original Corporate Theme) ---
function DefaultLayout({
  children,
  lang,
  currentUrl,
}: {
  children: React.ReactNode;
  lang: "th" | "en";
  currentUrl: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f7f8fb" }}
    >
      {/* --- HEADER (Original) --- */}
      <header>
        <nav
          style={{
            background: "#183153", // สีน้ำเงินเข้มเดิม
            borderBottom: "1px solid #25406b",
            boxShadow: "0 4px 14px rgba(24,49,83,0.08)",
            padding: "1rem 0",
            position: "relative",
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              padding: "0 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="https://please-scan.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 700,
                letterSpacing: "0.2px",
                color: "#f3f7fa",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
                }}
              >
                PS
              </span>
              <span>Please Scan Verify</span>
            </Link>
            <HamburgerMenu lang={lang} currentUrl={currentUrl} />
          </div>
        </nav>
      </header>

      <main role="main" className="flex-1 flex flex-col w-full relative">
        {children}
      </main>

      {/* --- FOOTER (Original) --- */}
      <footer
        style={{
          borderTop: "1px solid #25406b",
          background: "#183153",
          position: "relative",
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "14px 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#b6c6e3",
            fontSize: "14px",
          }}
        >
          <div>© {new Date().getFullYear()} Please Scan</div>
          <div>
            <Link
              href="https://please-scan.com/privacy"
              style={{ color: "#b6c6e3", textDecoration: "none" }}
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- MAIN COMPONENT ---

interface VerifyPageProps {
  searchParams: Promise<{
    data?: string;
    org?: string;
    lang?: "th" | "en";
  }>;
}

export default async function VoucherPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { data, org, lang = "th" } = params;

  // Construct URL
  const urlParams = new URLSearchParams();
  if (data) urlParams.set("data", data);
  if (org) urlParams.set("org", org);
  const baseUrl = `/voucher${
    urlParams.toString() ? "?" + urlParams.toString() : ""
  }`;

  return (
    <DefaultLayout lang={lang} currentUrl={baseUrl}>
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col items-center justify-center bg-black p-12 text-[#00FFC2] animate-pulse">
            <div className="w-10 h-10 border-4 border-[#00FFC2] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="font-medium uppercase tracking-widest">
              Loading...
            </div>
          </div>
        }
      >
        <VoucherVerifyView />
      </Suspense>
    </DefaultLayout>
  );
}
