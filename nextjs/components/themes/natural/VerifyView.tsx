"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";
import confetti from "canvas-confetti";

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

export default function VerifyView({ verifyData }: VerifyViewProps) {
  const confettiIntervalRef = useRef<any>(null);

  // --- 1. Data Mapping Logic ---
  const mapDataToStructure = (
    apiData: any,
    fallbackData: any
  ): ProductApiResponse => {
    const rootData = apiData || {}; // ข้อมูลดิบทั้งหมด (ตัวแม่)
    const source = rootData.ScanItem || rootData.item || rootData || {};
    const backup =
      fallbackData?.scanData || (fallbackData as any)?.ScanItem || {};
    const backupProps = fallbackData?.productData?.item?.propertiesObj;

    const code =
      source?.ProductCode ||
      source?.code ||
      backup?.productCode ||
      backup?.ProductCode ||
      backup?.Serial ||
      "-";

    let name = "-";
    if (source?.description) name = source.description;
    else if (source?.ProductDesc) name = source.ProductDesc;
    else if (backup?.ProductDesc) name = backup.ProductDesc;
    else if (source?.name) name = source.name;
    else name = code;

    const orgId = source?.OrgId || source?.orgId || backup?.OrgId || "-";
    const updatedDate =
      source?.CreatedDate ||
      source?.RegisteredDate ||
      source?.updatedDate ||
      backup?.CreatedDate;
    const narrative = source?.narrative || source?.Narrative || "";
    const category =
      source?.propertiesObj?.category ||
      source?.Category ||
      backupProps?.category ||
      "-";

    // Image Priority: Root -> Source -> Fallback
    let finalImages = rootData.Images || rootData.images || [];
    if (!finalImages || finalImages.length === 0) {
      finalImages = source?.Images || source?.images || [];
    }

    if (!finalImages || finalImages.length === 0) {
      const singleImage =
        rootData.ProductImage ||
        rootData.imageUrl ||
        source?.propertiesObj?.imageUrl ||
        source?.propertiesObj?.image ||
        source?.imageUrl ||
        source?.ProductImage ||
        source?.image ||
        "";

      if (singleImage) {
        finalImages = [{ imageUrl: singleImage, narative: "Product Image" }];
      } else {
        finalImages = [
          {
            imageUrl:
              "https://placehold.co/600x600/e8f5e9/2e7d32?text=No+Image",
            narative: "Default Image",
          },
        ];
      }
    }

    return {
      item: {
        code,
        name,
        orgId,
        updatedDate,
        id: source?.Id || source?.id || backup?.Id,
        narrative,
        propertiesObj: {
          category,
          height: source?.propertiesObj?.height || source?.Height || 0,
          width: source?.propertiesObj?.width || source?.Width || 0,
          weight: source?.propertiesObj?.weight || source?.Weight || 0,
          dimentionUnit:
            source?.propertiesObj?.dimensionUnit ||
            source?.DimensionUnit ||
            "",
          weightUnit:
            source?.propertiesObj?.weightUnit || source?.WeightUnit || "",
          productUrl:
            source?.propertiesObj?.productUrl || source?.ProductUrl || "",
          supplierUrl: source?.propertiesObj?.supplierUrl || "",
        },
      },
      images: finalImages,
    };
  };

  // --- 2. State Definitions ---
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    () => {
      return mapDataToStructure(verifyData.productData, verifyData);
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Registration Logic States
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] =
    useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [showRegistrationFormModal, setShowRegistrationFormModal] =
    useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState<{
    status: string;
    description: string;
  }>({ status: "", description: "" });
  const [registeredEmailForModal, setRegisteredEmailForModal] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpRefCode, setOtpRefCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];

  // --- 3. Effects ---

  // OTP Timer Countdown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Fetch Product Data (Updated logic to prevent flickering)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!verifyData.productUrl) return;

      const hasInitialData =
        productData?.item?.code && productData.item.code !== "-";

      if (!hasInitialData) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(verifyData.productUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const rawData = await response.json();
          
          const hasProductData =
            rawData.item ||
            rawData.ScanItem ||
            (rawData.ProductCode && rawData.ProductCode !== "-");

          if (
            !hasProductData &&
            productData?.item?.code &&
            productData.item.code !== "-"
          )
            return;

          const cleanData = mapDataToStructure(rawData, verifyData);
          setProductData(cleanData);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [verifyData.productUrl]); 

  // Confetti Logic
  useEffect(() => {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
    const status = verifyData.status?.toUpperCase();
    if (status === "SUCCESS" || status === "VALID") {
      const greenColors = [
        "#388e3c",
        "#66bb6a",
        "#81c784",
        "#a5d6a7",
        "#dcedc8",
      ];
      const end = Date.now() + 2500;
      const interval: any = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.7 },
          colors: greenColors,
          scalar: 1.2,
        });
      }, 250);
      confettiIntervalRef.current = interval;
    }
    return () => {
      if (confettiIntervalRef.current)
        clearInterval(confettiIntervalRef.current);
    };
  }, [verifyData.status]);

  // --- 4. Registration Logic Handlers ---

  const handleRegisterClick = async () => {
    const getCustomerUrl = (verifyData as any).getCustomerUrl;
    if (!getCustomerUrl) {
      setErrorModalData({
        status: "ERROR",
        description:
          lang === "th"
            ? "ไม่พบ URL สำหรับตรวจสอบข้อมูลลูกค้า"
            : "Customer URL not found",
      });
      setShowErrorModal(true);
      return;
    }
    setIsCheckingRegistration(true);
    try {
      const response = await fetch(getCustomerUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const responseStatus = data.status?.toUpperCase();

      if (responseStatus === "SUCCESS") {
        setRegisteredEmailForModal(
          data.maskingEmail || data.email || data.data?.email || "xxx@xxx.com"
        );
        setIsNewRegistration(false);
        setShowAlreadyRegisteredModal(true);
      } else if (
        responseStatus === "CUSTOMER_NOT_ATTACH" ||
        responseStatus === "CUSTOMER_NOTFOUND"
      ) {
        setShowRegistrationFormModal(true);
      } else {
        const desc =
          lang === "th" && data.descriptionThai
            ? data.descriptionThai
            : lang === "en" && data.descriptionEng
            ? data.descriptionEng
            : data.description || "Error occurred";
        setErrorModalData({
          status: responseStatus || "ERROR",
          description: desc,
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorModalData({
        status: "NETWORK_ERROR",
        description:
          lang === "th"
            ? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
            : "Cannot connect to server",
      });
      setShowErrorModal(true);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(lang === "th" ? "รูปแบบอีเมลไม่ถูกต้อง" : "Invalid email format");
      return;
    }
    setIsSendingOtp(true);
    try {
      const requestOtpUrl = (verifyData as any).requestOtpViaEmailUrl;
      if (!requestOtpUrl) throw new Error("OTP URL missing");
      const otpUrl = `${requestOtpUrl}${
        requestOtpUrl.includes("?") ? "&" : "?"
      }email=${encodeURIComponent(email)}`;
      const response = await fetch(otpUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setIsOtpSent(true);
        setOtpRefCode(data.otpRefCode || "");
        setOtpCooldown(60);
      } else {
        alert(
          data.description ||
            (lang === "th" ? "ส่ง OTP ไม่สำเร็จ" : "Failed to send OTP")
        );
      }
    } catch (error) {
      alert(
        lang === "th" ? "เกิดข้อผิดพลาดในการส่ง OTP" : "Error sending OTP"
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmitRegistration = async () => {
    if (!email || !otp) return;
    setIsRegistering(true);
    try {
      const registerUrl = (verifyData as any).registerCustomerUrl;
      if (!registerUrl) throw new Error("Register URL missing");
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, emailOtp: otp }),
      });
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      if (data.status === "SUCCESS") {
        setShowRegistrationFormModal(false);
        setRegisteredEmailForModal(email);
        setIsNewRegistration(true);
        setShowAlreadyRegisteredModal(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#388e3c", "#66bb6a", "#dcedc8"],
        });
        setEmail("");
        setOtp("");
        setIsOtpSent(false);
        setOtpRefCode("");
      } else {
        alert(
          data.description ||
            (lang === "th" ? "ลงทะเบียนไม่สำเร็จ" : "Registration failed")
        );
      }
    } catch (error) {
      alert(lang === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
    } finally {
      setIsRegistering(false);
    }
  };

  // --- 5. UI Components & Render ---
  const item = productData?.item;
  const props = item?.propertiesObj;
  const imageToShow = productData?.images?.[1] || productData?.images?.[0];
  const statusVerify = verifyData.status?.toUpperCase();
  const isDecryptError = [
    "DECRYPT_ERROR",
    "DECRYPT_FAIL",
    "INVALID_SIGNATURE",
  ].includes(statusVerify || "");

  const Icons = {
    pencil: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-[#a8a332] mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    clipboard: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-[#7a9671] mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </svg>
    ),
    triangle: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-[#7a9671] mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      </svg>
    ),
    scale: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-[#7a9671] mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  };

  // Error UI (Decrypt Fail)
  if (isDecryptError) {
    return (
      <div
        className="h-full w-full p-4 flex items-center justify-center bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url('https://getwallpapers.com/wallpaper/full/d/d/9/1107414-free-download-pretty-green-backgrounds-1920x1080.jpg')`,
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fadeIn border border-red-100">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {lang === "th"
              ? "ไม่สามารถตรวจสอบข้อมูลได้"
              : "Verification Failed"}
          </h2>
          <h2 className="text-xl font-bold text-red-600 mb-2">
              Decrypt Fail
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-6 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            {lang === "th" ? "ลองใหม่อีกครั้ง" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render Structure (Unified to prevent flickering) ---
  return (
    // Main Background
    <div
      className="h-full w-full p-4 flex items-center justify-center bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url('https://getwallpapers.com/wallpaper/full/d/d/9/1107414-free-download-pretty-green-backgrounds-1920x1080.jpg')`,
      }}
    >
      {/* Container Background */}
      <div className="bg-[#fafdfb] rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-fadeIn relative border border-[#dce4d0]">
        
        {isLoading && (!item || item.code === "-") ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-[#fafdfb]">
            <div className="w-12 h-12 border-4 border-[#dce4d0] border-t-[#388e3c] rounded-full animate-spin mb-4"></div>
            <p className="text-[#4a6343] text-sm font-medium animate-pulse">
              {lang === "th" ? "กำลังโหลดข้อมูล..." : "Loading..."}
            </p>
          </div>
        ) : (
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Left Column: Image & Meta */}
              <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
                {/* --- Image Section with Spinner --- */}
                <div className="bg-[#f0f4eb] rounded-xl overflow-hidden shadow-sm border border-[#e0e8d9] relative w-full aspect-video md:aspect-square">
                  {imageToShow ? (
                    <>
                      {isImageLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f0f4eb]">
                          <div className="w-10 h-10 border-4 border-[#c8e6c9] border-t-[#2e7d32] rounded-full animate-spin"></div>
                        </div>
                      )}
                      <Image
                        src={imageToShow.imageUrl}
                        alt="Product"
                        fill
                        className={`object-cover transition-opacity duration-500 ease-in-out ${
                          isImageLoading ? "opacity-0" : "opacity-100"
                        }`}
                        priority
                        onLoadingComplete={() => setIsImageLoading(false)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#7a9671]">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#f7f9f5] rounded-lg p-2.5 border border-[#e9f0e4] text-left">
                    <div className="text-[#556b2f] text-[10px] mb-0.5">
                      {t.labels.manufacturer}
                    </div>
                    <div className="font-semibold text-[#1a3c14] text-xs truncate">
                      {item?.orgId || "-"}
                    </div>
                  </div>
                  <div className="bg-[#f7f9f5] rounded-lg p-2.5 border border-[#e9f0e4] text-left">
                    <div className="text-[#556b2f] text-[10px] mb-0.5">
                      {t.labels.lastUpdate}
                    </div>
                    <div className="font-semibold text-[#1a3c14] text-xs truncate">
                      {item?.updatedDate
                        ? new Date(item.updatedDate).toLocaleDateString(
                            lang === "th" ? "th-TH" : "en-US",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#f7f9f5] rounded-lg p-2.5 border border-[#e9f0e4] text-left">
                    <div className="text-[#556b2f] text-[10px] mb-0.5 font-semibold">
                      {t.labels.serial}
                    </div>
                    <div className="font-bold text-[#1a3c14] text-xs truncate font-mono">
                      {verifyData.scanData?.serial || "-"}
                    </div>
                  </div>
                  <div className="bg-[#f7f9f5] rounded-lg p-2.5 border border-[#e9f0e4] text-left">
                    <div className="text-[#556b2f] text-[10px] mb-0.5 font-semibold">
                      PIN
                    </div>
                    <div className="font-bold text-[#1a3c14] text-xs truncate font-mono">
                      {verifyData.scanData?.pin || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-2xl font-bold text-[#1a3c14] font-mono tracking-tight">
                      {item?.code || verifyData.scanData?.serial || "-"}
                    </h1>
                    {statusVerify === "VALID" || statusVerify === "SUCCESS" ? (
                      <span className="bg-[#dcedc8] text-[#33691e] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#c5e1a5]">
                        {lang === "th" ? "ตรวจสอบสำเร็จ" : "Verify"}
                      </span>
                    ) : statusVerify === "ALREADY_REGISTERED" ? (
                      <span className="bg-[#fff9c4] text-[#f57f17] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#fff176]">
                        {lang === "th" ? "ถูกแสกนแล้ว" : "Scanned"}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[#4a6343] text-sm">{item?.name || "-"}</p>
                  {statusVerify === "ALREADY_REGISTERED" && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-amber-600 mt-0.5"
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
                      <span className="text-xs text-amber-800">
                        {lang === "th"
                          ? "สินค้านี้เคยถูกตรวจสอบไปแล้วเมื่อ "
                          : "This product was already verified on "}
                        {verifyData.scanData?.registeredDate
                          ? new Date(
                              verifyData.scanData.registeredDate
                            ).toLocaleDateString(
                              lang === "th" ? "th-TH" : "en-US",
                              { day: "numeric", month: "short", year: "numeric" }
                            )
                          : lang === "th"
                          ? "ก่อนหน้านี้"
                          : "previously"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#fcfbe8] border border-[#e8e4c9] rounded-lg p-2.5 text-left hover:shadow-sm transition-all">
                    <div className="flex justify-start">{Icons.pencil}</div>
                    <div className="font-semibold text-[#1a3c14] text-xs mt-1">
                      {t.labels.productType}
                    </div>
                    <div className="text-xs text-[#4a6343] truncate">
                      {props?.category || "-"}
                    </div>
                  </div>
                  <div className="bg-[#fafdfb] border border-[#e0e8d9] rounded-lg p-2.5 text-left">
                    <div className="flex justify-start">{Icons.clipboard}</div>
                    <div className="font-semibold text-[#1a3c14] text-xs mt-1">
                      {lang === "th" ? "ความสูง" : "Height"}
                    </div>
                    <div className="text-xs text-[#4a6343]">
                      {props?.height
                        ? `${props.height} ${props.dimentionUnit || ""}`
                        : "-"}
                    </div>
                  </div>
                  <div className="bg-[#fafdfb] border border-[#e0e8d9] rounded-lg p-2.5 text-left">
                    <div className="flex justify-start">{Icons.triangle}</div>
                    <div className="font-semibold text-[#1a3c14] text-xs mt-1">
                      {lang === "th" ? "ความกว้าง" : "Width"}
                    </div>
                    <div className="text-xs text-[#4a6343]">
                      {props?.width
                        ? `${props.width} ${props.dimentionUnit || ""}`
                        : "-"}
                    </div>
                  </div>
                  <div className="bg-[#fafdfb] border border-[#e0e8d9] rounded-lg p-2.5 text-left">
                    <div className="flex justify-start">{Icons.scale}</div>
                    <div className="font-semibold text-[#1a3c14] text-xs mt-1">
                      {lang === "th" ? "น้ำหนัก" : "Weight"}
                    </div>
                    <div className="text-xs text-[#4a6343]">
                      {props?.weight
                        ? `${props.weight} ${props.weightUnit || ""}`
                        : "-"}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f2f7f0] rounded-xl p-4 border border-[#e1e9dd] flex-grow">
                  <h3 className="font-semibold text-[#1a3c14] mb-2 text-sm">
                    {lang === "th" ? "คุณสมบัติเด่น" : "Features"}
                  </h3>
                  <div className="space-y-1.5">
                    {item?.narrative ? (
                      item.narrative.split("|").map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#4caf50] rounded-full flex-shrink-0 mt-1.5"></div>
                          <span className="text-[#2e5e29] text-xs leading-relaxed">
                            {feat.trim()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[#7a9671] text-xs italic text-center py-2">
                        -{" "}
                        {lang === "th"
                          ? "ไม่มีข้อมูลคุณสมบัติ"
                          : "No features data"}{" "}
                        -
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={handleRegisterClick}
                    disabled={isCheckingRegistration}
                    className="w-full py-2.5 px-6 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                      boxShadow: "0 10px 15px -3px rgba(46, 125, 50, 0.3)",
                    }}
                  >
                    {isCheckingRegistration ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {lang === "th" ? "กำลังตรวจสอบ..." : "Checking..."}
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {lang === "th"
                          ? "ลงทะเบียนสินค้า"
                          : "Register Product"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Already Registered Modal */}
      {showAlreadyRegisteredModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a3c14]/60 p-4"
          onClick={() => setShowAlreadyRegisteredModal(false)}
        >
          <div
            className="bg-[#fafdfb] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn border border-[#dce4d0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#dcedc8] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-[#33691e]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1a3c14] mb-2">
                {isNewRegistration
                  ? lang === "th"
                    ? "ลงทะเบียนสำเร็จ"
                    : "Registration Successful"
                  : lang === "th"
                  ? "สินค้านี้ถูกลงทะเบียนแล้ว"
                  : "Already Registered"}
              </h3>
              <p className="text-[#4a6343] mb-6 font-medium break-all">
                {registeredEmailForModal}
              </p>
              <button
                onClick={() => setShowAlreadyRegisteredModal(false)}
                className="w-full py-2.5 bg-[#388e3c] text-white rounded-xl font-semibold hover:bg-[#2e7d32] transition-colors shadow-md shadow-[#388e3c]/20"
              >
                {lang === "th" ? "ตกลง" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Registration Form Modal */}
      {showRegistrationFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a3c14]/60 p-4"
          onClick={() => setShowRegistrationFormModal(false)}
        >
          <div
            className="bg-[#fafdfb] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn border border-[#dce4d0]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1a3c14] mb-4 text-center">
              {lang === "th" ? "ลงทะเบียนสินค้า" : "Register Product"}
            </h3>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4a6343] mb-1">
                Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#c5e1a5] rounded-lg focus:ring-2 focus:ring-[#81c784] focus:outline-none text-sm text-[#1a3c14]"
                  placeholder="example@mail.com"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !email || otpCooldown > 0}
                  className="px-3 py-2 bg-[#388e3c] text-white text-sm font-medium rounded-lg hover:bg-[#2e7d32] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                >
                  {isSendingOtp
                    ? "..."
                    : otpCooldown > 0
                    ? `${otpCooldown}s`
                    : "OTP"}
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#4a6343] mb-1">
                OTP{" "}
                {otpRefCode && (
                  <span className="text-xs text-[#7a9671]">
                    (Ref: {otpRefCode})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={!isOtpSent}
                className="w-full px-3 py-2 border border-[#c5e1a5] rounded-lg focus:ring-2 focus:ring-[#81c784] focus:outline-none text-sm text-[#1a3c14] disabled:bg-[#f1f8e9] disabled:text-[#9aa591]"
                placeholder="XXXXXX"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegistrationFormModal(false)}
                className="flex-1 py-2.5 border border-[#a5d6a7] text-[#388e3c] rounded-xl font-semibold hover:bg-[#f1f8e9] text-sm"
              >
                {lang === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleSubmitRegistration}
                disabled={isRegistering || !otp}
                className="flex-1 py-2.5 bg-[#388e3c] text-white rounded-xl font-semibold hover:bg-[#2e7d32] disabled:opacity-50 text-sm shadow-md shadow-[#388e3c]/20"
              >
                {isRegistering
                  ? "..."
                  : lang === "th"
                  ? "ยืนยัน"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Error Modal */}
      {showErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a3c14]/60 p-4"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn text-center border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {lang === "th" ? "เกิดข้อผิดพลาด" : "Error"}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {errorModalData.description}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
            >
              {lang === "th" ? "ปิด" : "Close"}
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #2e7d32;
          background-image: url('https://getwallpapers.com/wallpaper/full/d/d/9/1107414-free-download-pretty-green-backgrounds-1920x1080.jpg');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}