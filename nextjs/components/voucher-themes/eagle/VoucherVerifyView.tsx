"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Vortex } from "@/components/ui/shadcn-io/vortex";

// --- Icons (ปรับสีให้เข้ากับธีมใหม่) ---
const IconVoucher = ({ active }: { active?: boolean }) => (
  <svg
    className={`w-5 h-5 transition-colors duration-300 ${
      active
        ? "text-[#00FFC2] drop-shadow-[0_0_8px_rgba(0,255,194,0.5)]"
        : "text-gray-400"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);
const IconPin = ({ active }: { active?: boolean }) => (
  <svg
    className={`w-5 h-5 transition-colors duration-300 ${
      active
        ? "text-[#00FFC2] drop-shadow-[0_0_8px_rgba(0,255,194,0.5)]"
        : "text-gray-400"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
const IconBarcode = ({ active }: { active?: boolean }) => (
  <svg
    className={`w-5 h-5 transition-colors duration-300 ${
      active
        ? "text-[#00FFC2] drop-shadow-[0_0_8px_rgba(0,255,194,0.5)]"
        : "text-gray-400"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
    />
  </svg>
);

interface VoucherApiResponse {
  Status: string;
  Description?: string;
  Id?: string;
  id?: string;
  VoucherNo?: string;
  voucherNo?: string;
  Pin?: string;
  pin?: string;
  PrivilegeName?: string;
  privilegeName?: string;
  privilege_name?: string;
  CampaignName?: string;
  PrivilegeCode?: string;
  privilegeCode?: string;
  privilege_code?: string;
  StartDate?: string;
  startDate?: string;
  start_date?: string;
  EffectiveDate?: string;
  ExpiryDate?: string;
  expiryDate?: string;
  expiry_date?: string;
  ExpireDate?: string;
  expire_date?: string;
  end_date?: string;
  EndDate?: string;
  ValidUntil?: string;
  valid_until?: string;
  ValidTo?: string;
  [key: string]: any;
}

const API_BASE_URL = "/api/voucher";

export default function VoucherVerifyView() {
  const searchParams = useSearchParams();

  const org = searchParams.get("org") || "";
  const dataParam = searchParams.get("data");
  const lang = (searchParams.get("lang") || "th") as "th" | "en";

  const t = {
    th: {
      title: "ตรวจสอบ Voucher",
      subtitle: "ระบบตรวจสอบและอนุมัติสิทธิ์",
      useVoucher: "เลข Voucher",
      useBarcode: "บาร์โค้ด",
      voucherNoLabel: "หมายเลข Voucher",
      pinLabel: "รหัส PIN",
      barcodeLabel: "รหัสบาร์โค้ด",
      voucherPlaceholder: "ระบุ V-XXXXXX",
      pinPlaceholder: "XXXX",
      barcodePlaceholder: "สแกนหรือพิมพ์รหัส...",
      checking: "กำลังตรวจสอบ...",
      verify: "ตรวจสอบข้อมูล",
      clear: "ล้างข้อมูล",
      errorVoucherPin: "กรุณาระบุ Voucher No. และ PIN",
      errorBarcode: "กรุณาระบุ Barcode",
      errorNotFound: "ไม่พบข้อมูล Voucher หรือข้อมูลไม่ถูกต้อง",
      errorConnection: "การเชื่อมต่อขัดข้อง",
      voucherNo: "Voucher No:",
      pin: "PIN:",
      startDate: "Start Date:",
      endDate: "End Date:",
      status: "Status:",
      barcode: "Barcode",
      privilege: "Privilege:",
      qrCode: "QR Code",
      cancel: "ยกเลิก",
      approve: "อนุมัติสิทธิ์",
      processing: "กำลังบันทึก...",
      successTitle: "ดำเนินการสำเร็จ",
      successMsg: "บันทึกการใช้งาน Voucher เรียบร้อยแล้ว",
      errorTitle: "ทำรายการไม่สำเร็จ",
      errorMsg: "ไม่สามารถบันทึกการใช้งานได้",
      tryAgain: "ลองใหม่อีกครั้ง",
      errorDefault: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      backToHome: "กลับไปหน้าแรก",
    },
    en: {
      title: "Verify Voucher",
      subtitle: "Verification & Approval System",
      useVoucher: "Voucher No.",
      useBarcode: "Barcode",
      voucherNoLabel: "Voucher Number",
      pinLabel: "PIN Code",
      barcodeLabel: "Barcode Number",
      voucherPlaceholder: "Enter V-XXXXXX",
      pinPlaceholder: "XXXX",
      barcodePlaceholder: "Scan or type code...",
      checking: "Verifying...",
      verify: "Verify Now",
      clear: "Clear Data",
      errorVoucherPin: "Please enter Voucher No. and PIN",
      errorBarcode: "Please enter Barcode",
      errorNotFound: "Voucher not found or invalid data",
      errorConnection: "Connection error",
      voucherNo: "Voucher No:",
      pin: "PIN:",
      startDate: "Start Date:",
      endDate: "End Date:",
      status: "Status:",
      barcode: "Barcode",
      privilege: "Privilege:",
      qrCode: "QR Code",
      cancel: "Cancel",
      approve: "Approve",
      processing: "Processing...",
      successTitle: "Success",
      successMsg: "Voucher usage recorded successfully",
      errorTitle: "Transaction Failed",
      errorMsg: "Unable to record usage",
      tryAgain: "Try Again",
      errorDefault: "An unknown error occurred",
      backToHome: "Back to Home",
    },
  };

  const text = t[lang];

  // -- State --
  const [step, setStep] = useState<"INPUT" | "VERIFIED" | "APPROVED" | "ERROR">(
    "INPUT"
  );
  const [mode, setMode] = useState<"PIN" | "BARCODE">("PIN");
  const [voucherNo, setVoucherNo] = useState("");
  const [pin, setPin] = useState("");
  const [barcode, setBarcode] = useState("");
  const [initialData, setInitialData] = useState<any>({});
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [verifiedData, setVerifiedData] = useState<VoucherApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string>("");

  // UI Focus State
  const [activeField, setActiveField] = useState<string | null>(null);

  const getDisplayVal = (apiKeys: string[], fallbackState: string = "") => {
    if (!verifiedData) return fallbackState || "-";
    for (const key of apiKeys) {
      if (
        verifiedData[key] !== undefined &&
        verifiedData[key] !== null &&
        verifiedData[key] !== ""
      ) {
        return verifiedData[key];
      }
    }
    return fallbackState || "-";
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    if (dataParam) {
      try {
        const decoded = atob(dataParam);
        const json = JSON.parse(decoded);
        setInitialData(json);
        const barcodeVal = json.Barcode || json.barcode || json.BARCODE;
        const voucherVal =
          json.VoucherNo ||
          json.voucherNo ||
          json.VOUCHERNO ||
          json.Serial ||
          json.serial;
        const pinVal = json.Pin || json.pin || json.PIN;

        // Force Uppercase for initial data
        if (barcodeVal) setBarcode(String(barcodeVal).toUpperCase());
        if (voucherVal) setVoucherNo(String(voucherVal).toUpperCase());
        if (pinVal) setPin(String(pinVal).toUpperCase());

        if (voucherVal) setMode("PIN");
        else if (barcodeVal) setMode("BARCODE");
      } catch (e) {
        console.error("Failed to parse data param", e);
      }
    }
  }, [dataParam]);

  const triggerConfetti = () => {
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#004C54", "#14b8a6", "#fbbf24"],
      });
    });
  };

  const handleVerify = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const payload: any = {
        org: org,
        action: mode === "PIN" ? "VERIFY_PIN" : "VERIFY_BARCODE",
      };
      if (mode === "PIN") {
        if (!voucherNo || !pin) throw new Error(text.errorVoucherPin);
        payload.voucherNo = voucherNo;
        payload.pin = pin;
      } else {
        if (!barcode) throw new Error(text.errorBarcode);
        payload.barcode = barcode;
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.Description || `HTTP Error: ${response.status}`);
      }

      const apiData: VoucherApiResponse = await response.json();

      if (
        apiData.Id ||
        apiData.id ||
        apiData.VoucherNo ||
        apiData.voucherNo ||
        apiData.Status === "OK" ||
        apiData.Status === "Active" ||
        apiData.Status === "Redeemed"
      ) {
        setVerifiedData({ ...initialData, ...apiData });
        setStep("VERIFIED");
      } else {
        setErrorMsg(apiData.Description || text.errorNotFound);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || text.errorConnection);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!verifiedData) return;
    const vId = getDisplayVal(["Id", "id", "VoucherId", "voucherId"], "");
    const vPin = getDisplayVal(["Pin", "pin"], pin);

    if (!vId || vId === "-" || vId === "") {
      setApproveError(
        "เกิดข้อผิดพลาดของระบบ: ไม่พบข้อมูล Voucher ID (Missing ID)"
      );
      setStep("ERROR");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        action: "APPROVE",
        org: org,
        voucherId: vId,
        pin: vPin,
      };
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      const desc = (data.Description || "").toLowerCase();
      if (desc.includes("already used")) {
        setVerifiedData((prev) => ({
          ...prev,
          Status: "Redeemed",
        }));

        setApproveError(data.Description);
        setStep("ERROR");

        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setApproveError(data.Description || `HTTP Error: ${response.status}`);
        setStep("ERROR");
        return;
      }

      const statusUpper = (data.Status || "").toUpperCase();
      if (
        statusUpper === "OK" ||
        statusUpper === "SUCCESS" ||
        statusUpper === "ACTIVE"
      ) {
        triggerConfetti();

        setVerifiedData((prev) => ({
          ...prev,
          ...initialData,
          ...data,
          Status: "Redeemed",
        }));

        setStep("APPROVED");
      } else {
        setApproveError(data.Description || data.Status || text.errorDefault);
        setStep("ERROR");
      }
    } catch (err: any) {
      setApproveError(err.message || text.errorConnection);
      setStep("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("INPUT");
    setVerifiedData(null);
    setInitialData({});
    setVoucherNo("");
    setPin("");
    setBarcode("");
    setErrorMsg(null);
    setApproveError("");
    setActiveField(null);
  };

  const handleClear = () => {
    setVoucherNo("");
    setPin("");
    setBarcode("");
    setErrorMsg(null);
    setActiveField(null);
    if (mode === "BARCODE" && barcodeInputRef.current)
      barcodeInputRef.current.focus();
  };

  const handleTryAgain = () => {
    setApproveError("");
    if (
      !verifiedData ||
      !verifiedData.VoucherNo ||
      verifiedData.Status === "ERROR"
    ) {
      handleVerify();
    } else {
      setStep("VERIFIED");
    }
  };

  const eaglePrimary = "#004C54";
  const eagleGradient = "linear-gradient(135deg, #004C54 0%, #046A74 100%)";

  const getContainerClass = () => {
    if (step === "INPUT") return "w-full max-w-sm md:max-w-4xl";
    return "w-full max-w-sm md:max-w-3xl";
  };

  const displayVoucherNo =
    step === "VERIFIED"
      ? getDisplayVal(["VoucherNo", "voucherNo", "voucher_no"], voucherNo)
      : "";
  const displayPin =
    step === "VERIFIED" ? getDisplayVal(["Pin", "pin"], pin) : "";
  const displayBarcodeText = `${displayVoucherNo}-${displayPin}`;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* 1. เปลี่ยน BackgroundColor เป็นสีดำสนิท เพื่อให้ Vortex เรืองแสง */}
      {/* 2. ปรับ Hue เป็น 160 (เขียว Cyan) เพื่อให้เข้ากับธีม Eagle */}
      <Vortex
        backgroundColor="#000000"
        particleCount={500}
        baseHue={160} // สีเขียว Teal/Cyan เรืองแสง
        rangeHue={30}
        baseSpeed={0.5}
        rangeSpeed={1.0}
        baseRadius={1}
        rangeRadius={2}
        className="flex items-center justify-center w-full h-full"
      />

      {/* 3. Content Section */}
      <div
        className={`relative z-10 transition-all duration-700 ease-out ${getContainerClass()}`}
        style={{
          animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {step !== "VERIFIED" && step !== "APPROVED" && step !== "ERROR" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 uppercase text-white drop-shadow-2xl">
              {text.title}
            </h1>
            <p className="text-gray-300 font-bold tracking-wide text-xs md:text-sm uppercase bg-white/10 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">
              {text.subtitle}
            </p>
          </div>
        )}

        {/* STEP 1: INPUT - ใช้การ์ดขาวเพื่อให้เด้ง (Pop) ออกมาจากพื้นหลังมืด */}
        {step === "INPUT" && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,255,194,0.15)] border border-white/80 p-6 md:p-10 relative overflow-hidden ring-4 ring-white/10">
            {/* เส้นแสงด้านบน */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#004C54] via-[#00FFC2] to-[#004C54]" />

            {/* Sliding Tab */}
            <div className="bg-gray-100 p-1.5 rounded-xl mb-8 max-w-sm mx-auto border border-gray-200 shadow-inner flex relative">
              <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-md transition-all duration-300 ease-out ${
                  mode === "BARCODE" ? "translate-x-full left-1.5" : "left-1.5"
                }`}
              />
              <button
                onClick={() => {
                  setMode("PIN");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider rounded-lg relative z-10 transition-colors duration-300 ${
                  mode === "PIN"
                    ? "text-[#004C54]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {text.useVoucher}
              </button>
              <button
                onClick={() => {
                  setMode("BARCODE");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider rounded-lg relative z-10 transition-colors duration-300 ${
                  mode === "BARCODE"
                    ? "text-[#004C54]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {text.useBarcode}
              </button>
            </div>

            <div className="space-y-5">
              {/* INPUT FIELDS (ใช้สีเข้มเพื่อให้ตัดกับการ์ดขาว) */}
              {mode === "PIN" ? (
                <div className="flex flex-col md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">
                  <div className="group relative">
                    <label
                      className={`block text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${
                        activeField === "voucher"
                          ? "text-[#004C54]"
                          : "text-gray-500"
                      }`}
                    >
                      {text.voucherNoLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IconVoucher active={activeField === "voucher"} />
                      </div>
                      <input
                        type="text"
                        maxLength={20}
                        value={voucherNo}
                        onFocus={() => setActiveField("voucher")}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) =>
                          setVoucherNo(e.target.value.toUpperCase())
                        }
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-100 text-gray-900 font-black rounded-2xl focus:bg-white focus:border-[#004C54] focus:ring-4 focus:ring-[#004C54]/10 outline-none transition-all duration-300 placeholder:text-gray-300 placeholder:font-bold text-lg md:text-xl uppercase tracking-tighter"
                        placeholder={text.voucherPlaceholder}
                      />
                    </div>
                  </div>
                  <div className="group relative">
                    <label
                      className={`block text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${
                        activeField === "pin"
                          ? "text-[#004C54]"
                          : "text-gray-500"
                      }`}
                    >
                      {text.pinLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IconPin active={activeField === "pin"} />
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={pin}
                        onFocus={() => setActiveField("pin")}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-100 text-gray-900 font-black rounded-2xl focus:bg-white focus:border-[#004C54] focus:ring-4 focus:ring-[#004C54]/10 outline-none transition-all duration-300 placeholder:text-gray-300 placeholder:font-bold text-lg md:text-xl uppercase tracking-tighter"
                        placeholder={text.pinPlaceholder}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <label
                    className={`block text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${
                      activeField === "barcode"
                        ? "text-[#004C54]"
                        : "text-gray-500"
                    }`}
                  >
                    {text.barcodeLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IconBarcode active={activeField === "barcode"} />
                    </div>
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      maxLength={20}
                      value={barcode}
                      onFocus={() => setActiveField("barcode")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && barcode) handleVerify();
                      }}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-100 text-gray-900 font-black rounded-2xl focus:bg-white focus:border-[#004C54] focus:ring-4 focus:ring-[#004C54]/10 outline-none transition-all duration-300 placeholder:text-gray-300 placeholder:font-bold text-lg md:text-xl uppercase tracking-tighter"
                      placeholder={text.barcodePlaceholder}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center animate-pulse shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0 text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                {errorMsg}
              </div>
            )}

            <div className="max-w-sm mx-auto mt-8 flex flex-col gap-4">
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="group w-full h-14 relative text-white font-black text-lg md:text-xl rounded-2xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#00FFC2]/30 hover:-translate-y-1 overflow-hidden tracking-widest uppercase"
              >
                {/* ปุ่ม Gradient สี Eagle Green */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#004C54] to-[#046A74]" />
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-6 w-6 text-white/80"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {text.checking}
                    </span>
                  ) : (
                    <>{text.verify}</>
                  )}
                </div>
              </button>

              <button
                onClick={handleClear}
                disabled={isLoading}
                className="w-full h-12 text-gray-400 font-bold text-sm md:text-base rounded-xl hover:text-[#004C54] hover:bg-gray-50 transition-colors uppercase tracking-widest"
              >
                {text.clear}
              </button>
            </div>
          </div>
        )}

        {/* ... (Step 2, 3, 4 โค้ดเดิมได้เลย การ์ดขาวบนพื้นดำจะเด่นขึ้นเองครับ) ... */}
        {step === "VERIFIED" && verifiedData && (
          <div className="animate-fade-in-up">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 ring-4 ring-white/10">
              {/* ... (เนื้อหาใน Step 2 เหมือนเดิม) ... */}
              <div className="p-6 text-center bg-gray-50 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                  {getDisplayVal(
                    [
                      "PrivilegeName",
                      "privilegeName",
                      "CampaignName",
                      "campaign_name",
                    ],
                    "Gift Voucher"
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  {text.privilege}{" "}
                  {getDisplayVal(
                    ["PrivilegeCode", "privilegeCode", "Id", "id"],
                    "-"
                  )}
                </p>
              </div>

              <div className="p-6 bg-white">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-[1.5] space-y-6 w-full">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {text.voucherNo}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 break-all font-mono tracking-tight uppercase">
                          {displayVoucherNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{text.pin}</p>
                        <p className="text-2xl font-bold text-gray-900 break-all font-mono tracking-tight uppercase">
                          {displayPin}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {text.startDate}
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatDate(
                            getDisplayVal(
                              [
                                "StartDate",
                                "startDate",
                                "start_date",
                                "EffectiveDate",
                              ],
                              "-"
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {text.endDate}
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatDate(
                            getDisplayVal(
                              [
                                "ExpiryDate",
                                "expiryDate",
                                "end_date",
                                "EndDate",
                                "ValidUntil",
                              ],
                              "-"
                            )
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 mr-3">
                        {text.status}
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          ["Active", "OK", "ok", "active"].includes(
                            verifiedData.Status
                          )
                            ? "bg-green-100 text-green-800"
                            : verifiedData.Status === "Redeemed" ||
                              verifiedData.Status === "Used"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {verifiedData.Status === "OK"
                          ? "Active"
                          : verifiedData.Status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block w-px bg-gray-100 self-stretch"></div>

                  <div className="flex-1 flex flex-col items-center justify-start space-y-6 w-full">
                    <div className="w-full flex flex-col items-center">
                      <p className="text-sm text-gray-500 mb-2">
                        {text.barcode}
                      </p>
                      <div className="w-full bg-white border-2 border-gray-100 rounded-lg p-4 flex flex-col items-center">
                        <div className="w-full h-16 overflow-hidden flex items-end justify-center">
                          <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 240 60"
                            preserveAspectRatio="none"
                          >
                            {Array.from({ length: 45 }, (_, i) => (
                              <rect
                                key={i}
                                x={i * 5.5}
                                y="0"
                                width={Math.random() > 0.5 ? 3 : 1.5}
                                height="60"
                                fill="#1f2937"
                              />
                            ))}
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 font-mono tracking-widest text-center uppercase">
                          {displayBarcodeText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => setStep("INPUT")}
                  className="flex-1 py-3 px-4 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {text.cancel}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={
                    isLoading ||
                    verifiedData.Status === "Redeemed" ||
                    verifiedData.Status === "Used"
                  }
                  className="flex-1 py-3 px-4 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  style={{ background: eaglePrimary }}
                >
                  {isLoading ? text.processing : text.approve}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "APPROVED" && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="mb-6 inline-flex p-5 rounded-full bg-[#E0F2F1] text-[#004C54]">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {text.successTitle}
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8">
                {text.successMsg}
              </p>
              <button
                onClick={handleReset}
                className="w-64 h-12 text-white font-medium text-lg rounded-lg transition-all transform active:scale-[0.98] hover:shadow-lg"
                style={{
                  background: eaglePrimary,
                  boxShadow: `0 4px 15px rgba(0, 76, 84, 0.4)`,
                }}
              >
                {text.backToHome}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ERROR */}
        {step === "ERROR" && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="mb-6 inline-flex p-5 rounded-full bg-red-50 text-red-600">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {text.errorTitle}
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8">
                {approveError}
              </p>
              <div className="w-64 space-y-4">
                <button
                  onClick={handleTryAgain}
                  className="w-full px-8 py-3 bg-red-600 text-white font-bold uppercase rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95"
                >
                  {text.tryAgain}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-8 py-3 text-gray-500 font-medium uppercase rounded-lg hover:bg-gray-50 transition-all"
                >
                  {text.backToHome}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
