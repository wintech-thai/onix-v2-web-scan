"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { VerifyViewModel, ProductApiResponse } from "@/lib/types";
import { translations, type Language } from "@/lib/translations";

interface VerifyViewProps {
  verifyData: VerifyViewModel;
}

export default function VerifyView({ verifyData }: VerifyViewProps) {
  // ฟังก์ชันแปลงข้อมูล (Mapper)
  const mapDataToStructure = (
    apiData: any,
    fallbackData: any
  ): ProductApiResponse => {
    // 1. ลองหาข้อมูลจาก API ที่โหลดมาใหม่ (ถ้ามี)
    const source = apiData?.ScanItem || apiData?.item || apiData;

    // 2. ข้อมูลสำรองจากหน้าเว็บ (Backup) **(จุดที่แก้: เพิ่ม ScanItem ตัวใหญ่)**
    // any cast เพื่อเลี่ยงปัญหา Type ถ้า interface ในไฟล์ types.ts ยังไม่ได้แก้
    const backup =
      fallbackData?.scanData || (fallbackData as any)?.ScanItem || {};

    // 3. ข้อมูล Properties เดิม (ถ้ามี)
    const backupProps = fallbackData?.productData?.item?.propertiesObj;

    // ดึงค่าทีละตัว (เริ่มจาก API -> Backup -> ขีด)
    const code =
      source?.ProductCode ||
      source?.code ||
      backup?.ProductCode ||
      backup?.Serial ||
      "-";
    const name =
      source?.ProductDesc || source?.name || backup?.ProductDesc || code;
    const orgId = source?.OrgId || source?.orgId || backup?.OrgId || "-";
    const updatedDate =
      source?.CreatedDate ||
      source?.RegisteredDate ||
      source?.updatedDate ||
      backup?.CreatedDate;

    // ข้อมูลเสริม (ถ้าใน ScanItem ไม่มี ก็จะแสดงเป็น - หรือค่าว่าง)
    const narrative = source?.Narrative || source?.narrative || "";
    const category = source?.Category || backupProps?.category || "-";

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
          height: source?.Height || 0,
          width: source?.Width || 0,
          weight: source?.Weight || 0,
          dimentionUnit: source?.DimensionUnit || "",
          weightUnit: source?.WeightUnit || "",
        },
      },
      images: source?.Images || source?.images || [],
    };
  };

  // State: เริ่มต้นแปลงข้อมูลทันที (จะเห็นข้อมูลตั้งแต่วินาทีแรก)
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    () => {
      // Debug ดูว่า verifyData มีอะไรบ้าง (กด F12 ดูได้)
      console.log("🔹 Initial verifyData:", verifyData);
      return mapDataToStructure(verifyData.productData, verifyData);
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  // Auto-Fetch
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

          // ถ้า API Error (เช่น OTP_INVALID) ให้หยุด! ใช้ข้อมูลเดิมที่มีอยู่ต่อไป
          if (
            rawData.status !== "SUCCESS" &&
            rawData.status !== "OK" &&
            !rawData.item &&
            !rawData.ProductCode
          ) {
            console.warn("⚠️ API Error (Using backup data):", rawData.status);
            return;
          }

          // ถ้าข้อมูลดี ค่อยอัปเดตทับ
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

  const lang = (verifyData.language || "th") as Language;
  const t = translations[lang];
  const item = productData?.item;
  const props = item?.propertiesObj;

  const imageToShow = productData?.images?.[1] || productData?.images?.[0];

  const Icons = {
    pencil: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-amber-500 mb-1"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    clipboard: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400 mb-1"
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </svg>
    ),
    triangle: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400 mb-1"
      >
        <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      </svg>
    ),
    scale: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400 mb-1"
      >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  };

  // Loading Screen (แสดงเฉพาะตอนแรกถ้ายังไม่มีข้อมูลจริงๆ)
  if (isLoading && (!item || item.code === "-")) {
    return (
      <div className="min-h-[50vh] bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] bg-gray-50 p-2 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full mx-auto overflow-hidden animate-fadeIn">
        <div className="p-5 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left: Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="bg-slate-100 rounded-2xl overflow-hidden shadow-lg w-64 h-80 relative border border-slate-200">
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
            </div>

            {/* Right: Details */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center md:text-left">
                    {/* รหัสสินค้า */}
                    {item?.code || verifyData.scanData?.serial || "-"}
                  </h1>
                  {(verifyData.status === "VALID" ||
                    verifyData.status === "SUCCESS") && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-base md:text-lg text-center md:text-left">
                  {/* ชื่อสินค้า */}
                  {item?.name || "-"}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    {Icons.pencil}
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
                    ประเภทสินค้า
                  </div>
                  <div className="text-xs text-slate-600 mt-1 truncate">
                    {props?.category || "-"}
                  </div>
                </div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    {Icons.clipboard}
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {t.labels.height}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {props?.height ? `${props.height}` : "-"}
                  </div>
                </div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    {Icons.triangle}
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {t.labels.width}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {props?.width ? `${props.width}` : "-"}
                  </div>
                </div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    {Icons.scale}
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {t.labels.weight}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {props?.weight ? `${props.weight}` : "-"}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-lg">
                  คุณสมบัติเด่น
                </h3>
                <div className="space-y-2">
                  {item?.narrative ? (
                    item.narrative.split("|").map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm">
                          {feat.trim()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm italic">
                      - ไม่มีข้อมูล -
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center md:text-left">
                  <div className="text-slate-500 text-xs mb-1">ผู้ผลิต</div>
                  <div className="font-semibold text-slate-800 text-sm truncate">
                    {item?.orgId || "-"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center md:text-left">
                  <div className="text-slate-500 text-xs mb-1">
                    อัปเดตล่าสุด
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
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
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="bg-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 gap-2 text-center md:text-left">
          <span className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Please Scan
          </span>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
          >
            นโยบายความเป็นส่วนตัว
          </a>
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
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
