import { translations, type Language } from "@/lib/translations";

interface ContactSupportPageProps {
  searchParams: Promise<{
    serial?: string;
    pin?: string;
    brand?: string;
    lang?: string;
  }>;
}

export default async function ContactSupportPage({
  searchParams,
}: ContactSupportPageProps) {
  const params = await searchParams;
  const lang = (params.lang as Language) || "th";
  const t = translations[lang];

  const serial = params.serial || "-";
  const pin = params.pin || "-";
  const brand = params.brand || "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="rounded-full p-3"
              style={{
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              }}
            >
              <svg
                className="text-white w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H5.2L4 17.2V4H20V16M11 5H13V11H11V5M11 13H13V15H11V13Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t.labels.contactSupport}
            </h1>
          </div>
          <p className="text-gray-600">
            {lang === "th"
              ? "เราพร้อมให้ความช่วยเหลือคุณ กรุณาติดต่อทีมสนับสนุนของเราพร้อมข้อมูลด้านล่าง"
              : "We're here to help. Please contact our support team with the information below."}
          </p>
        </div>

        {/* Verification Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {lang === "th" ? "ข้อมูลการตรวจสอบ" : "Verification Details"}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">
                {t.labels.serial}:
              </span>
              <span className="text-gray-900 font-mono">{serial}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">
                {t.labels.pin}:
              </span>
              <span className="text-gray-900 font-mono">{pin}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">
                {lang === "th" ? "แบรนด์" : "Brand"}:
              </span>
              <span className="text-gray-900 font-mono">{brand}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {lang === "th" ? "ช่องทางติดต่อ" : "Contact Channels"}
          </h2>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {lang === "th" ? "อีเมล" : "Email"}
                </h3>
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  support@example.com
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === "th"
                    ? "ระบุ Serial และ Pin ในอีเมลของคุณ"
                    : "Please include Serial and Pin in your email"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {lang === "th" ? "โทรศัพท์" : "Phone"}
                </h3>
                <a
                  href="tel:+66-2-xxx-xxxx"
                  className="text-green-600 hover:text-green-800 font-semibold"
                >
                  +66 2 XXX XXXX
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === "th"
                    ? "จันทร์ - ศุกร์, 9:00 - 18:00 น."
                    : "Mon - Fri, 9:00 AM - 6:00 PM"}
                </p>
              </div>
            </div>

            {/* Line */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">LINE</h3>
                <a
                  href="https://line.me/ti/p/@example"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 font-semibold"
                >
                  @example
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === "th"
                    ? "แชทกับเราผ่าน LINE Official Account"
                    : "Chat with us via LINE Official Account"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div
          className="rounded-lg p-4 border-l-4 border-orange-500"
          style={{
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z" />
            </svg>
            <div>
              <h3 className="font-semibold text-orange-800 mb-1">
                {lang === "th" ? "โปรดทราบ" : "Please Note"}
              </h3>
              <p className="text-sm text-orange-900">
                {lang === "th"
                  ? "กรุณาเตรียมข้อมูล Serial, Pin และรูปภาพของผลิตภัณฑ์ไว้เพื่อการตรวจสอบที่รวดเร็วยิ่งขึ้น เวลาตอบกลับโดยเฉลี่ย 24-48 ชั่วโมง"
                  : "Please have your Serial, Pin, and product photos ready for faster verification. Average response time is 24-48 hours."}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" />
            </svg>
            {lang === "th" ? "กลับ" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
