/**
 * Verification Page - Server Component
 *
 * Handles verification requests with encrypted QR code data.
 * Server-side decryption, validation, TTL checking, and theme rendering.
 * Matches C# VerifyController.cs implementation exactly.
 *
 * Query Parameters:
 * - data: Base64-encoded encrypted verification data (required, URL-encoded)
 * - theme: Theme name for rendering (optional, default: 'default')
 * - org: Organization identifier (required)
 * - lang: Language preference (optional, default: 'th')
 */

import React from "react";
import { decrypt } from "@/lib/encryption";
import type {
  VerifyViewModel,
  VerifyPayload,
  ProductApiResponse,
} from "@/lib/types";
import VerifyView from "@/components/themes/default/VerifyView";
import HamburgerMenu from "@/components/HamburgerMenu";
import Link from "next/link";

// Import the verify API logic directly to avoid HTTP fetch overhead
interface BackendScanItem {
  id?: string;
  orgId?: string;
  serial?: string;
  pin?: string;
  tags?: string;
  productCode?: string;
  sequenceNo?: string;
  url?: string;
  runId?: string;
  uploadedPath?: string;
  itemGroup?: string;
  registeredFlag?: string;
  scanCount?: number;
  usedFlag?: string;
  itemId?: string;
  appliedFlag?: string;
  customerId?: string;
  createdDate?: string;
  registeredDate?: string;
}

interface BackendVerifyResponse {
  status?: string;
  descriptionThai?: string;
  descriptionEng?: string;
  scanItem?: BackendScanItem;
  redirectUrl?: string;
  getProductUrl?: string;
  getCustomerUrl?: string;
  registerCustomerUrl?: string;
  requestOtpViaEmailUrl?: string;
  themeVerify?: string;
  dataGeneratedDate?: string;
  ttlMinute?: number;
}

/**
 * Encode URL for proxy endpoint
 */
function encodeProxyUrl(originalUrl: string): string {
  return `/api/proxy?url=${encodeURIComponent(Buffer.from(originalUrl).toString("base64"))}`;
}

/**
 * Transform backend URLs to proxy URLs
 */
function transformUrls(response: BackendVerifyResponse): BackendVerifyResponse {
  const transformed = { ...response };

  if (transformed.getProductUrl) {
    transformed.getProductUrl = encodeProxyUrl(transformed.getProductUrl);
  }

  if (transformed.getCustomerUrl) {
    transformed.getCustomerUrl = encodeProxyUrl(transformed.getCustomerUrl);
  }

  if (transformed.registerCustomerUrl) {
    transformed.registerCustomerUrl = encodeProxyUrl(
      transformed.registerCustomerUrl,
    );
  }

  if (transformed.requestOtpViaEmailUrl) {
    transformed.requestOtpViaEmailUrl = encodeProxyUrl(
      transformed.requestOtpViaEmailUrl,
    );
  }

  return transformed;
}

interface VerifyPageProps {
  searchParams: Promise<{
    data?: string;
    theme?: string;
    org?: string;
    lang?: "th" | "en";
  }>;
}

/**
 * Layout wrapper with header and footer (matching test page)
 */
function PageLayout({
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
      {/* Header - Matching C# Layout */}
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

      {/* Main Content Area - Centered like C# */}
      <main role="main" className="flex-1 grid place-items-center py-8">
        {children}
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
          }}
        >
          <div>© {new Date().getFullYear()} Please Scan</div>
          <div>
            <Link
              href="https://please-scan.com/privacy"
              style={{
                color: "#b6c6e3",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Whitelist of allowed themes (matching C# controller)
// Add new themes here as you create them in components/themes/{themeName}/
const ALLOWED_THEMES = ["default", "modern", "minimal"];

/**
 * Fetch product data from external API (matching C# FetchProductData)
 */
async function fetchProductData(
  url: string,
): Promise<ProductApiResponse | null> {
  try {
    console.log(`Calling Product API: ${url}`);
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      console.error(`Product API failed with status: ${response.status}`);
      return null;
    }

    const jsonContent = await response.text();
    console.log(`Product API Response: ${jsonContent.substring(0, 200)}`);

    return JSON.parse(jsonContent) as ProductApiResponse;
  } catch (error) {
    console.error("Error calling Product API:", error);
    return null;
  }
}

/**
 * Call verify logic directly (optimized - no HTTP fetch)
 */
async function verifyDataDirect(
  org: string,
  data: string,
  theme?: string,
): Promise<VerifyPayload | null> {
  try {
    // Get encryption credentials from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptionIV = process.env.ENCRYPTION_IV;

    if (!encryptionKey || !encryptionIV) {
      console.error("Missing encryption credentials in environment variables");
      return {
        status: "ERROR",
        descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
        descriptionEng: "Server configuration error",
      };
    }

    // Decrypt the data
    let decryptedData: string;
    try {
      const urlDecodedData = decodeURIComponent(data);
      decryptedData = decrypt(urlDecodedData, encryptionKey, encryptionIV);
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📦 DECRYPTED DATA");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Length:", decryptedData.length);
      console.log("Raw data:", decryptedData);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (error) {
      console.error("Decryption failed:", error);
      return {
        status: "DECRYPT_FAIL",
        descriptionThai: "ไม่สามารถถอดรหัสข้อมูลได้",
        descriptionEng: "Failed to decrypt data",
      };
    }

    // Check if decrypted data is already a full backend response (JSON)
    let backendData: BackendVerifyResponse;

    try {
      const parsed = JSON.parse(decryptedData);

      if (
        parsed.Status ||
        parsed.status ||
        parsed.ScanItem ||
        parsed.scanItem
      ) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ Decrypted data contains FULL BACKEND RESPONSE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        backendData = parsed;
      } else if (parsed.serial && parsed.pin) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(
          "🔑 Decrypted data contains SERIAL/PIN - calling backend API",
        );
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Serial:", parsed.serial || parsed.Serial);
        console.log("Pin:", parsed.pin || parsed.Pin);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const serial = parsed.serial || parsed.Serial;
        const pin = parsed.pin || parsed.Pin;

        const apiBaseUrl = process.env.API_BASE_URL;
        if (!apiBaseUrl) {
          console.error("API_BASE_URL not configured");
          return {
            status: "ERROR",
            descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
            descriptionEng: "Server configuration error",
          };
        }

        const backendUrl = `${apiBaseUrl}/org/${org}/VerifyScanItem/${serial}/${pin}`;
        console.log("\n🌐 CALLING BACKEND API");
        console.log("URL:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("\n❌ BACKEND API ERROR");
          console.error("Status:", backendResponse.status);
          console.error("Response:", errorText);
          return {
            status: "ERROR",
            descriptionThai: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
            descriptionEng: "Backend server error",
          };
        }

        backendData = await backendResponse.json();
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ BACKEND API RESPONSE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(JSON.stringify(backendData, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      } else {
        throw new Error("Invalid JSON format: missing required fields");
      }
    } catch (jsonError) {
      // Not JSON, try pipe-separated format
      const parts = decryptedData.split("|");
      if (parts.length >= 2) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 Decrypted data in PIPE-SEPARATED format");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Format: serial|pin");
        console.log("Parts:", parts);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const serial = parts[0];
        const pin = parts[1];

        const apiBaseUrl = process.env.API_BASE_URL;
        if (!apiBaseUrl) {
          console.error("API_BASE_URL not configured");
          return {
            status: "ERROR",
            descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
            descriptionEng: "Server configuration error",
          };
        }

        const backendUrl = `${apiBaseUrl}/org/${org}/VerifyScanItem/${serial}/${pin}`;
        console.log("\n🌐 CALLING BACKEND API");
        console.log("URL:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("\n❌ BACKEND API ERROR");
          console.error("Status:", backendResponse.status);
          console.error("Response:", errorText);
          return {
            status: "ERROR",
            descriptionThai: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
            descriptionEng: "Backend server error",
          };
        }

        backendData = await backendResponse.json();
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ BACKEND API RESPONSE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(JSON.stringify(backendData, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      } else {
        return {
          status: "PARAM_MISSING",
          descriptionThai: "ข้อมูลไม่ครบถ้วน: รูปแบบข้อมูลไม่ถูกต้อง",
          descriptionEng: "Invalid data format: expected JSON or serial|pin",
        };
      }
    }

    // Normalize PascalCase to camelCase
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 NORMALIZING BACKEND DATA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const rawScanItem = backendData.scanItem || (backendData as any).ScanItem;
    console.log("Raw ScanItem:", JSON.stringify(rawScanItem, null, 2));
    const normalizedScanItem = rawScanItem
      ? {
          id: rawScanItem.id || (rawScanItem as any).Id,
          orgId: rawScanItem.orgId || (rawScanItem as any).OrgId,
          serial: rawScanItem.serial || (rawScanItem as any).Serial,
          pin: rawScanItem.pin || (rawScanItem as any).Pin,
          tags: rawScanItem.tags || (rawScanItem as any).Tags,
          productCode:
            rawScanItem.productCode || (rawScanItem as any).ProductCode,
          sequenceNo: rawScanItem.sequenceNo || (rawScanItem as any).SequenceNo,
          url: rawScanItem.url || (rawScanItem as any).Url,
          runId: rawScanItem.runId || (rawScanItem as any).RunId,
          uploadedPath:
            rawScanItem.uploadedPath || (rawScanItem as any).UploadedPath,
          itemGroup: rawScanItem.itemGroup || (rawScanItem as any).ItemGroup,
          registeredFlag:
            rawScanItem.registeredFlag || (rawScanItem as any).RegisteredFlag,
          scanCount: rawScanItem.scanCount || (rawScanItem as any).ScanCount,
          usedFlag: rawScanItem.usedFlag || (rawScanItem as any).UsedFlag,
          itemId: rawScanItem.itemId || (rawScanItem as any).ItemId,
          appliedFlag:
            rawScanItem.appliedFlag || (rawScanItem as any).AppliedFlag,
          customerId: rawScanItem.customerId || (rawScanItem as any).CustomerId,
          createdDate:
            rawScanItem.createdDate || (rawScanItem as any).CreatedDate,
          registeredDate:
            rawScanItem.registeredDate || (rawScanItem as any).RegisteredDate,
        }
      : undefined;

    const normalizedData: BackendVerifyResponse = {
      status: backendData.status || (backendData as any).Status,
      descriptionThai:
        backendData.descriptionThai || (backendData as any).DescriptionThai,
      descriptionEng:
        backendData.descriptionEng || (backendData as any).DescriptionEng,
      scanItem: normalizedScanItem,
      redirectUrl: backendData.redirectUrl || (backendData as any).RedirectUrl,
      getProductUrl:
        backendData.getProductUrl || (backendData as any).GetProductUrl,
      getCustomerUrl:
        backendData.getCustomerUrl || (backendData as any).GetCustomerUrl,
      registerCustomerUrl:
        backendData.registerCustomerUrl ||
        (backendData as any).RegisterCustomerUrl,
      requestOtpViaEmailUrl:
        backendData.requestOtpViaEmailUrl ||
        (backendData as any).RequestOtpViaEmailUrl,
      themeVerify: backendData.themeVerify || (backendData as any).ThemeVerify,
      dataGeneratedDate:
        backendData.dataGeneratedDate || (backendData as any).DataGeneratedDate,
      ttlMinute: backendData.ttlMinute || (backendData as any).TtlMinute,
    };

    // Transform URLs to proxy endpoints
    const transformedData = transformUrls(normalizedData);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 FINAL NORMALIZED & PROXIED DATA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Status:", transformedData.status);
    console.log("Description (TH):", transformedData.descriptionThai);
    console.log("Description (EN):", transformedData.descriptionEng);
    console.log("\nScanItem:");
    console.log("  Serial:", normalizedScanItem?.serial);
    console.log("  Pin:", normalizedScanItem?.pin);
    console.log("  OrgId:", normalizedScanItem?.orgId);
    console.log("  ProductCode:", normalizedScanItem?.productCode);
    console.log("\nProxied URLs:");
    console.log("  getCustomerUrl:", transformedData.getCustomerUrl);
    console.log("  registerCustomerUrl:", transformedData.registerCustomerUrl);
    console.log(
      "  requestOtpViaEmailUrl:",
      transformedData.requestOtpViaEmailUrl,
    );
    console.log("  getProductUrl:", transformedData.getProductUrl);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return transformedData as VerifyPayload;
  } catch (error) {
    console.error("Verify error:", error);
    return {
      status: "ERROR",
      descriptionThai: "เกิดข้อผิดพลาดในการตรวจสอบ",
      descriptionEng: `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Build TTL display string (matching C# BuildTtl method)
 */
function buildTtlDisplay(
  dataGeneratedDate?: string,
  ttlMinute?: number,
  lang: "th" | "en" = "th",
): string {
  if (!dataGeneratedDate || !ttlMinute || ttlMinute <= 0) {
    return "-";
  }

  try {
    const generatedDate = new Date(dataGeneratedDate);
    const expiryDate = new Date(generatedDate.getTime() + ttlMinute * 60000);
    const now = new Date();

    if (expiryDate <= now) {
      return lang === "th" ? "หมดอายุแล้ว" : "Expired";
    }

    const leftMs = expiryDate.getTime() - now.getTime();
    const minutes = Math.floor(leftMs / 60000);
    const seconds = Math.floor((leftMs % 60000) / 1000);

    if (lang === "th") {
      return `${minutes} นาที ${seconds} วินาที`;
    } else {
      return `${minutes} min ${seconds} sec`;
    }
  } catch (error) {
    console.error("Error calculating TTL:", error);
    return "-";
  }
}

/**
 * Verify Page Component (Server Component)
 * Matching C# VerifyController.Index() exactly
 */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const { data, theme, org, lang = "th" } = params;

  // Construct current URL for language switching (without lang param)
  const urlParams = new URLSearchParams();
  if (data) urlParams.set("data", data);
  if (theme) urlParams.set("theme", theme);
  if (org) urlParams.set("org", org);
  const baseUrl = `/verify${urlParams.toString() ? "?" + urlParams.toString() : ""}`;

  // Validate theme (matching C# whitelist check)
  const selectedTheme =
    theme && ALLOWED_THEMES.includes(theme) ? theme : "default";

  // Case 1: No query parameters at all (matching C# Case 1)
  if (!data && !theme && !org) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "PARAMETER_MISSING",
            message: "Query parameters are missing",
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 2: Missing 'data' parameter (matching C# Case 2)
  if (!data) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "PARAM_MISSING",
            message: "Data parameter is missing",
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 3: Empty data parameter (matching C# Case 3)
  if (data.trim() === "") {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "NO_DATA",
            message: "Data parameter is empty",
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 4: Missing theme parameter (matching C# Case - missing theme)
  if (!theme || theme.trim() === "") {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "MISSING_THEME",
            message: "Theme parameter is missing",
            scanData: null,
            productData: null,
            theme: "default",
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Case 5: Missing org parameter (matching C# Case - missing org)
  if (!org || org.trim() === "") {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "MISSING_ORG",
            message: "Organization parameter is missing",
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Call verify logic directly (optimized - no HTTP overhead)
  const verifyResult = await verifyDataDirect(org, data, selectedTheme);

  if (!verifyResult) {
    return (
      <PageLayout lang={lang} currentUrl={baseUrl}>
        <VerifyView
          verifyData={{
            status: "FAILED",
            message: "Failed to verify data with backend",
            scanData: null,
            productData: null,
            theme: selectedTheme,
            language: lang,
          }}
        />
      </PageLayout>
    );
  }

  // Normalize the response (handle both PascalCase and camelCase)
  const rawScanItem = verifyResult.scanItem;
  const normalizedScanItem = rawScanItem
    ? {
        id: rawScanItem.id || (rawScanItem as any).Id,
        orgId: rawScanItem.orgId || (rawScanItem as any).OrgId,
        serial: rawScanItem.serial || (rawScanItem as any).Serial,
        pin: rawScanItem.pin || (rawScanItem as any).Pin,
        tags: rawScanItem.tags || (rawScanItem as any).Tags,
        productCode:
          rawScanItem.productCode || (rawScanItem as any).ProductCode,
        sequenceNo: rawScanItem.sequenceNo || (rawScanItem as any).SequenceNo,
        url: rawScanItem.url || (rawScanItem as any).Url,
        runId: rawScanItem.runId || (rawScanItem as any).RunId,
        uploadedPath:
          rawScanItem.uploadedPath || (rawScanItem as any).UploadedPath,
        itemGroup: rawScanItem.itemGroup || (rawScanItem as any).ItemGroup,
        registeredFlag:
          rawScanItem.registeredFlag || (rawScanItem as any).RegisteredFlag,
        usedFlag: rawScanItem.usedFlag || (rawScanItem as any).UsedFlag,
        createdDate:
          rawScanItem.createdDate || (rawScanItem as any).CreatedDate,
        registeredDate:
          rawScanItem.registeredDate || (rawScanItem as any).RegisteredDate,
      }
    : null;

  // Calculate TTL display
  const ttlDisplay = buildTtlDisplay(
    verifyResult.dataGeneratedDate,
    verifyResult.ttlMinute,
    lang,
  );

  // Build VerifyViewModel with ALL backend URLs (proxied)
  return (
    <PageLayout lang={lang} currentUrl={baseUrl}>
      <VerifyView
        verifyData={{
          status: verifyResult.status || "UNKNOWN",
          message:
            lang === "th"
              ? verifyResult.descriptionThai ||
                verifyResult.descriptionEng ||
                ""
              : verifyResult.descriptionEng ||
                verifyResult.descriptionThai ||
                "",
          scanData: normalizedScanItem,
          productData: null, // Will be fetched lazily on client
          productUrl: verifyResult.getProductUrl || undefined,
          theme: selectedTheme,
          language: lang,
          ttl: verifyResult.ttlMinute ? verifyResult.ttlMinute * 60 : undefined,
          createdDate: verifyResult.dataGeneratedDate,
          // Include proxied backend URLs for registration flow
          getCustomerUrl: verifyResult.getCustomerUrl,
          registerCustomerUrl: verifyResult.registerCustomerUrl,
          requestOtpViaEmailUrl: verifyResult.requestOtpViaEmailUrl,
          getProductUrl: verifyResult.getProductUrl,
        }}
      />
    </PageLayout>
  );
}
