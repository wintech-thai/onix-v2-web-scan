"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// --- MODERN THEME CONFIGURATION ---
const MODERN_THEME = {
  primary: "#2563eb", // Blue-600
  success: "#10b981", // Emerald-500
  warning: "#f59e0b", // Amber-500
  error: "#ef4444", // Red-500
};

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

// 🟢 Helper Component: SocialLink (Compact Style)
const SocialLink = ({ href, icon, colorClass, label }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 
                transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${colorClass}`}
  >
    {icon}
  </a>
);

export default function VerifyViewModern({ verifyData }: VerifyViewProps) {
  // 1. LOGIC SECTION

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

  // Countdown timer for OTP cooldown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Handler for registration button click
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

  // Lazy load product data when modal opens
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

  // --- UI CONSTANTS (MODERN) ---
  const bgSoftColor = isSuccess
    ? "bg-emerald-50"
    : isWarning
    ? "bg-amber-50"
    : "bg-red-50";
  const iconBgColor = isSuccess
    ? "bg-emerald-100 text-emerald-600"
    : isWarning
    ? "bg-amber-100 text-amber-600"
    : "bg-red-100 text-red-600";

  const statusIcon = isSuccess ? (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : isWarning ? (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ) : (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isModalOpen && totalSlides > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isModalOpen, currentSlide, totalSlides]);

  useEffect(() => {
    if (isModalOpen) {
      setCurrentSlide(0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isSuccess) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: [MODERN_THEME.primary, MODERN_THEME.success, "#ffffff"],
          disableForReducedMotion: true,
        });
      });
    }
  }, [isSuccess]);

  // 2. UI RENDERING (MODERN & COMPACT)
  return (
    <>
      <div
        className="mx-auto w-full h-full flex flex-col justify-center items-center px-4"
        style={{
          height: "100%", 
          animation: "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Modern Card Container */}
        <div className="bg-white w-full max-w-[450px] rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          {/* Header Section (Status) */}
          <div
            className={`pt-6 pb-4 px-6 text-center ${bgSoftColor} relative overflow-hidden shrink-0`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`rounded-full p-3 mb-2 shadow-sm ${iconBgColor} ring-4 ring-white`}
              >
                {statusIcon}
              </div>

              <h1 className="text-xl font-black text-slate-800 mb-1 tracking-tight uppercase">
                {statusTitle}
              </h1>

              <div className="space-y-0.5">
                {statusMessages.map((msg, idx) => (
                  <p
                    key={idx}
                    className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-1"
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-4">
            {/* Data Grid: Serial & Pin Side-by-Side */}
            {(verifyData.scanData?.serial || verifyData.scanData?.pin) && (
              <div className="grid grid-cols-2 gap-3">
                {/* Serial Box */}
                {verifyData.scanData.serial && (
                  <div
                    className="group relative bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between transition-all hover:border-blue-300 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(verifyData.scanData!.serial!, "serial")
                    }
                  >
                    <div className="flex flex-col items-start pl-1 overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                        Serial Number
                      </span>
                      <span className="text-sm font-bold text-slate-800 font-mono tracking-wide truncate w-full">
                        {verifyData.scanData.serial}
                      </span>
                    </div>
                    {copiedField === "serial" ? (
                      <span className="text-emerald-500 text-[10px] font-bold">
                        ✓
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Pin Box */}
                {verifyData.scanData.pin && (
                  <div
                    className="group relative bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between transition-all hover:border-blue-300 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(verifyData.scanData!.pin!, "pin")
                    }
                  >
                    <div className="flex flex-col items-start pl-1 overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                        Security Pin
                      </span>
                      <span className="text-sm font-bold text-slate-800 font-mono tracking-wide truncate w-full">
                        {verifyData.scanData.pin}
                      </span>
                    </div>
                    {copiedField === "pin" ? (
                      <span className="text-emerald-500 text-[10px] font-bold">
                        ✓
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Registered Date (Compact) */}
            {isWarning && verifyData.scanData?.registeredDate && (
              <div className="text-center -mt-2">
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  {t.labels.registeredAt}:{" "}
                  {new Date(
                    verifyData.scanData.registeredDate
                  ).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {isSuccess || isWarning ? (
                <button
                  type="button"
                  onClick={handleViewProduct}
                  disabled={isLoadingProduct}
                  className="w-full py-3.5 px-6 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${MODERN_THEME.primary} 0%, #1e40af 100%)`,
                  }}
                >
                  {isLoadingProduct ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      {lang === "th" ? "กำลังโหลด..." : "Loading..."}
                    </>
                  ) : (
                    <>
                      {t.labels.viewProduct}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = `/contact-support?lang=${lang}`)
                  }
                  className="w-full py-3.5 px-6 text-white font-semibold text-base rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${MODERN_THEME.error} 0%, #b91c1c 100%)`,
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  {t.labels.contactSupport}
                </button>
              )}

              {/* Registration Button */}
              {(status === "SUCCESS" || status === "ALREADY_REGISTERED") && (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  disabled={isCheckingRegistration}
                  className="w-full py-2.5 px-4 text-slate-600 bg-white border border-slate-200 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all text-xs flex items-center justify-center gap-2"
                >
                  {isCheckingRegistration ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
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
                      {lang === "th" ? "กำลังตรวจสอบ..." : "Checking..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {t.registration.button}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Social Media (Compact Footer) */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                {lang === "th" ? "ติดตามเรา" : "FOLLOW US"}
              </span>
              <div className="flex gap-2">
                <SocialLink
                  href="https://www.facebook.com/NAPBIOTEC"
                  label="Facebook"
                  colorClass="hover:bg-blue-500 hover:text-white"
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
                  colorClass="hover:bg-pink-500 hover:text-white"
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
                  colorClass="hover:bg-black hover:text-white"
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
      </div>

      {/* --- MODALS (Simplified Styles) --- */}
      {/* Product Details Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-bold ml-2">Product Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
            <div className="p-8">
              {isLoadingProduct ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <svg
                    className="animate-spin h-10 w-10 mb-4 text-blue-600"
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
                  {lang === "th" ? "กำลังโหลดข้อมูล..." : "Loading details..."}
                </div>
              ) : productData?.item ? (
                <div className="text-slate-800">
                  <h2 className="text-2xl font-bold mb-4">
                    {productData.item.description}
                  </h2>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900">
                          Code:
                        </span>{" "}
                        {productData.item.code}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Org:
                        </span>{" "}
                        {productData.item.orgId}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-10">
                  No Product Data Available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal (Modern) */}
      {showRegistrationFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowRegistrationFormModal(false)}
        >
          <div
            className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              {lang === "th" ? "ลงทะเบียนสมาชิก" : "Member Registration"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Enter your details to receive benefits
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@example.com"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      email &&
                      !isSendingOtp &&
                      otpCooldown === 0
                    ) {
                      e.preventDefault();
                      // Find and click send button
                      const sendBtn =
                        e.currentTarget.parentElement?.nextElementSibling?.querySelector(
                          "button"
                        );
                      if (sendBtn) sendBtn.click();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  OTP Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="123456"
                    disabled={!isOtpSent}
                  />
                  <button
                    onClick={async () => {
                      if (!email) return;
                      setIsSendingOtp(true);
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        setIsSendingOtp(false);
                        alert("Invalid Email");
                        return;
                      }

                      try {
                        // Use verifyData to get URL
                        const requestOtpUrl = (verifyData as any)
                          .requestOtpViaEmailUrl;
                        if (requestOtpUrl) {
                          const otpUrl = `${requestOtpUrl}${
                            requestOtpUrl.includes("?") ? "&" : "?"
                          }email=${encodeURIComponent(email)}`;
                          const res = await fetch(otpUrl);
                          const d = await res.json();
                          if (d.status === "SUCCESS") {
                            setIsOtpSent(true);
                            setOtpCooldown(15);
                          } else {
                            alert("Failed to send OTP");
                          }
                        } else {
                          // Fallback simulation
                          setTimeout(() => {
                            setIsOtpSent(true);
                            setOtpCooldown(15);
                            setIsSendingOtp(false);
                          }, 1000);
                        }
                      } catch (e) {
                        alert("Error sending OTP");
                      } finally {
                        setIsSendingOtp(false);
                      }
                    }}
                    className="bg-slate-800 text-white px-4 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
                    disabled={isSendingOtp || !email || otpCooldown > 0}
                  >
                    {isSendingOtp
                      ? "..."
                      : otpCooldown > 0
                      ? `${otpCooldown}s`
                      : "SEND"}
                  </button>
                </div>
              </div>
              <button
                onClick={async () => {
                  // Logic for confirmation
                  if (!email || !otp) return;
                  setIsRegistering(true);

                  try {
                    const registerUrl = (verifyData as any).registerCustomerUrl;
                    if (registerUrl) {
                      const res = await fetch(registerUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, emailOtp: otp }),
                      });
                      const d = await res.json();
                      if (d.status === "SUCCESS") {
                        setShowRegistrationFormModal(false);
                        setRegisteredEmailForModal(email);
                        setIsNewRegistration(true);
                        setShowAlreadyRegisteredModal(true);
                      } else {
                        alert("Registration Failed");
                      }
                    } else {
                      // Fallback simulation
                      setTimeout(() => {
                        setIsRegistering(false);
                        setShowRegistrationFormModal(false);
                        setRegisteredEmailForModal(email);
                        setIsNewRegistration(true);
                        setShowAlreadyRegisteredModal(true);
                      }, 1000);
                    }
                  } catch (e) {
                    alert("Error registering");
                  } finally {
                    setIsRegistering(false);
                  }
                }}
                disabled={isRegistering || !isOtpSent}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 mt-4 transition-all transform active:scale-95 disabled:opacity-70"
              >
                {isRegistering ? "Confirming..." : "CONFIRM REGISTRATION"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal (Modern) */}
      {(showErrorModal || showAlreadyRegisteredModal) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => {
            setShowErrorModal(false);
            setShowAlreadyRegisteredModal(false);
          }}
        >
          <div
            className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                showErrorModal
                  ? "bg-red-100 text-red-500"
                  : "bg-green-100 text-green-500"
              }`}
            >
              {showErrorModal ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
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
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {showErrorModal
                ? lang === "th"
                  ? "เกิดข้อผิดพลาด"
                  : "Error"
                : isNewRegistration
                ? "Success"
                : "Already Registered"}
            </h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              {showErrorModal
                ? errorModalData.description
                : registeredEmailForModal}
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setShowAlreadyRegisteredModal(false);
              }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: ` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `,
        }}
      />
    </>
  );
}
