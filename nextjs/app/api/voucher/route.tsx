/**
 * API Route: /api/voucher
 *
 * Proxies Voucher requests to the backend API.
 * Features:
 * - Reads domain from NEXT_PUBLIC_API_URL
 * - Calls ApproveVoucherUsedById for approval
 * - Normalizes Backend Status (Success -> OK)
 */

import { NextRequest, NextResponse } from "next/server";

// Types

type VoucherAction = "VERIFY_PIN" | "VERIFY_BARCODE" | "APPROVE";

interface VoucherRequestBody {
  action: VoucherAction;
  org: string;
  voucherNo?: string;
  pin?: string;
  barcode?: string;
  voucherId?: string;
}

// API Route Handler

export async function POST(request: NextRequest) {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎫 /api/voucher - INCOMING REQUEST");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 1. Parse request body
    const body: VoucherRequestBody = await request.json();
    console.log("Request Action:", body.action);
    console.log("Org:", body.org);

    // 2. Validate Request
    if (!body.org || !body.action) {
      return NextResponse.json(
        {
          Status: "ERROR",
          Description: "Invalid request: 'org' and 'action' are required",
        },
        { status: 400 }
      );
    }

    // 3. Configure Backend URL (Requirement: Read from NEXT_PUBLIC_API_URL)
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || 
      process.env.API_BASE_URL ||
      "https://api-dev.please-scan.com"; // Default for local dev

    if (!apiBaseUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured");
      return NextResponse.json(
        {
          Status: "ERROR",
          Description: "Server configuration error (Missing API URL)",
        },
        { status: 500 }
      );
    }

    let backendUrl = "";

    // 4. Construct Backend URL
    switch (body.action) {
      case "VERIFY_PIN":
        if (!body.voucherNo || !body.pin) throw new Error("Missing parameters: voucherNo, pin");
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${body.org}/action/VerifyVoucherByPin/${encodeURIComponent(body.voucherNo)}/${encodeURIComponent(body.pin)}`;
        break;

      case "VERIFY_BARCODE":
        if (!body.barcode) throw new Error("Missing parameters: barcode");
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${body.org}/action/VerifyVoucherByBarcode/${encodeURIComponent(body.barcode)}`;
        break;

      case "APPROVE":
        if (!body.voucherId || !body.pin) throw new Error("Missing parameters: voucherId, pin");
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${body.org}/action/ApproveVoucherUsedById/${body.voucherId}/${encodeURIComponent(body.pin)}`;
        break;

      default:
        return NextResponse.json({ Status: "ERROR", Description: "Invalid Action" }, { status: 400 });
    }

    console.log("\n🌐 CALLING BACKEND API");
    console.log("Target URL:", backendUrl);

    // 5. Call Backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // 6. Read Raw Response
    const responseText = await backendResponse.text();
    
    console.log("\n🔍 RAW RESPONSE BODY:");
    console.log(responseText ? responseText : "(Empty)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Handle HTTP Errors (Requirement: Check http status = 200)
    if (!backendResponse.ok) {
      console.error("❌ Backend Error Status:", backendResponse.status);
      return NextResponse.json(
        {
          Status: "ERROR",
          Description: `Backend Error: ${backendResponse.status}`,
          DebugBody: responseText
        },
        { status: backendResponse.status }
      );
    }

    // 7. Parse & Normalize JSON
    let backendData: any = {};
    try {
        if (responseText) {
            backendData = JSON.parse(responseText);
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return NextResponse.json(
            { Status: "ERROR", Description: "Invalid JSON from Backend", Raw: responseText },
            { status: 500 }
        );
    }

    // Normalization: Requirement -> Status ต้องเท่ากับ "OK"
    let finalStatus = backendData.Status || backendData.status || (backendData.IsSuccess ? "OK" : "ERROR");

    // Handle variated success messages
    if (finalStatus === 'Success' || finalStatus === 'success' || finalStatus === 'Active') {
        finalStatus = 'OK';
    }
    
    // Fallback: ถ้าไม่มี Status แต่มี ID กลับมา ถือว่า OK
    if (!finalStatus && (backendData.Id || backendData.id)) {
        finalStatus = 'OK';
    }

    const normalizedData = {
        ...backendData,
        // Override Status ให้เป็นค่าที่เรา Normalize แล้ว
        Status: finalStatus || "ERROR",
        Description: backendData.Description || backendData.description || backendData.ErrorMessage || "",
        
        Id: backendData.Id || backendData.id,
        VoucherNo: backendData.VoucherNo || backendData.voucherNo,
        Pin: backendData.Pin || backendData.pin,
        PrivilegeName: backendData.PrivilegeName || backendData.privilegeName,
        ExpiryDate: backendData.ExpiryDate || backendData.expiryDate,
    };

    console.log("✅ NORMALIZED JSON (Sent to Client):");
    console.log(JSON.stringify(normalizedData, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return NextResponse.json(normalizedData, { status: 200 });

  } catch (error: any) {
    console.error("Voucher Proxy Error:", error);
    return NextResponse.json(
      {
        Status: "ERROR",
        Description: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { Status: "ERROR", Description: "Method not allowed. Use POST." },
    { status: 405 }
  );
}