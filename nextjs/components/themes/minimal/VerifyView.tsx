"use client";

import { useEffect, useState } from "react";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";

// --- MINIMAL THEME CONFIG (Black & White & Subtle Colors) ---
const MINIMAL_THEME = {
  black: "#171717",
  gray: "#737373",
  lightGray: "#f5f5f5",
  border: "#e5e5e5",
  success: "#15803d", // Deep Green (Minimal)
  error: "#b91c1c", // Deep Red (Minimal)
  warning: "#b45309", // Deep Amber (Minimal)
};

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

// 🟢 Helper: Minimal Social Link
const SocialLink = ({ href, icon, label }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-neutral-400 hover:text-black transition-colors duration-300 p-2"
  >
    {icon}
  </a>
);

export default function VerifyViewMinimal({ verifyData }: VerifyViewProps) {
  // --- STATE & LOGIC ---
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    verifyData.productData
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Registration modal state
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] =
    useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [showRegistrationFormModal, setShowRegistrationFormModal] =
    useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({
    status: "",
    description: "",
  });
  const [registeredEmailForModal, setRegisteredEmailForModal] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];

  // --- HANDLERS ---
  const handleRegisterClick = async () => {
    setShowRegistrationFormModal(true);
  };

  const handleViewProduct = async () => {
    if (productData) {
      setIsModalOpen(true);
      return;
    }
    setIsLoadingProduct(true);
    setTimeout(() => {
      setIsLoadingProduct(false);
      setIsModalOpen(true);
    }, 1000);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1000);
  };

  // --- STATUS LOGIC ---
  const status = verifyData.status?.toUpperCase() || "UNKNOWN";
  const isSuccess = ["OK", "SUCCESS", "VALID"].includes(status);
  const isWarning = ["ALREADY_REGISTERED", "EXPIRED"].includes(status);
  const isError =
    (!isSuccess && !isWarning) ||
    ["DECRYPT_ERROR", "DECRYPT_FAIL"].includes(status);

  const statusTitle =
    t.titles[status as keyof typeof t.titles] || t.titles.UNKNOWN;
  const statusMessages =
    t.messages[status as keyof typeof t.messages] || t.messages.UNKNOWN;

  // --- UI ICONS ---
  const statusIcon = isSuccess ? (
    <svg
      className="w-12 h-12 text-emerald-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="square"
        strokeLinejoin="miter"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ) : isWarning ? (
    <svg
      className="w-12 h-12 text-amber-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="square"
        strokeLinejoin="miter"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ) : (
    <svg
      className="w-12 h-12 text-neutral-800"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="square"
        strokeLinejoin="miter"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <>
      <div className="flex items-center justify-center w-full h-full p-4 bg-[#fafafa]">
        {/* ✨ MAIN CARD: Minimalist ✨ */}
        <div className="w-full max-w-[450px] bg-white border border-neutral-200 p-8 flex flex-col items-center animate-in fade-in duration-500 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] rounded-sm">
          {/* 1. HEADER (Clean & Simple) */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-neutral-50 border border-neutral-100">
              {statusIcon}
            </div>

            <h1 className="text-xl font-medium tracking-tight text-neutral-900 mb-2 uppercase">
              {statusTitle}
            </h1>

            <div className="space-y-1">
              {statusMessages.map((msg, idx) => (
                <p key={idx} className="text-sm text-neutral-500 font-light">
                  {msg}
                </p>
              ))}
            </div>
          </div>

          {/* 2. DATA LIST (Clean Table Style) */}
          {(verifyData.scanData?.serial || verifyData.scanData?.pin) && (
            <div className="w-full mb-8 border-t border-b border-neutral-100 py-4 space-y-3">
              {/* Serial Row */}
              {verifyData.scanData.serial && (
                <div
                  className="flex justify-between items-center group cursor-pointer"
                  onClick={() =>
                    copyToClipboard(verifyData.scanData!.serial!, "serial")
                  }
                >
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    Serial
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-800">
                      {verifyData.scanData.serial}
                    </span>
                    {copiedField === "serial" ? (
                      <span className="text-[10px] text-emerald-600">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Pin Row */}
              {verifyData.scanData.pin && (
                <div
                  className="flex justify-between items-center group cursor-pointer"
                  onClick={() =>
                    copyToClipboard(verifyData.scanData!.pin!, "pin")
                  }
                >
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    Pin Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-800">
                      {verifyData.scanData.pin}
                    </span>
                    {copiedField === "pin" ? (
                      <span className="text-[10px] text-emerald-600">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Date Row (Only if warning) */}
              {isWarning && verifyData.scanData?.registeredDate && (
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-neutral-100">
                  <span className="text-xs uppercase tracking-widest text-amber-600 font-medium">
                    Registered
                  </span>
                  <span className="text-xs text-amber-700 font-mono">
                    {new Date(
                      verifyData.scanData.registeredDate
                    ).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3. ACTIONS (Solid Black & Outlined Buttons) */}
          <div className="w-full space-y-3">
            {isSuccess || isWarning ? (
              <button
                onClick={handleViewProduct}
                disabled={isLoadingProduct}
                className="w-full py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
              >
                {isLoadingProduct
                  ? "PROCESSING..."
                  : t.labels.viewProduct.toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() =>
                  (window.location.href = `/contact-support?lang=${lang}`)
                }
                className="w-full py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-all rounded-sm"
              >
                {t.labels.contactSupport.toUpperCase()}
              </button>
            )}

            {(status === "SUCCESS" || status === "ALREADY_REGISTERED") && (
              <button
                onClick={handleRegisterClick}
                disabled={isCheckingRegistration}
                className="w-full py-3 border border-neutral-200 text-neutral-600 text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 transition-all rounded-sm"
              >
                {isCheckingRegistration
                  ? "CHECKING..."
                  : t.registration.button.toUpperCase()}
              </button>
            )}
          </div>

          {/* 4. FOOTER (Minimal Icons) */}
          <div className="mt-8 flex justify-center gap-6 border-t border-neutral-50 pt-6 w-full">
            <SocialLink
              href="#"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              }
              label="Facebook"
            />
            <SocialLink
              href="#"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              }
              label="Instagram"
            />
            <SocialLink
              href="#"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v10.95c0 4.61-5.15 7.42-8.97 5.41-2.9-1.52-4.23-5.26-2.91-8.35 1.05-2.45 3.52-3.95 6.16-3.83v4.16c-1.39.02-2.72.93-3.1 2.29-.39 1.4.38 2.87 1.76 3.25 1.47.41 3.01-.45 3.42-1.92.09-.32.12-.66.11-1.01v-19.1z" />
                </svg>
              }
              label="Tiktok"
            />
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg border border-neutral-200 shadow-xl p-0 overflow-hidden rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-semibold text-neutral-900 uppercase tracking-wide text-sm">
                Product Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              {isLoadingProduct ? (
                "Loading..."
              ) : (
                <>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">
                    {productData?.item?.description}
                  </h2>
                  <div className="text-sm text-neutral-500 font-mono">
                    Code: {productData?.item?.code}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
          onClick={() => setShowRegistrationFormModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm border border-neutral-200 shadow-xl p-8 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-neutral-900 uppercase tracking-wide mb-6 text-center">
              Registration
            </h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="OTP"
                  className="flex-1 p-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button className="px-4 bg-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-300 rounded-sm">
                  SEND
                </button>
              </div>
              <button className="w-full py-3 bg-black text-white text-sm font-medium hover:opacity-80 mt-2 rounded-sm">
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti (Optional: Black & White confetti for Minimal theme) */}
      <style
        dangerouslySetInnerHTML={{
          __html: ` @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `,
        }}
      />
    </>
  );
}
