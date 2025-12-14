/**
 * API Route: /api/verify
 *
 * Proxies verification requests to the backend API while hiding the actual API URL.
 * Accepts encrypted data, decrypts it, calls backend, and returns proxied URLs.
 */

import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/encryption";

// ============================================================================
// Types
// ============================================================================

interface VerifyRequestBody {
  org: string;
  data: string;
  theme?: string;
}

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

// ============================================================================
// Helper Functions
// ============================================================================

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

// API Route Handler

export async function POST(request: NextRequest) {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📨 /api/verify - INCOMING REQUEST");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Parse request body
    const body: VerifyRequestBody = await request.json();
    console.log("Request body:", {
      org: body.org,
      theme: body.theme,
      dataLength: body.data?.length || 0,
    });

    // Validate request
    if (!body.org || !body.data) {
      return NextResponse.json(
        {
          status: "ERROR",
          descriptionThai: "ข้อมูลไม่ถูกต้อง: ต้องระบุ org และ data",
          descriptionEng: "Invalid request: org and data are required",
        },
        { status: 400 },
      );
    }

    // Get encryption credentials from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptionIV = process.env.ENCRYPTION_IV;

    if (!encryptionKey || !encryptionIV) {
      console.error("Missing encryption credentials in environment variables");
      return NextResponse.json(
        {
          status: "ERROR",
          descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
          descriptionEng: "Server configuration error",
        },
        { status: 500 },
      );
    }

    // Decrypt the data
    let decryptedData: string;
    try {
      // URL-decode the data parameter first
      const urlDecodedData = decodeURIComponent(body.data);
      decryptedData = decrypt(urlDecodedData, encryptionKey, encryptionIV);
      console.log("\n🔓 DECRYPTION SUCCESS");
      console.log("Decrypted data length:", decryptedData.length);
      console.log(
        "Decrypted data (first 200 chars):",
        decryptedData.substring(0, 200),
      );
      console.log("Decrypted data (full):\n", decryptedData);
    } catch (error) {
      console.error("Decryption failed:", error);
      return NextResponse.json(
        {
          status: "DECRYPT_FAIL",
          descriptionThai: "ไม่สามารถถอดรหัสข้อมูลได้",
          descriptionEng: "Failed to decrypt data",
        },
        { status: 400 },
      );
    }

    // Check if decrypted data is already a full backend response (JSON)
    // or if it's just serial|pin that needs to be sent to backend
    let backendData: BackendVerifyResponse;

    try {
      const parsed = JSON.parse(decryptedData);

      // Check if it looks like a full backend response (has Status/status field)
      if (
        parsed.Status ||
        parsed.status ||
        parsed.ScanItem ||
        parsed.scanItem
      ) {
        console.log("\n✅ Decrypted data is FULL BACKEND RESPONSE");
        console.log(JSON.stringify(parsed, null, 2));
        backendData = parsed;
      } else if (parsed.serial && parsed.pin) {
        // JSON contains serial and pin - need to call backend
        console.log("\n🔑 Decrypted data has SERIAL/PIN - calling backend");
        const serial = parsed.serial || parsed.Serial;
        const pin = parsed.pin || parsed.Pin;
        console.log("Serial:", serial);
        console.log("Pin:", pin);

        const apiBaseUrl = process.env.API_BASE_URL;
        if (!apiBaseUrl) {
          console.error("API_BASE_URL not configured");
          return NextResponse.json(
            {
              status: "ERROR",
              descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
              descriptionEng: "Server configuration error",
            },
            { status: 500 },
          );
        }

        const backendUrl = `${apiBaseUrl}/org/${body.org}/VerifyScanItem/${serial}/${pin}`;
        console.log("\n🌐 Calling backend API:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("\n❌ Backend API ERROR");
          console.error("Status:", backendResponse.status);
          console.error("Response:", errorText);

          return NextResponse.json(
            {
              status: "ERROR",
              descriptionThai: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
              descriptionEng: "Backend server error",
            },
            { status: backendResponse.status },
          );
        }

        backendData = await backendResponse.json();
        console.log("\n✅ BACKEND API RESPONSE:");
        console.log(JSON.stringify(backendData, null, 2));
        console.log("\n✅ BACKEND API RESPONSE:");
        console.log(JSON.stringify(backendData, null, 2));
      } else {
        throw new Error("Invalid JSON format: missing required fields");
      }
    } catch (jsonError) {
      // Not JSON, try pipe-separated format
      const parts = decryptedData.split("|");
      if (parts.length >= 2) {
        console.log("\n📋 Decrypted data is PIPE-SEPARATED format");
        const serial = parts[0];
        const pin = parts[1];
        console.log("Serial:", serial);
        console.log("Pin:", pin);

        const apiBaseUrl = process.env.API_BASE_URL;
        if (!apiBaseUrl) {
          console.error("API_BASE_URL not configured");
          return NextResponse.json(
            {
              status: "ERROR",
              descriptionThai: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง",
              descriptionEng: "Server configuration error",
            },
            { status: 500 },
          );
        }

        const backendUrl = `${apiBaseUrl}/org/${body.org}/VerifyScanItem/${serial}/${pin}`;
        console.log("\n🌐 Calling backend API:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("\n❌ Backend API ERROR");
          console.error("Status:", backendResponse.status);
          console.error("Response:", errorText);

          return NextResponse.json(
            {
              status: "ERROR",
              descriptionThai: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
              descriptionEng: "Backend server error",
            },
            { status: backendResponse.status },
          );
        }

        backendData = await backendResponse.json();
      } else {
        return NextResponse.json(
          {
            status: "PARAM_MISSING",
            descriptionThai: "ข้อมูลไม่ครบถ้วน: รูปแบบข้อมูลไม่ถูกต้อง",
            descriptionEng: "Invalid data format: expected JSON or serial|pin",
          },
          { status: 400 },
        );
      }
    }

    // Normalize PascalCase to camelCase (C# backend returns PascalCase)
    const normalizedData: BackendVerifyResponse = {
      status: backendData.status || (backendData as any).Status,
      descriptionThai:
        backendData.descriptionThai || (backendData as any).DescriptionThai,
      descriptionEng:
        backendData.descriptionEng || (backendData as any).DescriptionEng,
      scanItem: backendData.scanItem || (backendData as any).ScanItem,
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

    console.log("\n🔗 FINAL TRANSFORMED DATA:");
    console.log("Status:", transformedData.status);
    console.log(
      "ScanItem Serial:",
      (transformedData.scanItem as any)?.serial ||
        (transformedData.scanItem as any)?.Serial,
    );
    console.log(
      "ScanItem Pin:",
      (transformedData.scanItem as any)?.pin ||
        (transformedData.scanItem as any)?.Pin,
    );
    console.log("getCustomerUrl:", transformedData.getCustomerUrl);
    console.log("registerCustomerUrl:", transformedData.registerCustomerUrl);
    console.log(
      "requestOtpViaEmailUrl:",
      transformedData.requestOtpViaEmailUrl,
    );
    console.log("getProductUrl:", transformedData.getProductUrl);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Return proxied response
    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Verify API error:", error);

    return NextResponse.json(
      {
        status: "ERROR",
        descriptionThai: "เกิดข้อผิดพลาดในการตรวจสอบ",
        descriptionEng: `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}

// Allow GET method to return method not allowed
export async function GET() {
  return NextResponse.json(
    {
      status: "ERROR",
      descriptionThai: "ใช้ POST method เท่านั้น",
      descriptionEng: "Method not allowed. Use POST.",
    },
    { status: 405 },
  );
}
