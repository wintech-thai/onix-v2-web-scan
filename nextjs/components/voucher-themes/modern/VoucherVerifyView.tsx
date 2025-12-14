"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface VoucherApiResponse {
  Status: string;
  Description?: string;
  Id?: string;
  id?: string;
  VoucherNo?: string;
  voucherNo?: string;
  Pin?: string;
  pin?: string;

  // Privilege Info
  PrivilegeName?: string;
  privilegeName?: string;
  privilege_name?: string;
  CampaignName?: string;
  PrivilegeCode?: string;
  privilegeCode?: string;
  privilege_code?: string;

  // Dates (Start)
  StartDate?: string;
  startDate?: string;
  start_date?: string;
  EffectiveDate?: string;

  // Dates (End)
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

// API Base URL
const API_BASE_URL = "/api/voucher";

export default function VoucherVerifyView() {
  const searchParams = useSearchParams();

  // -- Query Params --
  const org = searchParams.get("org") || "";
  const dataParam = searchParams.get("data");
  const lang = (searchParams.get("lang") || "th") as "th" | "en";

  // -- Translations --
  const t = {
    th: {
      title: "ตรวจสอบ Voucher",
      subtitle: "ตรวจสอบและอนุมัติการใช้งาน",
      useVoucher: "เลข Voucher",
      useBarcode: "บาร์โค้ด",
      voucherNoLabel: "หมายเลข Voucher",
      pinLabel: "หมายเลข Pin",
      barcodeLabel: "หมายเลข Barcode",
      voucherPlaceholder: "เช่น V-123456",
      pinPlaceholder: "XXXX",
      barcodePlaceholder: "สแกนหรือพิมพ์รหัส...",
      checking: "กำลังตรวจสอบ...",
      verify: "ตรวจสอบข้อมูล",
      clear: "ล้างข้อมูล",
      errorVoucherPin: "กรุณากรอก Voucher No. และ PIN",
      errorBarcode: "กรุณากรอก Barcode",
      errorNotFound: "ไม่พบข้อมูล Voucher หรือข้อมูลไม่ถูกต้อง",
      errorConnection: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      voucherNo: "Voucher No:",
      pin: "PIN:",
      startDate: "Start Date:",
      endDate: "End Date:",
      status: "Status:",
      barcode: "Barcode",
      privilege: "Privilege:",
      cancel: "ยกเลิก",
      approve: "อนุมัติ (Approve)",
      processing: "กำลังประมวลผล...",
      successTitle: "ใช้งานสำเร็จ!",
      successMsg: "บันทึกการใช้งาน Voucher เรียบร้อยแล้ว",
      errorTitle: "ทำรายการไม่สำเร็จ",
      errorMsg: "ไม่สามารถบันทึกการใช้งานได้",
      tryAgain: "ลองใหม่อีกครั้ง",
      errorDefault: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    },
    en: {
      title: "Verify Voucher",
      subtitle: "Verify and approve voucher usage",
      useVoucher: "Voucher No.",
      useBarcode: "Barcode",
      voucherNoLabel: "Voucher Number",
      pinLabel: "PIN Number",
      barcodeLabel: "Barcode Number",
      voucherPlaceholder: "Ex. V-123456",
      pinPlaceholder: "XXXX",
      barcodePlaceholder: "Scan or type barcode...",
      checking: "Checking...",
      verify: "Verify",
      clear: "Clear",
      errorVoucherPin: "Please enter Voucher No. and PIN",
      errorBarcode: "Please enter Barcode",
      errorNotFound: "Voucher not found or invalid data",
      errorConnection: "Connection error occurred",
      voucherNo: "Voucher No:",
      pin: "PIN:",
      startDate: "Start Date:",
      endDate: "End Date:",
      status: "Status:",
      barcode: "Barcode",
      privilege: "Privilege:",
      cancel: "Cancel",
      approve: "Approve",
      processing: "Processing...",
      successTitle: "Success!",
      successMsg: "Voucher usage recorded successfully",
      errorTitle: "Transaction Failed",
      errorMsg: "Unable to record usage",
      tryAgain: "Try Again",
      errorDefault: "An unknown error occurred",
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
        if (barcodeVal) setBarcode(barcodeVal);
        if (voucherVal) setVoucherNo(voucherVal);
        if (pinVal) setPin(pinVal);
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
        colors: ["#26cc2b", "#2563eb", "#facc15"],
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

      // Check for success or active status
      if (apiData.Status === "OK" || apiData.Status === "Active") {
        const mergedData = { ...initialData, ...apiData };
        setVerifiedData(mergedData);
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
    const vId = getDisplayVal(["Id", "id", "voucherId", "voucher_id"], "");
    const vPin = getDisplayVal(["Pin", "pin"], pin);
    if (!vId) console.warn("Warning: Missing Voucher ID");

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

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.Description || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Update state with latest data from API
      if (data) {
        setVerifiedData((prev) => ({ ...prev, ...initialData, ...data }));
      }

      const statusUpper = (data.Status || "").toUpperCase();

      if (
        statusUpper === "OK" ||
        statusUpper === "SUCCESS" ||
        statusUpper === "ACTIVE"
      ) {
        triggerConfetti();
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
  };

  const handleTryAgain = () => {
    setStep("VERIFIED");
    setApproveError("");
  };

  const handleClearBarcode = () => {
    setBarcode("");
    setErrorMsg(null);
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  // Modern Styles
  const primaryGradient = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
  const primaryShadow = "rgba(37, 99, 235, 0.4)";

  const displayVoucherNo =
    step === "VERIFIED"
      ? getDisplayVal(["VoucherNo", "voucherNo", "voucher_no"], voucherNo)
      : "";
  const displayPin =
    step === "VERIFIED" ? getDisplayVal(["Pin", "pin"], pin) : "";
  const displayBarcodeText = `${displayVoucherNo}-${displayPin}`;

  return (
    <div
      className="mx-auto p-4 md:p-6 font-sans text-gray-800"
      style={{
        maxWidth: step === "VERIFIED" ? "700px" : "420px",
        animation: "fadeIn 0.6s ease-out forwards",
      }}
    >
      {/* HEADER */}
      {step !== "VERIFIED" && step !== "APPROVED" && step !== "ERROR" && (
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {text.title}
          </h1>
          <p className="text-sm font-medium text-gray-500">{text.subtitle}</p>
        </div>
      )}

      {/* STEP 1: INPUT (Modern Design) */}
      {step === "INPUT" && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Tabs - Modern Segmented Control */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
            <button
              onClick={() => {
                setMode("PIN");
                setErrorMsg(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ease-out ${
                mode === "PIN"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              {text.useVoucher}
            </button>
            <button
              onClick={() => {
                setMode("BARCODE");
                setErrorMsg(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ease-out ${
                mode === "BARCODE"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              {text.useBarcode}
            </button>
          </div>

          <div className="space-y-6">
            {mode === "PIN" ? (
              <>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    {text.voucherNoLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                      placeholder={text.voucherPlaceholder}
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    {text.pinLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                      placeholder={text.pinPlaceholder}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  {text.barcodeLabel}
                </label>
                <div className="relative">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && barcode) handleVerify();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                    placeholder={text.barcodePlaceholder}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center animate-pulse">
              <svg
                className="w-5 h-5 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full mt-8 h-12 text-white font-bold text-lg rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-blue-500/20"
            style={{
              background: primaryGradient,
              boxShadow: `0 10px 20px -10px ${primaryShadow}`,
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              text.verify
            )}
          </button>

          {mode === "BARCODE" && (
            <button
              onClick={handleClearBarcode}
              disabled={isLoading}
              className="w-full mt-4 h-12 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              {text.clear}
            </button>
          )}
        </div>
      )}

      {/* STEP 2: VERIFIED (PREVIEW) */}
      {step === "VERIFIED" && verifiedData && (
        <div className="animate-fade-in-up">
          <div className="bg-[#f3f5f9] rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#eff6ff] p-5 text-center border-b border-blue-100">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">
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
              <p className="text-sm text-gray-500 mt-2">
                {text.privilege}{" "}
                {getDisplayVal(
                  ["PrivilegeCode", "privilegeCode", "Id", "id"],
                  "-"
                )}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                  <div className="flex-[1.5] space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          {text.voucherNo}
                        </p>
                        <p className="text-lg font-bold text-gray-800 font-mono tracking-tight break-all">
                          {displayVoucherNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{text.pin}</p>
                        <p className="text-lg font-bold text-gray-800 font-mono tracking-tight break-all">
                          {displayPin}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          {text.startDate}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          {getDisplayVal(
                            [
                              "StartDate",
                              "startDate",
                              "start_date",
                              "EffectiveDate",
                            ],
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          {text.endDate}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          {getDisplayVal(
                            [
                              "ExpiryDate",
                              "expiryDate",
                              "expiry_date",
                              "ExpireDate",
                              "expire_date",
                              "end_date",
                              "EndDate",
                              "ValidUntil",
                              "ValidTo",
                            ],
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 mr-2">
                        {text.status}
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded border uppercase ${
                          ["Active", "OK", "ok", "active"].includes(
                            verifiedData.Status
                          )
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {verifiedData.Status === "OK"
                          ? "Active"
                          : verifiedData.Status || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block w-px bg-gray-100"></div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-400 mb-4">{text.barcode}</p>
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
                    <p className="text-sm text-gray-600 mt-3 font-mono tracking-widest text-center">
                      {displayBarcodeText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setStep("INPUT")}
                className="flex-1 py-3 px-4 border border-red-500 text-red-500 text-lg font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                {text.cancel}
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-[#ee0000] text-white text-lg font-medium rounded-lg shadow hover:bg-red-700 transition-all disabled:opacity-70"
              >
                {isLoading ? text.processing : text.approve}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 3: SUCCESS (Green) --- */}
      {step === "APPROVED" && (
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center">
            <div className="mb-6 inline-flex p-5 rounded-full bg-green-50 text-green-500 shadow-sm ring-8 ring-green-50/50">
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
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
              {text.successTitle}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              {text.successMsg}
            </p>
          </div>
        </div>
      )}

      {/* --- STEP 4: ERROR (Red) --- */}
      {step === "ERROR" && (
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center">
            <div className="mb-6 inline-flex p-5 rounded-full bg-red-50 text-red-500 shadow-sm ring-8 ring-red-50/50">
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
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
              {text.errorTitle}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8">
              {approveError}
            </p>
            <button
              onClick={handleTryAgain}
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95"
            >
              {text.tryAgain}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}