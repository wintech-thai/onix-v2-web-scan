/**
 * TEST PAGE - Development Only
 *
 * This page displays the verification UI with mock data for testing purposes.
 * Access different scenarios via query parameter:
 * - /test?scenario=valid (SUCCESS status - shows registration button)
 * - /test?scenario=expired (EXPIRED status - no registration button)
 * - /test?scenario=error (INVALID status - no registration button)
 * - /test?scenario=with-product (SUCCESS status with product images - shows registration button)
 * - /test?scenario=already-registered (ALREADY_REGISTERED status - shows registration button)
 *
 * Registration Button Logic:
 * - Button shows ONLY for: SUCCESS and ALREADY_REGISTERED statuses
 * - Both statuses show "Already Registered" modal with registered email
 *
 * Language: ?lang=th (default) or ?lang=en
 *
 * DO NOT USE IN PRODUCTION
 */

import VerifyView from "@/components/themes/default/VerifyView";
import type { VerifyViewModel } from "@/lib/types";
import Link from "next/link";

interface TestPageProps {
  searchParams: Promise<{
    scenario?: string;
    lang?: "th" | "en";
  }>;
}

// Mock data scenarios
const mockScenarios: Record<string, Omit<VerifyViewModel, "language">> = {
  valid: {
    status: "SUCCESS",
    message: "Verification successful! This scan is authentic and valid.",
    theme: "default",
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    scanData: {
      id: "SCAN-12345",
      orgId: "napbiotec",
      productCode: "PROD-001",
      serial: "E0000123",
      pin: "TESTPIN1",
      tags: "BATCH-2024-001",
      createdDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    productData: null,
    // Real backend URLs (will be proxied)
    getCustomerUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvR2V0Q3VzdG9tZXIvRTAwMDAxMjMvVEVTVFBJTjEvdGVzdC1vdHA=",
    registerCustomerUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvUmVnaXN0ZXJDdXN0b21lci9FMDAwMDEyMy9URVNUUElOMS90ZXN0LW90cA==",
    requestOtpViaEmailUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvR2V0T3RwVmlhRW1haWwvRTAwMDAxMjMvVEVTVFBJTjEvdGVzdC1vdHAve2VtYWlsfQ==",
  },

  expired: {
    status: "EXPIRED",
    message: "This verification code has expired. Please request a new one.",
    theme: "default",
    ttl: 3600,
    createdDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    expiryDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    scanData: {
      id: "SCAN-67890",
      orgId: "ORG-ACME",
      productCode: "PROD-002",
      serial: "SN-987654321",
      pin: "PIN-1234",
      tags: "BATCH-2024-002",
      createdDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    productData: null,
    getCustomerUrl:
      "https://api.example.com/customer/check?serial=SN-987654321",
  },

  error: {
    status: "INVALID",
    message:
      "Invalid verification data. The QR code may be corrupted or tampered with.",
    theme: "default",
    scanData: null,
    productData: null,
    getCustomerUrl: "https://api.example.com/customer/check?serial=INVALID",
  },

  "with-product": {
    status: "SUCCESS",
    message: "Product verified successfully with complete information.",
    theme: "default",
    ttl: 7200,
    createdDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 105).toISOString(),
    scanData: {
      id: "SCAN-PREMIUM-001",
      orgId: "ORG-PREMIUM",
      productCode: "PROD-PREMIUM-100",
      serial: "SN-PREMIUM-1234567890",
      pin: "PIN-PREM-5678",
      tags: "BATCH-PREMIUM-2024-Q4",
      createdDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    productData: {
      status: "active",
      description: "Premium Product Information Retrieved",
      item: {
        id: "ITEM-001",
        code: "WH-PRO-2024",
        name: "Premium Wireless Headphones",
        description:
          "High-fidelity wireless headphones with active noise cancellation",
        narrative:
          "Active Noise Cancellation (ANC) technology | 30-hour battery life on single charge | Premium leather ear cushions for maximum comfort | Bluetooth 5.2 with aptX HD support | Foldable design with carrying case | Multi-device connectivity",
        orgId: "napbiotec",
        updatedDate: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 7,
        ).toISOString(),
        propertiesObj: {
          category: "Electronics - Audio",
          height: 20,
          width: 18,
          weight: 250,
          dimentionUnit: "cm",
          weightUnit: "g",
          productUrl: "https://please-scan.com/products/wh-pro-2024",
          supplierUrl: "https://please-scan.com/suppliers/techaudio",
        },
      },
      images: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
          narative: "Premium Wireless Headphones - Front View",
          altText: "Wireless Headphones Front",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
          narative: "Side view showing controls and cushioning",
          altText: "Wireless Headphones Side",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
          narative: "Folded for easy portability",
          altText: "Wireless Headphones Folded",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800",
          narative: "Premium carrying case included",
          altText: "Headphones with Case",
        },
      ],
    },
    getCustomerUrl:
      "https://api.example.com/customer/check?serial=SN-PREMIUM-1234567890",
  },

  "already-registered": {
    status: "ALREADY_REGISTERED",
    message:
      "This product has already been registered. First registration was on September 15, 2024.",
    theme: "default",
    ttl: 3600,
    createdDate: new Date("2024-09-15T10:30:00Z").toISOString(),
    expiryDate: new Date("2024-09-15T11:30:00Z").toISOString(),
    scanData: {
      id: "SCAN-REG-001",
      orgId: "napbiotec",
      productCode: "PROD-RETAIL-050",
      serial: "E0000076",
      pin: "K5XA05L",
      tags: "BATCH-2024-SEP",
      createdDate: new Date("2024-09-15T10:30:00Z").toISOString(),
      registeredDate: new Date("2024-09-15T10:30:00Z").toISOString(),
    },
    registeredEmail: "existing@napbiotec.com",
    productData: null,
    // Real backend URLs for already registered item (will show registered email from backend)
    getCustomerUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvR2V0Q3VzdG9tZXIvRTAwMDAwNzYvSzVYQTA1TC90ZXN0LW90cA==",
    registerCustomerUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvUmVnaXN0ZXJDdXN0b21lci9FMDAwMDA3Ni9LNVhBMDVML3Rlc3Qtb3Rw",
    requestOtpViaEmailUrl:
      "/api/proxy?url=aHR0cHM6Ly9zY2FuLWRldi5wbGVhc2Utc2Nhbi5jb20vYXBpL1NjYW5JdGVtQWN0aW9uL29yZy9uYXBiaW90ZWMvR2V0T3RwVmlhRW1haWwvRTAwMDAwNzYvSzVYQTA1TC90ZXN0LW90cC97ZW1haWx9",
  },
};

export default async function TestPage({ searchParams }: TestPageProps) {
  const params = await searchParams;
  const scenario = params.scenario || "valid";
  const lang = params.lang || "th";
  const mockData: VerifyViewModel = {
    ...(mockScenarios[scenario] || mockScenarios.valid),
    language: lang,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f7f8fb" }}
    >
      {/* Header - Matching C# Layout with inline styles */}
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
              <span>Please Scan - TEST MODE</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Language Toggle in Header */}
              <Link
                href={`/test?scenario=${scenario}&lang=th`}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  background: lang === "th" ? "#2563eb" : "transparent",
                  color: lang === "th" ? "#fff" : "#d1d5db",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                🇹🇭 ไทย
              </Link>
              <Link
                href={`/test?scenario=${scenario}&lang=en`}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  background: lang === "en" ? "#2563eb" : "transparent",
                  color: lang === "en" ? "#fff" : "#d1d5db",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                🇬🇧 EN
              </Link>
            </div>
          </div>
        </nav>

        {/* Test Scenario Selector */}
        <div
          style={{
            background: "#f59e0b",
            borderBottom: "2px solid #d97706",
            padding: "0.75rem 0",
          }}
        >
          <div
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              padding: "0 1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#fff",
                }}
              >
                🧪 Test Scenarios:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  "valid",
                  "expired",
                  "error",
                  "with-product",
                  "already-registered",
                ].map((s) => (
                  <Link
                    key={s}
                    href={`/test?scenario=${s}&lang=${lang}`}
                    style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background:
                        scenario === s ? "#fff" : "rgba(255, 255, 255, 0.2)",
                      color: scenario === s ? "#d97706" : "#fff",
                      textDecoration: "none",
                      border:
                        scenario === s
                          ? "2px solid #d97706"
                          : "2px solid transparent",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s === "valid" && "✅ Valid (Success)"}
                    {s === "expired" && "⏰ Expired"}
                    {s === "error" && "❌ Error"}
                    {s === "with-product" && "📦 With Product (Success)"}
                    {s === "already-registered" && "🔒 Already Registered"}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Test Info Panel */}
      <div
        style={{
          background: "#eff6ff",
          borderBottom: "1px solid #bfdbfe",
          padding: "1rem 0",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "0 1rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
            <strong>📝 Current Test Data:</strong>
            <div
              style={{
                marginTop: "0.5rem",
                fontFamily: "monospace",
                fontSize: "0.75rem",
              }}
            >
              Status: <strong>{mockData.status}</strong> | Serial:{" "}
              <strong>{mockData.scanData?.serial || "N/A"}</strong> | OrgId:{" "}
              <strong>{mockData.scanData?.orgId || "N/A"}</strong>
              {mockData.registeredEmail && (
                <span>
                  {" "}
                  | Registered Email:{" "}
                  <strong>{mockData.registeredEmail}</strong>
                </span>
              )}
            </div>

            {/* Registration Testing Instructions */}
            {(scenario === "valid" || scenario === "with-product") && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  background: "#dbeafe",
                  borderLeft: "3px solid #2563eb",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                  🧪 Registration Flow Test - New Customer
                </div>
                <div style={{ color: "#1e40af" }}>
                  1. Click <strong>"Register"</strong> button below
                  <br />
                  2. System will call <strong>GET /api/proxy</strong>{" "}
                  (GetCustomer API)
                  <br />
                  3. Modal opens - Enter your email (any test email like
                  test@example.com)
                  <br />
                  4. Click <strong>"Request OTP"</strong> →{" "}
                  <strong>GET /api/proxy</strong> (GetOtpViaEmail API)
                  <br />
                  5. Check your email for OTP code (6 digits)
                  <br />
                  6. Enter OTP and click <strong>"Submit"</strong> →{" "}
                  <strong>POST /api/proxy</strong> (RegisterCustomer API)
                  <br />
                  7. Success! Check Network tab for all API calls
                </div>
              </div>
            )}

            {scenario === "already-registered" && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  background: "#fef3c7",
                  borderLeft: "3px solid #f59e0b",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                  🔒 Registration Flow Test - Existing Customer
                </div>
                <div style={{ color: "#92400e" }}>
                  1. Click <strong>"Register"</strong> button below
                  <br />
                  2. System calls <strong>GET /api/proxy</strong>{" "}
                  (GetCustomer/E0000076/K5XA05L)
                  <br />
                  3. Backend returns <strong>SUCCESS</strong> with registered
                  email
                  <br />
                  4. Modal shows: "Already registered with{" "}
                  <strong>existing@napbiotec.com</strong>" (or actual email)
                  <br />
                  5. This tests the "already registered" detection flow
                  <br />
                  ⚠️ Cannot re-register - product already claimed
                </div>
              </div>
            )}

            {scenario !== "valid" &&
              scenario !== "with-product" &&
              scenario !== "already-registered" && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    background: "#fee2e2",
                    borderLeft: "3px solid #ef4444",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    color: "#991b1b",
                  }}
                >
                  ⚠️ Registration button not available for this status (
                  <strong>{mockData.status}</strong>). Try "Valid (Success)" or
                  "Already Registered" scenarios.
                </div>
              )}

            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.7rem",
                color: "#6b7280",
                fontStyle: "italic",
              }}
            >
              💡 Open DevTools → Network tab to see all API calls to /api/proxy
              → Backend
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Centered like C# */}
      <main role="main" className="flex-1 grid place-items-center py-8">
        <VerifyView verifyData={mockData} />
      </main>

      {/* Footer - Matching C# Layout */}
      <footer
        style={{
          borderTop: "1px solid #25406b",
          background: "#183153",
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
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>© {new Date().getFullYear()} Please Scan - 🧪 TEST MODE</div>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
            <div>
              Scenario: <strong>{scenario}</strong>
            </div>
            <div>
              Lang: <strong>{lang}</strong>
            </div>
            <Link
              href="https://api-dev.please-scan.com/swagger/index.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              📚 API Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
