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

// ✅ Helper Function: หาค่าจาก Object โดยไม่สนตัวพิมพ์เล็ก/ใหญ่ (Case Insensitive)
function findValue(obj: any, candidates: string[]): any {
  if (!obj) return null;
  const keys = Object.keys(obj);

  for (const candidate of candidates) {
    if (obj[candidate] !== undefined && obj[candidate] !== null)
      return obj[candidate];

    const foundKey = keys.find(
      (k) => k.toLowerCase() === candidate.toLowerCase()
    );
    if (foundKey && obj[foundKey]) return obj[foundKey];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log("\n🔥 --- VOUCHER PROXY DEBUG START ---");

    const body: VoucherRequestBody = await request.json();

    if (!body.org || !body.action) {
      return NextResponse.json(
        { Status: "ERROR", Description: "Invalid request" },
        { status: 400 }
      );
    }

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_BASE_URL ||
      "https://api-dev.please-scan.com";
    let backendUrl = "";

    // Construct URL
    switch (body.action) {
      case "VERIFY_PIN":
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${
          body.org
        }/action/VerifyVoucherByPin/${encodeURIComponent(
          body.voucherNo || ""
        )}/${encodeURIComponent(body.pin || "")}`;
        break;
      case "VERIFY_BARCODE":
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${
          body.org
        }/action/VerifyVoucherByBarcode/${encodeURIComponent(
          body.barcode || ""
        )}`;
        break;
      case "APPROVE":
        if (!body.voucherId || !body.pin)
          throw new Error("Missing parameters: voucherId or pin");
        backendUrl = `${apiBaseUrl}/api/Voucher/org/${
          body.org
        }/action/ApproveVoucherUsedById/${body.voucherId}/${encodeURIComponent(
          body.pin
        )}`;
        break;
    }

    console.log(`🌐 Fetching: ${backendUrl}`);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    console.log("📦 Raw Response from C#:", responseText);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          Status: "ERROR",
          Description: "Backend Error",
          DebugBody: responseText,
        },
        { status: backendResponse.status }
      );
    }

    let backendData: any = {};
    try {
      backendData = JSON.parse(responseText);
    } catch (e) {}

    // DATA EXTRACTION

    const flatData = {
      ...backendData,
      ...(backendData.Voucher || backendData.voucher || {}),
    };

    console.log("✨ Flattened Data:", JSON.stringify(flatData, null, 2));

    // 2. Normalize Status
    let statusRaw = findValue(flatData, ["Status", "status", "IsSuccess"]);
    let finalStatus = "ERROR";
    if (
      ["OK", "Ok", "ok", "Success", "success", "Active", "active"].includes(
        statusRaw
      ) ||
      statusRaw === true
    ) {
      finalStatus = "OK";
    }
    if (findValue(flatData, ["Id", "VoucherId"])) {
      finalStatus = "OK";
    }

    // 3. Map Data using Case-Insensitive Finder
    const normalizedData = {
      Status: finalStatus,
      Description:
        findValue(flatData, ["Description", "description", "ErrorMessage"]) ||
        "",

      // ID
      Id: findValue(flatData, [
        "Id",
        "id",
        "VoucherId",
        "voucherId",
        "voucher_id",
      ]),

      // Voucher Info
      VoucherNo: findValue(flatData, [
        "VoucherNo",
        "voucherNo",
        "voucher_no",
        "Serial",
      ]),
      Pin: findValue(flatData, ["Pin", "pin"]),
      Barcode: findValue(flatData, ["Barcode", "barcode"]),

      // Privilege Info
      PrivilegeName: findValue(flatData, [
        "PrivilegeName",
        "privilegeName",
        "CampaignName",
        "campaign_name",
      ]),
      PrivilegeCode: findValue(flatData, [
        "PrivilegeCode",
        "privilegeCode",
        "privilege_code",
      ]),

      StartDate: findValue(flatData, [
        "StartDate",
        "startDate",
        "start_date",
        "EffectiveDate",
        "effectiveDate",
      ]),
      ExpiryDate: findValue(flatData, [
        "ExpiryDate",
        "expiryDate",
        "expiry_date",
        "ExpireDate",
        "expireDate",
        "ValidUntil",
        "validUntil",
        "EndDate",
        "endDate",
      ]),
    };

    console.log(
      "✅ Final Response to Frontend:",
      JSON.stringify(normalizedData, null, 2)
    );
    console.log("🔥 --- DEBUG END --- \n");

    return NextResponse.json(normalizedData, { status: 200 });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { Status: "ERROR", Description: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ Status: "ERROR" }, { status: 405 });
}
