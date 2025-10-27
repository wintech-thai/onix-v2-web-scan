"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

export default function VerifyView({ verifyData }: VerifyViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    verifyData.productData,
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

  // Handler for registration button click - calls GetCustomerUrl API first
  const handleRegisterClick = async () => {
    const getCustomerUrl = (verifyData as any).getCustomerUrl;

    if (!getCustomerUrl) {
      // Fallback: if no GetCustomerUrl, show error
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

      // Route based on status
      if (responseStatus === "SUCCESS") {
        // Already registered - show dialog 1.1
        setRegisteredEmailForModal(
          data.maskingEmail ||
            data.email ||
            data.data?.email ||
            verifyData.registeredEmail ||
            "xxx@xxx.com",
        );
        setIsNewRegistration(false); // This is already registered, not a new registration
        setShowAlreadyRegisteredModal(true);
      } else if (
        responseStatus === "CUSTOMER_NOT_ATTACH" ||
        responseStatus === "CUSTOMER_NOTFOUND"
      ) {
        // Not registered - show dialog 2.1 (registration form)
        setShowRegistrationFormModal(true);
      } else {
        // Any other status - show error with description
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
      // Network or timeout error
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
    // If product data already loaded, just open modal
    if (productData) {
      setIsModalOpen(true);
      return;
    }

    // If no product URL, open modal anyway (will show "no data" message)
    if (!verifyData.productUrl) {
      setIsModalOpen(true);
      return;
    }

    // Fetch product data using proxied URL directly
    setIsLoadingProduct(true);
    setProductError(null);

    try {
      // productUrl is already a proxied URL from /api/verify (e.g., /api/proxy?url=base64...)
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
        error instanceof Error ? error.message : "Failed to load product data",
      );
      // Still open modal to show error
      setIsModalOpen(true);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Determine status type
  const status = verifyData.status?.toUpperCase() || "UNKNOWN";
  const isSuccess = ["OK", "SUCCESS", "VALID"].includes(status);
  const isWarning = ["ALREADY_REGISTERED", "EXPIRED"].includes(status);
  // Explicitly treat DECRYPT_ERROR and DECRYPT_FAIL as errors (red styling)
  const isError =
    (!isSuccess && !isWarning) ||
    ["DECRYPT_ERROR", "DECRYPT_FAIL"].includes(status);

  // Get language (default Thai) and translations
  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];

  // Get status title and messages from translations
  const statusTitle =
    t.titles[status as keyof typeof t.titles] || t.titles.UNKNOWN;
  const statusMessages =
    t.messages[status as keyof typeof t.messages] || t.messages.UNKNOWN;

  // Icon and gradient colors (matching C# exactly)
  const statusIcon = isSuccess ? (
    <svg
      className="text-white"
      style={{ width: "50px", height: "50px" }}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  ) : isWarning ? (
    <svg
      className="text-white"
      style={{ width: "50px", height: "50px" }}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ) : (
    <svg
      className="text-white"
      style={{ width: "50px", height: "50px" }}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );

  const gradientBg = isSuccess
    ? "linear-gradient(135deg, #6FE10A 0%, #58CD04 100%)"
    : isWarning
      ? "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)"
      : "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)";

  const shadowColor = isSuccess
    ? "rgba(111, 225, 10, 0.3)"
    : isWarning
      ? "rgba(255, 167, 38, 0.3)"
      : "rgba(255, 107, 107, 0.3)";

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Carousel navigation functions (use state productData)
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

  // Auto-scroll carousel every 5 seconds (matching C# data-bs-interval="5000")
  useEffect(() => {
    if (isModalOpen && totalSlides > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isModalOpen, currentSlide, totalSlides]);

  // Reset carousel when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setCurrentSlide(0);
    }
  }, [isModalOpen]);

  // Confetti effect on success
  useEffect(() => {
    if (isSuccess) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
    }
  }, [isSuccess]);

  return (
    <>
      <div
        className="mx-auto p-6"
        style={{
          maxWidth: "400px",
          opacity: 0,
          transform: "translateY(20px)",
          animation: "fadeIn 1s ease-out forwards",
        }}
      >
        {/* Large Icon with Gradient Circle */}
        <div className="flex justify-center mb-6">
          <div
            className="rounded-full flex items-center justify-center p-3 mb-2 shadow"
            style={{
              background: gradientBg,
              boxShadow: `0 6px 16px ${shadowColor}`,
            }}
          >
            {statusIcon}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-3 text-gray-900">
          {statusTitle}
        </h1>

        {/* Status Messages */}
        <div className="text-center mb-6 space-y-2">
          {statusMessages.map((msg, idx) => (
            <p key={idx} className="text-gray-600 text-sm">
              {msg}
            </p>
          ))}
        </div>
        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Serial and Pin Section */}
        {(verifyData.scanData?.serial || verifyData.scanData?.pin) && (
          <div className="mb-6 space-y-3">
            {/* Serial */}
            {verifyData.scanData.serial && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  Serial :
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {verifyData.scanData.serial}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(verifyData.scanData!.serial!, "serial")
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors border border-gray-300"
                  title={copiedField === "serial" ? "Copied!" : "Copy Serial"}
                  aria-label="Copy Serial"
                >
                  <svg
                    style={{ width: "16px", height: "16px" }}
                    className={
                      copiedField === "serial"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Pin */}
            {verifyData.scanData.pin && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  Pin :
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {verifyData.scanData.pin}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(verifyData.scanData!.pin!, "pin")
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors border border-gray-300"
                  title={copiedField === "pin" ? "Copied!" : "Copy Pin"}
                  aria-label="Copy Pin"
                >
                  <svg
                    style={{ width: "16px", height: "16px" }}
                    className={
                      copiedField === "pin" ? "text-green-600" : "text-gray-600"
                    }
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Registered At (for warning status only) */}
            {isWarning && verifyData.scanData.registeredDate && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  {t.labels.registeredAt} :
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {new Date(verifyData.scanData.registeredDate).toLocaleString(
                    lang === "th" ? "th-TH" : "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        {isSuccess || isWarning ? (
          <button
            type="button"
            onClick={handleViewProduct}
            disabled={isLoadingProduct}
            className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors mb-4 border-0 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: gradientBg,
              boxShadow: `0 2px 8px ${shadowColor}`,
            }}
            onMouseEnter={(e) => {
              if (!isLoadingProduct) {
                e.currentTarget.style.background = isSuccess
                  ? "linear-gradient(135deg, #58CD04 0%, #4BB803 100%)"
                  : "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = gradientBg;
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isLoadingProduct ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3,3H21V21H3V3M5,5V19H19V5H5M7.5,11H9.5V13H7.5V11M10.5,11H12.5V13H10.5V11M13.5,11H15.5V13H13.5V11M7.5,7H9.5V9H7.5V7M10.5,7H12.5V9H10.5V7M13.5,7H15.5V9H13.5V7M7.5,15H9.5V17H7.5V15M10.5,15H12.5V17H10.5V15M13.5,15H15.5V17H13.5V15Z" />
                  </svg>
                  {t.labels.viewProduct}
                </>
              )}
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors mb-4 border-0"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #ee5a24 0%, #d63031 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)";
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {t.labels.contactSupport}
            </span>
          </button>
        )}

        {/* Additional Info Alert Boxes */}
        {isSuccess && (
          <div
            className="p-3 rounded-lg border-l-4 border-green-600 mb-0"
            style={{
              background: "linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="text-green-600"
                style={{ width: "20px", height: "20px" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
              </svg>
              <div className="text-green-800 font-semibold text-sm">
                {t.alerts.successTitle}
              </div>
            </div>
            <div className="text-green-700 text-sm leading-snug">
              {t.alerts.successMessage}
            </div>
          </div>
        )}

        {isWarning && (
          <div
            className="p-3 rounded-lg border-l-4 mb-0"
            style={{
              borderColor: "#ffa726",
              background: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg
                style={{ width: "20px", height: "20px", color: "#ffa726" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
              <div
                className="font-semibold text-sm"
                style={{ color: "#e65100" }}
              >
                {t.alerts.warningTitle}
              </div>
            </div>
            <div className="text-sm leading-snug" style={{ color: "#e65100" }}>
              {statusMessages[0]}
            </div>
          </div>
        )}

        {isError && (
          <div
            className="p-3 rounded-lg border-l-4 border-red-600 mb-0"
            style={{
              background: "linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="text-red-600"
                style={{ width: "20px", height: "20px" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <div className="text-red-800 font-semibold text-sm">
                {t.alerts.errorTitle}
              </div>
            </div>
            <div className="text-red-700 text-sm leading-snug">
              {statusMessages[0]}
            </div>
          </div>
        )}

        {/* Registration Button - Only for SUCCESS and ALREADY_REGISTERED */}
        {(status === "SUCCESS" || status === "ALREADY_REGISTERED") && (
          <button
            type="button"
            onClick={handleRegisterClick}
            disabled={isCheckingRegistration}
            className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors mt-4 border-0 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isCheckingRegistration) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
            }}
          >
            {isCheckingRegistration ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
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
              </span>
            ) : (
              t.registration.button
            )}
          </button>
        )}
      </div>

      {/* Already Registered Modal (Dialog 1.1) */}
      {showAlreadyRegisteredModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowAlreadyRegisteredModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center text-lg font-semibold mb-2 text-gray-900">
              {isNewRegistration
                ? t.registration.registrationSuccessLine1
                : t.registration.alreadyRegisteredLine1}
            </h3>
            <p className="text-center text-gray-600 mb-6 text-lg font-medium">
              {registeredEmailForModal}
            </p>
            <button
              onClick={() => setShowAlreadyRegisteredModal(false)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {t.registration.confirmButton}
            </button>
          </div>
        </div>
      )}

      {/* Registration Form Modal (Dialog 2.1) */}
      {showRegistrationFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowRegistrationFormModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                {t.registration.emailLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.registration.emailPlaceholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      email &&
                      !isSendingOtp &&
                      otpCooldown === 0
                    ) {
                      e.preventDefault();
                      (
                        e.currentTarget.nextElementSibling as HTMLButtonElement
                      )?.click();
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (!email) return;

                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      setErrorModalData({
                        status: "VALIDATION_ERROR",
                        description:
                          lang === "th"
                            ? "รูปแบบอีเมลไม่ถูกต้อง"
                            : "Invalid email format",
                      });
                      setShowRegistrationFormModal(false);
                      setShowErrorModal(true);
                      return;
                    }

                    setIsSendingOtp(true);
                    try {
                      // Get requestOtpViaEmailUrl from backend response
                      const requestOtpUrl = (verifyData as any)
                        .requestOtpViaEmailUrl;

                      if (!requestOtpUrl) {
                        throw new Error("OTP URL not available");
                      }

                      // Add email as query parameter
                      // Proxy will replace {email} placeholder if it exists,
                      // or append to path if it doesn't
                      const otpUrl = `${requestOtpUrl}${requestOtpUrl.includes("?") ? "&" : "?"}email=${encodeURIComponent(email)}`;

                      // Call Send OTP API via proxy
                      const response = await fetch(otpUrl, {
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

                      if (data.status === "SUCCESS") {
                        setIsOtpSent(true);
                        setOtpRefCode(data.otpRefCode || "");
                        setOtpCooldown(15); // Start 15 second cooldown
                        // Optional: Show success message
                        console.log("OTP sent successfully");
                      } else {
                        // API returned error status
                        const description =
                          lang === "th" && data.descriptionThai
                            ? data.descriptionThai
                            : lang === "en" && data.descriptionEng
                              ? data.descriptionEng
                              : data.description ||
                                (lang === "th"
                                  ? "ไม่สามารถส่ง OTP ได้"
                                  : "Failed to send OTP");

                        setErrorModalData({
                          status: data.status || "ERROR",
                          description: description,
                        });
                        setShowRegistrationFormModal(false);
                        setShowErrorModal(true);
                      }
                    } catch (error) {
                      console.error("Failed to send OTP:", error);
                      const description =
                        lang === "th"
                          ? "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง"
                          : "Failed to send OTP. Please try again.";

                      setErrorModalData({
                        status: "NETWORK_ERROR",
                        description: description,
                      });
                      setShowRegistrationFormModal(false);
                      setShowErrorModal(true);
                    } finally {
                      setIsSendingOtp(false);
                    }
                  }}
                  disabled={isSendingOtp || !email || otpCooldown > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp
                    ? lang === "th"
                      ? "กำลังส่ง..."
                      : "Sending..."
                    : otpCooldown > 0
                      ? `${t.registration.sendOtpButton} (${otpCooldown})`
                      : t.registration.sendOtpButton}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                {t.registration.otpLabel}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t.registration.otpPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={!isOtpSent}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && otp && !isRegistering) {
                    e.preventDefault();
                    const submitButton =
                      e.currentTarget.parentElement?.nextElementSibling?.querySelector(
                        "button",
                      );
                    (submitButton as HTMLButtonElement)?.click();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!email || !otp) return;

                  setIsRegistering(true);
                  try {
                    // Get registerCustomerUrl from backend response
                    const registerUrl = (verifyData as any).registerCustomerUrl;

                    if (!registerUrl) {
                      throw new Error("Register URL not available");
                    }

                    // Call Register Customer API via proxy
                    const response = await fetch(registerUrl, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                      },
                      body: JSON.stringify({
                        email,
                        emailOtp: otp,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.status === "SUCCESS") {
                      // Registration successful
                      setShowRegistrationFormModal(false);

                      // Show success modal with registration success message
                      setRegisteredEmailForModal(email);
                      setIsNewRegistration(true); // This is a NEW successful registration
                      setShowAlreadyRegisteredModal(true);

                      // Reset form
                      setEmail("");
                      setOtp("");
                      setIsOtpSent(false);
                      setOtpRefCode("");
                    } else {
                      // API returned error status
                      const description =
                        lang === "th" && data.descriptionThai
                          ? data.descriptionThai
                          : lang === "en" && data.descriptionEng
                            ? data.descriptionEng
                            : data.description ||
                              (lang === "th"
                                ? "การลงทะเบียนล้มเหลว"
                                : "Registration failed");

                      setErrorModalData({
                        status: data.status || "ERROR",
                        description: description,
                      });
                      setShowRegistrationFormModal(false);
                      setShowErrorModal(true);
                    }
                  } catch (error) {
                    console.error("Registration failed:", error);
                    const description =
                      lang === "th"
                        ? "การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง"
                        : "Registration failed. Please try again.";

                    setErrorModalData({
                      status: "NETWORK_ERROR",
                      description: description,
                    });
                    setShowRegistrationFormModal(false);
                    setShowErrorModal(true);
                  } finally {
                    setIsRegistering(false);
                  }
                }}
                disabled={!email || !otp || isRegistering}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering
                  ? lang === "th"
                    ? "กำลังลงทะเบียน..."
                    : "Registering..."
                  : t.registration.confirmButton}
              </button>
              <button
                onClick={() => {
                  setShowRegistrationFormModal(false);
                  setEmail("");
                  setOtp("");
                  setIsOtpSent(false);
                  setOtpRefCode("");
                }}
                disabled={isRegistering}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.registration.cancelButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowErrorModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="rounded-full flex items-center justify-center p-3"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                }}
              >
                <svg
                  className="text-white"
                  style={{ width: "40px", height: "40px" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h3 className="text-center text-lg font-semibold mb-2 text-red-600">
              {lang === "th" ? "เกิดข้อผิดพลาด" : "Error"}
            </h3>

            {/* Status Code */}
            {errorModalData.status && (
              <p className="text-center text-sm text-gray-500 mb-2 font-mono">
                {errorModalData.status}
              </p>
            )}

            {/* Error Description */}
            <p className="text-center text-gray-700 mb-6">
              {errorModalData.description}
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              {lang === "th" ? "ปิด" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Product Modal - Outside main container for proper overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white shadow-2xl w-full overflow-auto modal-dialog-responsive"
            style={{
              maxWidth: "1140px",
              maxHeight: "90vh",
              margin: "1.75rem",
              borderRadius: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="p-4 flex justify-end"
              style={{
                background: "#183153",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-300 transition-colors p-2"
                aria-label="Close"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                }}
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

            {/* Modal Body */}
            <div className="p-6" style={{ background: "#f7f8fb" }}>
              {/* Show loading state */}
              {isLoadingProduct ? (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600"
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
                  <p className="text-gray-600 font-semibold">
                    {lang === "th"
                      ? "กำลังโหลดข้อมูลผลิตภัณฑ์..."
                      : "Loading product data..."}
                  </p>
                </div>
              ) : productError ? (
                /* Show error state */
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <p className="text-red-600 font-semibold mb-2">
                    {lang === "th"
                      ? "ไม่สามารถโหลดข้อมูลผลิตภัณฑ์"
                      : "Failed to load product data"}
                  </p>
                  <p className="text-gray-600 text-sm">{productError}</p>
                  <button
                    onClick={handleViewProduct}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {lang === "th" ? "ลองอีกครั้ง" : "Try Again"}
                  </button>
                </div>
              ) : productData?.item ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT COLUMN - Images & Meta */}
                  <div className="text-center">
                    {/* Image Carousel */}
                    {productData.images && productData.images.length > 0 && (
                      <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                        {/* Carousel Images */}
                        <div
                          className="carousel-container relative"
                          style={{ height: "420px" }}
                        >
                          {productData.images.map((img, index) => (
                            <div
                              key={index}
                              className="absolute inset-0 transition-opacity duration-500"
                              style={{
                                opacity: index === currentSlide ? 1 : 0,
                                pointerEvents:
                                  index === currentSlide ? "auto" : "none",
                              }}
                            >
                              <Image
                                src={img.imageUrl}
                                alt={
                                  img.altText || `Product image ${index + 1}`
                                }
                                width={600}
                                height={420}
                                className="object-cover w-full"
                                style={{ height: "420px" }}
                              />
                              {img.narative && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm"
                                  style={{
                                    background:
                                      "linear-gradient(transparent, rgba(0,0,0,0.72))",
                                  }}
                                >
                                  {img.narative}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Previous Button */}
                          {totalSlides > 1 && (
                            <>
                              <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-3 transition-all hover:scale-110"
                                style={{
                                  background: "rgba(0, 0, 0, 0.5)",
                                  borderRadius: "0.5rem",
                                  zIndex: 10,
                                }}
                                aria-label="Previous image"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                              </button>

                              {/* Next Button */}
                              <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-3 transition-all hover:scale-110"
                                style={{
                                  background: "rgba(0, 0, 0, 0.5)",
                                  borderRadius: "0.5rem",
                                  zIndex: 10,
                                }}
                                aria-label="Next image"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                              </button>

                              {/* Carousel Indicators (Dots) */}
                              <div
                                className="absolute bottom-14 left-0 right-0 flex justify-center gap-2"
                                style={{ zIndex: 10 }}
                              >
                                {productData.images.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className="transition-all"
                                    style={{
                                      width:
                                        index === currentSlide ? "24px" : "8px",
                                      height: "8px",
                                      borderRadius: "4px",
                                      background:
                                        index === currentSlide
                                          ? "rgba(255, 255, 255, 0.9)"
                                          : "rgba(255, 255, 255, 0.5)",
                                    }}
                                    aria-label={`Go to image ${index + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Manufacturer & Last Update */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                          {t.labels.manufacturer}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {productData.item.orgId || "-"}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                          {t.labels.lastUpdate}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {productData.item.updatedDate
                            ? new Date(
                                productData.item.updatedDate,
                              ).toLocaleDateString(
                                lang === "th" ? "th-TH" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "-"}
                        </div>
                      </div>
                    </div>

                    {/* Product URL Link */}
                    {productData.item.propertiesObj?.productUrl && (
                      <div className="mt-3">
                        <a
                          href={productData.item.propertiesObj.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t.labels.moreDetails}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN - Product Details */}
                  <div>
                    {/* Product Title & Description */}
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      {productData.item.code || "-"}
                    </h3>
                    <p className="text-gray-600 text-lg mb-4">
                      {productData.item.description ||
                        productData.item.narrative ||
                        t.labels.noProductData}
                    </p>

                    {/* Product Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {/* Category */}
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <div className="text-2xl mb-1">🏷️</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {t.labels.productType}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {productData.item.propertiesObj?.category || "-"}
                        </div>
                      </div>

                      {/* Height */}
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <div className="text-2xl mb-1">📏</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {t.labels.height}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {productData.item.propertiesObj?.height
                            ? `${productData.item.propertiesObj.height} ${productData.item.propertiesObj.dimentionUnit || "cm"}`
                            : "-"}
                        </div>
                      </div>

                      {/* Width */}
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <div className="text-2xl mb-1">📐</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {t.labels.width}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {productData.item.propertiesObj?.width
                            ? `${productData.item.propertiesObj.width} ${productData.item.propertiesObj.dimentionUnit || "cm"}`
                            : "-"}
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <div className="text-2xl mb-1">⚖️</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {t.labels.weight}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {productData.item.propertiesObj?.weight
                            ? `${productData.item.propertiesObj.weight} ${productData.item.propertiesObj.weightUnit || "g"}`
                            : "-"}
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    {productData.item.narrative && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 text-lg mb-3">
                          {t.labels.features}
                        </h6>
                        <div className="space-y-2">
                          {productData.item.narrative
                            .split("|")
                            .map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div
                                  className="rounded-full mt-1.5"
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    background: "#6FE10A",
                                    flexShrink: 0,
                                  }}
                                />
                                <span className="text-gray-600 text-sm">
                                  {feature.trim()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-red-500 mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2M13,13H11V7h2v6m0,4H11v-2h2v2z" />
                  </svg>
                  <h5 className="text-xl font-bold text-red-600 mb-2">
                    {t.labels.noProductData} [{verifyData.productData?.status}]
                  </h5>
                  <p className="text-gray-500">{t.labels.cannotLoadProduct}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 flex justify-between items-center border-t"
              style={{
                background: "#fff",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t.labels.close}
              </button>
              {productData?.item?.propertiesObj?.supplierUrl && (
                <a
                  href={productData.item.propertiesObj.supplierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-white font-medium rounded-lg transition-colors"
                  style={{ background: "#183153", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {t.labels.supplierWebsite}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 1200px) {
          .modal-dialog-responsive {
            max-width: 95vw !important;
            margin: 0.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .modal-dialog-responsive {
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .modal-dialog-responsive > div:first-child {
            border-top-left-radius: 0 !important;
            border-top-right-radius: 0 !important;
          }
        }
      `,
        }}
      />
    </>
  );
}
