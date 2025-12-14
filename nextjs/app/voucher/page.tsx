/**
 * Voucher Verification Page - Server Component
 * path: /voucher
 *
 * Structure mimics the original VerifyPage (C# Port) for consistency.
 * - Supports Layouts (Default, Eagle).
 * - Supports Theme Switching Architecture.
 * - Includes Verbose Server-Side Logging.
 * - Delegates specific Voucher Logic to Client Component (VoucherVerifyView).
 */

import React, { Suspense } from "react";
import Link from "next/link";
import VoucherVerifyView from "@/components/voucher-themes/default/VoucherVerifyView";
import VoucherModernVerifyView from "@/components/voucher-themes/modern/VoucherVerifyView";
import VoucherMinimalVerifyView from "@/components/voucher-themes/minimal/VoucherVerifyView";
import VoucherEagleVerifyView from "@/components/voucher-themes/eagle/VoucherVerifyView";
import HamburgerMenu from "@/components/HamburgerMenuVoucher/HamburgerMenu";


// --- 1. CONFIGURATION & THEMES ---

const ALLOWED_THEMES = ["default", "modern", "minimal", "eagle"];

// เพิ่ม theme ตรงนี้กรณีมี theme ใหม่ในอนาคต
function getVoucherVerifyComponent(theme: string): React.ComponentType<any> {
  console.log(`[ThemeFactory] Selecting component for theme: ${theme}`);
  switch (theme) {
    case "minimal":
      return VoucherMinimalVerifyView;
    case "modern":
      return VoucherModernVerifyView;
    case "eagle":
      return VoucherEagleVerifyView;
    case "default":
    default:
      return VoucherVerifyView;
  }
}

// --- 2. LAYOUTS (Consistent with VerifyPage) ---

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
    <div className="min-h-screen flex flex-col" style={{ background: "#f7f8fb" }}>
      {/* Header */}
      <header>
        <nav
          style={{
            background: "#183153",
            borderBottom: "1px solid #25406b",
            boxShadow: "0 4px 14px rgba(24,49,83,0.08)",
            padding: "1rem 0",
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

      {/* Main Content */}
      <main role="main" className="flex-1 grid place-items-center py-8">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #25406b", background: "#183153" }}>
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
            <Link href="https://please-scan.com/privacy" style={{ color: "#b6c6e3", textDecoration: "none" }}>
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EagleLayout({
  children,
  lang,
  currentUrl,
}: {
  children: React.ReactNode;
  lang: "th" | "en";
  currentUrl: string;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f3f4f6" }}>
      <header className="bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-800 font-bold text-lg no-underline">
               <span className="w-8 h-8 bg-black text-white rounded flex items-center justify-center">E</span>
               Eagle Voucher
            </Link>
            <div className="text-gray-600">
               <HamburgerMenu lang={lang} currentUrl={currentUrl} />
            </div>
        </div>
      </header>

      <main role="main" className="flex-1 grid place-items-center py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
         <div>© {new Date().getFullYear()} Eagle Theme System</div>
      </footer>
    </div>
  );
}

// --- 3. PAGE PROPS & MAIN COMPONENT ---

interface VerifyPageProps {
  searchParams: Promise<{
    data?: string;
    theme?: string;
    org?: string;
    action?: string;
    lang?: "th" | "en";
  }>;
}

export default async function VoucherPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { data, theme, org, lang = "th", action } = params;

  // --- SERVER-SIDE DEBUG LOGGING (C# Style) ---
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 VOUCHER PAGE REQUEST STARTED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`timestamp: ${new Date().toISOString()}`);
  console.log("Params:");
  console.log(`  - org:   ${org || "(empty)"}`);
  console.log(`  - theme: ${theme || "(default)"}`);
  console.log(`  - lang:  ${lang}`);
  console.log(`  - data:  ${data ? `${data.substring(0, 15)}... (len:${data.length})` : "(empty)"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Construct Current URL
  const urlParams = new URLSearchParams();
  if (data) urlParams.set("data", data);
  if (theme) urlParams.set("theme", theme);
  if (org) urlParams.set("org", org);
  if (action) urlParams.set("action", action);
  const baseUrl = `/voucher${urlParams.toString() ? "?" + urlParams.toString() : ""}`;

  // 2. Validate & Select Theme
  const selectedTheme = theme && ALLOWED_THEMES.includes(theme) ? theme : "default";
  
  // 3. Select Layout
  let LayoutComponent = DefaultLayout;
  if (selectedTheme === "eagle") {
    console.log("🎨 Layout: Switching to Eagle Layout");
    LayoutComponent = EagleLayout;
  } else {
    console.log("🎨 Layout: Using Default Layout");
  }

  // 4. Select View Component
  const SelectedVoucherView = getVoucherVerifyComponent(selectedTheme);

  // 5. Render
  return (
    <LayoutComponent lang={lang} currentUrl={baseUrl}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 animate-pulse">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
             <div className="font-medium">Loading Voucher System...</div>
          </div>
        }
      >
        <SelectedVoucherView debugMode={true} />
      </Suspense>
    </LayoutComponent>
  );
}