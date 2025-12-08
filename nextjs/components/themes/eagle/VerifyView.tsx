"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";

// Eagle Theme Colors & Styles
const THEME = {
  red: "#dc2626",
  black: "#0f0f0f",
};

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

const SocialLink = ({ href, icon, colorClass, label }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`p-2.5 rounded-full bg-gray-800 border border-gray-600 text-white 
                transition-all duration-300 hover:scale-110 hover:border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ${colorClass}`}
  >
    {icon}
  </a>
);

export default function VerifyViewEagle({ verifyData }: VerifyViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    verifyData.productData
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Registration modal state
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
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpRefCode, setOtpRefCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseStatus = data.status?.toUpperCase();

      if (responseStatus === "SUCCESS") {
        setRegisteredEmailForModal(
          data.maskingEmail ||
            data.email ||
            data.data?.email ||
            verifyData.registeredEmail ||
            "xxx@xxx.com"
        );
        setIsNewRegistration(false);
        setShowAlreadyRegisteredModal(true);
      } else if (
        responseStatus === "CUSTOMER_NOT_ATTACH" ||
        responseStatus === "CUSTOMER_NOTFOUND"
      ) {
        setShowRegistrationFormModal(true);
      } else {
        const description =
          lang === "th" && data.descriptionThai
            ? data.descriptionThai
            : lang === "en" && data.descriptionEng
            ? data.descriptionEng
            : data.description ||
              (lang === "th" ? "เกิดข้อผิดพลาด" : "An error occurred");

        setErrorModalData({
          status: responseStatus || "ERROR",
          description: description,
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      const description =
        lang === "th"
          ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
          : "Cannot connect to server. Please check your internet connection.";

      setErrorModalData({
        status: "NETWORK_ERROR",
        description: description,
      });
      setShowErrorModal(true);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleViewProduct = async () => {
    if (productData) {
      setIsModalOpen(true);
      return;
    }
    if (!verifyData.productUrl) {
      setIsModalOpen(true);
      return;
    }
    setIsLoadingProduct(true);
    setProductError(null);
    try {
      const response = await fetch(verifyData.productUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.status}`);
      }
      const data: ProductApiResponse = await response.json();
      setProductData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setProductError(
        error instanceof Error ? error.message : "Failed to load product data"
      );
      setIsModalOpen(true);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const status = verifyData.status?.toUpperCase() || "UNKNOWN";
  const isSuccess = ["OK", "SUCCESS", "VALID"].includes(status);
  const isWarning = ["ALREADY_REGISTERED", "EXPIRED"].includes(status);
  const isError =
    (!isSuccess && !isWarning) ||
    ["DECRYPT_ERROR", "DECRYPT_FAIL"].includes(status);

  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];

  const statusTitle =
    t.titles[status as keyof typeof t.titles] || t.titles.UNKNOWN;
  const statusMessages =
    t.messages[status as keyof typeof t.messages] || t.messages.UNKNOWN;

  const statusIcon = isSuccess ? (
    <svg className="text-white w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  ) : isWarning ? (
    <svg className="text-white w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ) : (
    <svg className="text-white w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );

  const gradientBg = isSuccess
    ? "linear-gradient(135deg, #166534 0%, #15803d 100%)"
    : isWarning
    ? "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)"
    : "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)";

  const shadowColor = isSuccess
    ? "rgba(22, 101, 52, 0.4)"
    : isWarning
    ? "rgba(194, 65, 12, 0.4)"
    : "rgba(220, 38, 38, 0.4)";

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const images = productData?.images || [];
  const totalSlides = images.length;
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    if (isModalOpen && totalSlides > 1) {
      const interval = setInterval(() => nextSlide(), 5000);
      return () => clearInterval(interval);
    }
  }, [isModalOpen, currentSlide, totalSlides]);

  useEffect(() => {
    if (isModalOpen) setCurrentSlide(0);
  }, [isModalOpen]);

  useEffect(() => {
    if (isSuccess) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#dc2626", "#0f0f0f", "#ffffff"],
        });
      });
    }
  }, [isSuccess]);

  // 🔴 PART 2: UI RENDERING
  return (
    <>
      <div
        className="mx-auto w-full flex flex-col justify-center"
        style={{
          maxWidth: "400px",
          minHeight: "100%", 
          padding: "0 1rem",
          opacity: 0,
          animation: "fadeIn 0.5s ease-out forwards",
        }}
      >
        <div className="flex-1 flex flex-col justify-center gap-1">
          {" "}
          {/* 1. STATUS ICON (เล็กลง) */}
          <div className="flex justify-center mb-1 mt-1">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{
                  background: isSuccess
                    ? "#15803d"
                    : isWarning
                    ? "#ea580c"
                    : "#dc2626",
                }}
              ></div>
              <div
                className="rounded-full flex items-center justify-center p-3 relative z-10" // ลด padding
                style={{
                  background: gradientBg,
                  boxShadow: `0 0 15px ${shadowColor}`,
                  border: "2px solid rgba(255,255,255,0.1)",
                }}
              >
                {statusIcon}
              </div>
            </div>
          </div>
          {/* 2. TITLE */}
          <h1 className="text-2xl font-black text-center mb-0 uppercase tracking-wide text-gray-900 leading-tight">
            {statusTitle}
          </h1>
          {/* 3. MESSAGES  */}
          <div className="text-center mb-2 space-y-0">
            {statusMessages.map((msg, idx) => (
              <p
                key={idx}
                className="text-gray-600 font-medium text-[11px] leading-tight"
              >
                {msg}
              </p>
            ))}
          </div>
          {/* 4. DIVIDER  */}
          <div className="flex items-center justify-center mb-2 opacity-30 scale-75 origin-center">
            <div className="h-[1px] w-8 bg-gray-300"></div>
            <div
              className={`h-[3px] w-10 mx-2 transform -skew-x-12 ${
                isSuccess
                  ? "bg-green-600"
                  : isError
                  ? "bg-red-600"
                  : "bg-orange-500"
              }`}
            ></div>
            <div className="h-[1px] w-8 bg-gray-300"></div>
          </div>
          {/* 5. DATA CARD */}
          {(verifyData.scanData?.serial || verifyData.scanData?.pin) && (
            <div className="mb-3 space-y-2">
              {/* Serial Box */}
              {verifyData.scanData.serial && (
                <div className="group bg-gray-900 rounded p-2 flex items-center justify-between shadow-sm border-l-2 border-red-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-full bg-white opacity-5 transform skew-x-12 translate-x-4"></div>
                  <div className="flex flex-col items-start relative z-10">
                    <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">
                      Serial Number
                    </span>
                    <span className="text-sm font-bold text-white font-mono tracking-wider">
                      {verifyData.scanData.serial}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(verifyData.scanData!.serial!, "serial")
                    }
                    className="p-1 rounded hover:bg-white hover:text-black text-gray-400 transition-colors z-10"
                  >
                    {copiedField === "serial" ? (
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
              {/* Pin Box */}
              {verifyData.scanData.pin && (
                <div className="group bg-white border border-gray-300 rounded p-2 flex items-center justify-between shadow-sm hover:border-gray-900 transition-colors">
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                      Security Pin
                    </span>
                    <span className="text-sm font-bold text-gray-900 font-mono tracking-wider">
                      {verifyData.scanData.pin}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(verifyData.scanData!.pin!, "pin")
                    }
                    className="p-1 rounded hover:bg-black hover:text-white text-gray-400 transition-colors"
                  >
                    {copiedField === "pin" ? (
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
              {/* Warning Date */}
              {isWarning && verifyData.scanData.registeredDate && (
                <div className="text-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                    {t.labels.registeredAt}:{" "}
                    {new Date(
                      verifyData.scanData.registeredDate
                    ).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* 6. PRIMARY ACTION BUTTON */}
          {isSuccess || isWarning ? (
            <button
              type="button"
              onClick={handleViewProduct}
              disabled={isLoadingProduct}
              className="w-full py-4 px-6 text-white font-bold text-lg uppercase tracking-wider rounded transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden shadow-md mt-1"
              style={{
                background: isSuccess ? "#0f0f0f" : "#ea580c",
                borderBottom: `2px solid ${isSuccess ? "#dc2626" : "#9a3412"}`,
              }}
            >
              <div className="absolute top-0 -left-full w-full h-full bg-white opacity-10 transform skew-x-12 group-hover:left-full transition-all duration-700"></div>
              <span className="inline-flex items-center justify-center gap-2 relative z-10">
                {isLoadingProduct ? (
                  "Loading..."
                ) : (
                  <>
                    {t.labels.viewProduct}{" "}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                (window.location.href = `/contact-support?lang=${lang}`)
              }
              className="w-full py-4 px-6 text-white font-bold text-lg uppercase tracking-wider rounded transition-all bg-red-600 hover:bg-red-700 border-b-2 border-red-800 shadow-md mt-1"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {t.labels.contactSupport}
              </span>
            </button>
          )}
          {/* 7. ALERT BOXES */}
          <div className="mt-2">
            {isSuccess && (
              <div className="p-2 rounded bg-green-50 border-l-2 border-green-600 shadow-sm flex items-start gap-2">
                <div className="text-green-600 text-xs">✓</div>
                <div>
                  <div className="text-green-800 font-bold text-[14px] uppercase">
                    {t.alerts.successTitle}
                  </div>
                  <div className="text-green-700 text-[12px]">
                    {t.alerts.successMessage}
                  </div>
                </div>
              </div>
            )}
            {isWarning && (
              <div className="p-2 rounded bg-orange-50 border-l-2 border-orange-500 shadow-sm flex items-start gap-2">
                <div className="text-orange-500 text-xs">!</div>
                <div>
                  <div className="text-orange-800 font-bold text-[10px] uppercase">
                    {t.alerts.warningTitle}
                  </div>
                  <div className="text-orange-800 text-[10px]">
                    {statusMessages[0]}
                  </div>
                </div>
              </div>
            )}
            {isError && (
              <div className="p-2 rounded bg-red-50 border-l-2 border-red-600 shadow-sm flex items-start gap-2">
                <div className="text-red-600 text-xs">X</div>
                <div>
                  <div className="text-red-800 font-bold text-[10px] uppercase">
                    {t.alerts.errorTitle}
                  </div>
                  <div className="text-red-800 text-[10px]">
                    {statusMessages[0]}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 8. REGISTER BUTTON */}
          {(status === "SUCCESS" || status === "ALREADY_REGISTERED") && (
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={isCheckingRegistration}
              className="w-full mt-2 py-2 px-4 text-blue-700 bg-white border border-blue-600 font-bold uppercase tracking-wide rounded hover:bg-blue-50 transition-colors text-xs"
            >
              {isCheckingRegistration ? "Checking..." : t.registration.button}
            </button>
          )}
          {/* 🟢 9. SOCIAL MEDIA LINKS (MOVED UP + STYLED) */}
          <div className="mt-3 pt-2 border-t border-gray-200/50">
            <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              {lang === "th" ? "ติดตามข่าวสาร" : "CONNECT"}
            </p>

            <div className="flex items-center justify-center gap-3">
              <SocialLink
                href="https://www.facebook.com/NAPBIOTEC"
                label="Facebook"
                colorClass="hover:bg-[#1877F2] hover:border-[#1877F2]"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                }
              />
              <SocialLink
                href="https://www.instagram.com/napbiotec_official/"
                label="Instagram"
                colorClass="hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                }
              />
              <SocialLink
                href="https://www.tiktok.com/@napbiotec_official"
                label="TikTok"
                colorClass="hover:bg-black hover:border-white hover:text-white"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v10.95c0 4.61-5.15 7.42-8.97 5.41-2.9-1.52-4.23-5.26-2.91-8.35 1.05-2.45 3.52-3.95 6.16-3.83v4.16c-1.39.02-2.72.93-3.1 2.29-.39 1.4.38 2.87 1.76 3.25 1.47.41 3.01-.45 3.42-1.92.09-.32.12-.66.11-1.01v-19.1z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>


      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(5px)",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
              <h3 className="text-white font-bold uppercase tracking-wide ml-2">
                Product Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {isLoadingProduct ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">Loading...</p>
                </div>
              ) : productData?.item ? (
                <div className="text-white">
                  <h2 className="text-xl font-bold mb-4">
                    {productData.item.description}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>Code: {productData.item.code}</div>
                    <div>Org: {productData.item.orgId}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">No Data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. REGISTRATION MODAL */}
      {showRegistrationFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setShowRegistrationFormModal(false)}
        >
          <div
            className="bg-gray-900 border border-red-900 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide border-b border-gray-800 pb-2">
              {lang === "th" ? "ลงทะเบียนสมาชิก" : "Member Registration"}
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white p-2 rounded"
                placeholder="Email"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 bg-black border border-gray-700 text-white p-2 rounded"
                  placeholder="OTP"
                />
                <button
                  onClick={async () => {
                    /* Logic send OTP */ setIsSendingOtp(true);
                    setTimeout(() => setIsSendingOtp(false), 1000);
                    setIsOtpSent(true);
                  }}
                  className="bg-gray-800 text-white px-3 rounded text-xs font-bold"
                >
                  SEND
                </button>
              </div>
              <button className="w-full py-3 bg-red-600 text-white font-bold uppercase rounded hover:bg-red-700">
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. ALERTS MODAL */}
      {(showErrorModal || showAlreadyRegisteredModal) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => {
            setShowErrorModal(false);
            setShowAlreadyRegisteredModal(false);
          }}
        >
          <div
            className="bg-gray-900 border border-gray-700 w-full max-w-sm p-6 rounded text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-2 uppercase">
              {showErrorModal
                ? lang === "th"
                  ? "เกิดข้อผิดพลาด"
                  : "Error"
                : isNewRegistration
                ? "Registration Success"
                : "Already Registered"}
            </h3>
            <p className="text-gray-400 mb-6">
              {showErrorModal
                ? errorModalData.description
                : registeredEmailForModal}
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setShowAlreadyRegisteredModal(false);
              }}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
    </>
  );
}
