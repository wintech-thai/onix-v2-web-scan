"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Particles from "@/components/Particles"; // ถ้าไม่ได้ใช้เอาออกได้ครับ

// --- Icons (SVG Components) ---
const IconVoucher = () => (
  <svg
    className="w-5 h-5"
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
const IconPin = () => (
  <svg
    className="w-5 h-5"
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
const IconBarcode = () => (
  <svg
    className="w-5 h-5"
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
      useVoucher: "ใช้เลข Voucher",
      useBarcode: "ใช้ Barcode",
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

      // Check status from Verify API (handles Active, Redeemed, etc.)
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

      //ดักจับกรณี "already used"
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
  };

  const handleClear = () => {
    setVoucherNo("");
    setPin("");
    setBarcode("");
    setErrorMsg(null);
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
  const eagleShadow = "rgba(0, 76, 84, 0.4)";

  const getContainerClass = () => {
    if (step === "INPUT") return "w-full max-w-sm md:max-w-5xl";
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
    <div className=" relative w-full flex-1 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-gray-900 to-black">
      <div
        className={`transition-all duration-500 ease-out z-10 ${getContainerClass()}`}
        style={{
          animation: "slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        }}
      >
        {step !== "VERIFIED" && step !== "APPROVED" && step !== "ERROR" && (
          <div className="text-center mb-6">
            <h1
              className="text-3xl md:text-4xl font-black tracking-tighter mb-2 uppercase"
              style={{ color: "white" }}
            >
              {text.title}
            </h1>
            <p className="text-gray-300 font-medium tracking-wide text-sm">
              {text.subtitle}
            </p>
          </div>
        )}
        {/* STEP 1: INPUT */}
        {step === "INPUT" && (
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-4 overflow-hidden">
            {/* Decorative gradient orbs - ปรับสีให้เข้ากับธีมฟ้า/เขียวเข้ม */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-sky-500/20 to-teal-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-teal-600/20 to-sky-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl mb-8 max-w-md mx-auto border border-gray-700">
                <button
                  onClick={() => {
                    setMode("PIN");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wide rounded-xl transition-all duration-300 ${
                    mode === "PIN"
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {text.useVoucher}
                </button>
                <button
                  onClick={() => {
                    setMode("BARCODE");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wide rounded-xl transition-all duration-300 ${
                    mode === "BARCODE"
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-500" // <-- CHANGED: Blue solid
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {text.useBarcode}
                </button>
              </div>

              <div className="space-y-6">
                {mode === "PIN" ? (
                  <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
                    <div className="group">
                      <label className="block text-sm text-gray-400 font-semibold mb-2.5 uppercase tracking-wide">
                        {text.voucherNoLabel}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400">
                          {" "}
                          {/* <-- CHANGED: Icon Color */}
                          <IconVoucher />
                        </div>
                        <input
                          type="text"
                          maxLength={20}
                          value={voucherNo}
                          onChange={(e) =>
                            setVoucherNo(e.target.value.toUpperCase())
                          }
                          className="w-full h-14 pl-12 pr-4 bg-gray-800/80 border-2 border-gray-700 text-white font-bold rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all placeholder:text-gray-600 text-lg uppercase hover:border-gray-600" // <-- CHANGED: Focus Color
                          placeholder={text.voucherPlaceholder}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm text-gray-400 font-semibold mb-2.5 uppercase tracking-wide">
                        {text.pinLabel}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400">
                          {" "}
                          {/* <-- CHANGED: Icon Color */}
                          <IconPin />
                        </div>
                        <input
                          type="text"
                          maxLength={10}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.toUpperCase())}
                          className="w-full h-14 pl-12 pr-4 bg-gray-800/80 border-2 border-gray-700 text-white font-bold rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all placeholder:text-gray-600 text-lg uppercase hover:border-gray-600" // <-- CHANGED: Focus Color
                          placeholder={text.pinPlaceholder}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <label className="block text-sm text-gray-400 font-semibold mb-2.5 uppercase tracking-wide">
                      {text.barcodeLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400">
                        {" "}
                        {/* <-- CHANGED: Icon Color */}
                        <IconBarcode />
                      </div>
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        maxLength={20}
                        value={barcode}
                        onChange={(e) =>
                          setBarcode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && barcode) handleVerify();
                        }}
                        className="w-full h-14 pl-12 pr-4 bg-gray-800/80 border-2 border-gray-700 text-white font-bold rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all placeholder:text-gray-600 text-lg uppercase hover:border-gray-600" // <-- CHANGED: Focus Color
                        placeholder={text.barcodePlaceholder}
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-semibold flex items-center backdrop-blur-sm">
                  <svg
                    className="w-5 h-5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <div className="max-w-md mx-auto mt-8 flex flex-col gap-3">
                <button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="relative w-full h-14 bg-sky-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-500/30 hover:bg-sky-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group" // <-- CHANGED: Solid Blue, Hover lighter blue
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                      </>
                    ) : (
                      text.verify
                    )}
                  </span>
                </button>

                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="w-full h-12 text-gray-400 font-semibold text-sm rounded-xl hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  {text.clear}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFIED (PREVIEW) */}
        {step === "VERIFIED" && verifiedData && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
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
                  className="flex-1 py-3 px-4 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-sky-600"
                  
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
                className="bg-sky-600 w-64 h-12 text-white font-medium text-lg rounded-lg transition-all transform active:scale-[0.98] hover:shadow-lg"
                style={{
                  boxShadow: `0 4px 15px ${eagleShadow}`,
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
        /* UPDATED: ปรับ Keyframe ให้มี filter blur และ scale เพื่อความนุ่มนวล */
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
}
