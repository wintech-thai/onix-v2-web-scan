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

  const mapDataToStructure = (
    apiData: any,
    fallbackData: any
  ): ProductApiResponse => {
    const source = apiData?.ScanItem || apiData?.item || apiData;
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
          height: source?.propertiesObj?.height || 0,
          width: source?.propertiesObj?.width || 0,
          weight: source?.propertiesObj?.weight || 0,
          dimentionUnit:
            source?.propertiesObj?.dimensionUnit || source?.DimensionUnit || "",
          weightUnit:
            source?.propertiesObj?.weightUnit || source?.WeightUnit || "",
        },
      },
      images: source?.Images || source?.images || [],
    };
  };

  const [productData, setProductData] = useState<ProductApiResponse | null>(
    () => {
      return mapDataToStructure(verifyData.productData, verifyData);
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    console.log("Register button clicked");
    alert("ระบบลงทะเบียนกำลังจะเปิดใช้งานเร็วๆ นี้");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!verifyData.productUrl) return;

      setIsLoading(true);
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
          ) {
            return;
          }

          if (
            rawData.status !== "SUCCESS" &&
            rawData.status !== "OK" &&
            !hasProductData
          ) {
            return;
          }
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

  useEffect(() => {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }

    const status = verifyData.status?.toUpperCase();

    if (status === "SUCCESS" || status === "VALID") {
      const greenColors = ["#22c55e", "#16a34a", "#15803d", "#86efac"];
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: greenColors,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: greenColors,
        });
      }, 250);

      confettiIntervalRef.current = interval;
    }

    return () => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
    };
  }, [verifyData.status]);

  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];
  const item = productData?.item;
  const props = item?.propertiesObj;

  const imageToShow = productData?.images?.[1] || productData?.images?.[0];

  // ✅ เช็คสถานะ Error
  const status = verifyData.status?.toUpperCase();
  const isDecryptError =
    status === "DECRYPT_ERROR" ||
    status === "DECRYPT_FAIL" ||
    status === "INVALID_SIGNATURE";

  // 🔴 UI สำหรับกรณี Decrypt Error
  if (isDecryptError) {
    return (
      <div className="min-h-[60vh] w-full p-4 flex items-center justify-center bg-gray-50/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fadeIn border border-red-100">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
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
          <p className="text-gray-500 mb-6 text-sm">
            {lang === "th"
              ? "รหัสสินค้าไม่ถูกต้องหรือถูกแก้ไข กรุณาตรวจสอบ QR Code อีกครั้ง"
              : "Invalid data or corrupted code. Please check the QR code again."}
          </p>
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

  if (isLoading && (!item || item.code === "-")) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const Icons = {
    pencil: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-amber-500 mb-1"
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
        className="w-4 h-4 text-slate-400 mb-1"
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
        className="w-4 h-4 text-slate-400 mb-1"
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
        className="w-4 h-4 text-slate-400 mb-1"
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

  return (
    <div className="min-h-[60vh] w-full p-4 flex items-center justify-center bg-gray-50/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-fadeIn">
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            {/* --- Left Column: Image + Meta --- */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
              {/* Image Container */}
              <div className="bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 relative w-full aspect-video md:aspect-square">
                {imageToShow ? (
                  <Image
                    src={imageToShow.imageUrl}
                    alt="Product"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Manufacturer & Update */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-left">
                  <div className="text-slate-400 text-[10px] mb-0.5">
                    ผู้ผลิต
                  </div>
                  <div className="font-semibold text-slate-800 text-xs truncate">
                    {item?.orgId || "-"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-left">
                  <div className="text-slate-400 text-[10px] mb-0.5">
                    อัปเดตล่าสุด
                  </div>
                  <div className="font-semibold text-slate-800 text-xs truncate">
                    {item?.updatedDate
                      ? new Date(item.updatedDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Serial & PIN (Left Column - Below Meta) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-left">
                  <div className="text-slate-400 text-[10px] mb-0.5 font-semibold">
                    Serial Number
                  </div>
                  <div className="font-bold text-slate-800 text-xs truncate font-mono">
                    {verifyData.scanData?.serial || "-"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-left">
                  <div className="text-slate-400 text-[10px] mb-0.5 font-semibold">
                    PIN
                  </div>
                  <div className="font-bold text-slate-800 text-xs truncate font-mono">
                    {verifyData.scanData?.pin || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Column: Details --- */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {item?.code || verifyData.scanData?.serial || "-"}
                  </h1>
                  {(status === "VALID" || status === "SUCCESS") && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm">{item?.name || "-"}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-left hover:shadow-sm transition-all">
                  <div className="flex justify-start">{Icons.pencil}</div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    ประเภท
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    {props?.category || "-"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-left">
                  <div className="flex justify-start">{Icons.clipboard}</div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {t.labels.height}
                  </div>
                  <div className="text-xs text-slate-600">
                    {props?.height ? `${props.height}` : "-"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-left">
                  <div className="flex justify-start">{Icons.triangle}</div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {t.labels.width}
                  </div>
                  <div className="text-xs text-slate-600">
                    {props?.width ? `${props.width}` : "-"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-left">
                  <div className="flex justify-start">{Icons.scale}</div>
                  <div className="font-semibold text-slate-800 text-xs mt-1">
                    {t.labels.weight}
                  </div>
                  <div className="text-xs text-slate-600">
                    {props?.weight ? `${props.weight}` : "-"}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex-grow">
                <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                  คุณสมบัติเด่น
                </h3>
                <div className="space-y-1.5">
                  {item?.narrative ? (
                    item.narrative.split("|").map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        <span className="text-slate-600 text-xs leading-relaxed">
                          {feat.trim()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs italic text-center py-2">
                      - ไม่มีข้อมูลคุณสมบัติ -
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                <button
                  onClick={handleRegister}
                  className="w-full py-2.5 px-6 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  }}
                >
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
                  {lang === "th" ? "ลงทะเบียนสินค้า" : "Register Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}