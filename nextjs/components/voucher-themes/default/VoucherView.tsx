"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Interface
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
  CampaignName?: string;
  PrivilegeCode?: string;
  privilegeCode?: string;
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

  // -- Translations --
  const t = {
    th: {
      title: "ตรวจสอบ Voucher",
      subtitle: "ตรวจสอบและอนุมัติการใช้งาน",
      useVoucher: "ใช้เลข Voucher",
      useBarcode: "ใช้ Barcode",
      voucherNoLabel: "หมายเลข Voucher",
      pinLabel: "หมายเลข Pin",
      barcodeLabel: "หมายเลข Barcode",
      voucherPlaceholder: "Ex. V-123456",
      pinPlaceholder: "XXXX",
      barcodePlaceholder: "Scan or type barcode...",
      checking: "Checking...",
      verify: "ตรวจสอบข้อมูล (Verify)",
      clear: "ล้างข้อมูล (Clear)",
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
      cancel: "Cancel",
      approve: "Approve",
      processing: "Processing...",
      successTitle: "ใช้งานสำเร็จ!",
      successMsg: "บันทึกการใช้งาน Voucher เรียบร้อยแล้ว",
      errorTitle: "ทำรายการไม่สำเร็จ",
      errorMsg: "ไม่สามารถบันทึกการใช้งานได้",
      tryAgain: "ลองใหม่อีกครั้ง",
      errorDefault: "ทำรายการไม่สำเร็จ",
    },
    en: {
      title: "Verify Voucher",
      subtitle: "Verify and approve voucher usage",
      useVoucher: "Use Voucher Number",
      useBarcode: "Use Barcode",
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
      errorDefault: "Transaction failed",
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
      console.log("Approve Response:", data);

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

  const primaryGradient = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
  const primaryShadow = "rgba(37, 99, 235, 0.3)";

  const displayVoucherNo =
    step === "VERIFIED"
      ? getDisplayVal(["VoucherNo", "voucherNo", "voucher_no"], voucherNo)
      : "";
  const displayPin =
    step === "VERIFIED" ? getDisplayVal(["Pin", "pin"], pin) : "";
  const displayBarcodeText = `${displayVoucherNo}-${displayPin}`;

  return (
    <div
      className="mx-auto p-4 md:p-6"
      style={{
        maxWidth: step === "VERIFIED" ? "700px" : "400px",
        animation: "fadeIn 0.8s ease-out forwards",
      }}
    >
      {/* HEADER */}
      {step !== "VERIFIED" && step !== "APPROVED" && step !== "ERROR" && (
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{text.title}</h1>
          <p className="text-sm text-gray-500">{text.subtitle}</p>
        </div>
      )}

      {/* STEP 1: INPUT */}
      {step === "INPUT" && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => {
                setMode("PIN");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === "PIN"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {text.useVoucher}
            </button>
            <button
              onClick={() => {
                setMode("BARCODE");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === "BARCODE"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {text.useBarcode}
            </button>
          </div>
          <div className="space-y-4">
            {mode === "PIN" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.voucherNoLabel}
                  </label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={text.voucherPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.pinLabel}
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={text.pinPlaceholder}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.barcodeLabel}
                </label>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && barcode) handleVerify();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={text.barcodePlaceholder}
                  autoFocus
                />
              </div>
            )}
          </div>
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-70"
            style={{
              background: primaryGradient,
              boxShadow: `0 4px 12px ${primaryShadow}`,
            }}
          >
            {isLoading ? text.checking : text.verify}
          </button>
          {mode === "BARCODE" && (
            <button
              onClick={handleClearBarcode}
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 text-gray-600 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
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
                        {verifiedData.Status || "Unknown"}
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
