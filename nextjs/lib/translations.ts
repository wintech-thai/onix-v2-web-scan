/**
 * Translation dictionaries for Thai and English
 * Default language: Thai (th)
 */

export type Language = 'th' | 'en';

export interface Translations {
  // Status badges
  statusBadge: {
    success: string;
    warning: string;
    error: string;
  };
  
  // Title messages by status
  titles: {
    VALID: string;
    SUCCESS: string;
    OK: string;
    ALREADY_REGISTERED: string;
    NOTFOUND: string;
    PARAM_MISSING: string;
    PARAMETER_MISSING: string;
    NO_DATA: string;
    MISSING_THEME: string;
    MISSING_ORG: string;
    DECRYPT_FAIL: string;
    DECRYPT_ERROR: string;
    INVALID: string;
    FAILED: string;
    EXPIRED: string;
    UNKNOWN: string;
  };
  
  // Detailed messages by status
  messages: {
    VALID: string[];
    SUCCESS: string[];
    OK: string[];
    ALREADY_REGISTERED: string[];
    NOTFOUND: string[];
    PARAM_MISSING: string[];
    PARAMETER_MISSING: string[];
    NO_DATA: string[];
    MISSING_THEME: string[];
    MISSING_ORG: string[];
    DECRYPT_FAIL: string[];
    DECRYPT_ERROR: string[];
    INVALID: string[];
    FAILED: string[];
    EXPIRED: string[];
    UNKNOWN: string[];
  };
  
  // Page content
  title: string;
  subtitle: string;
  noMessage: string;
  scanDetails: string;
  scanId: string;
  organization: string;
  productId: string;
  batchNumber: string;
  serialNumber: string;
  location: string;
  timestamp: string;
  metadata: string;
  ttlInfo: string;
  ttl: string;
  seconds: string;
  createdDate: string;
  expiryDate: string;
  productInfo: string;
  productCode: string;
  category: string;
  manufacturer: string;
  additionalInfo: string;
  productImages: string;
  footer: string;
  theme: string;
  
  // UI labels
  labels: {
    serial: string;
    pin: string;
    registeredAt: string;
    viewProduct: string;
    contactSupport: string;
    close: string;
    manufacturer: string;
    lastUpdate: string;
    moreDetails: string;
    productType: string;
    height: string;
    width: string;
    weight: string;
    features: string;
    supplierWebsite: string;
    noProductData: string;
    cannotLoadProduct: string;
    copySerial: string;
    copyPin: string;
  };
  
  // Alert messages
  alerts: {
    successTitle: string;
    successMessage: string;
    warningTitle: string;
    errorTitle: string;
    errorMessage: string;
  };
  
  // Language toggle
  languageToggle: {
    thai: string;
    english: string;
  };
}

export const translations: Record<Language, Translations> = {
  th: {
    // Page content
    title: 'ระบบตรวจสอบความแท้',
    subtitle: 'ตรวจสอบความถูกต้องและความแท้ของสินค้า',
    noMessage: 'ไม่มีข้อความ',
    scanDetails: 'รายละเอียดการสแกน',
    scanId: 'รหัสการสแกน',
    organization: 'องค์กร',
    productId: 'รหัสสินค้า',
    batchNumber: 'หมายเลขล็อต',
    serialNumber: 'หมายเลขซีเรียล',
    location: 'สถานที่',
    timestamp: 'เวลาที่สแกน',
    metadata: 'ข้อมูลเพิ่มเติม',
    ttlInfo: 'ข้อมูลระยะเวลา',
    ttl: 'ระยะเวลาใช้งาน (TTL)',
    seconds: 'วินาที',
    createdDate: 'วันที่สร้าง',
    expiryDate: 'วันที่หมดอายุ',
    productInfo: 'ข้อมูลสินค้า',
    productCode: 'รหัสสินค้า',
    category: 'ประเภทสินค้า',
    manufacturer: 'ผู้ผลิต',
    additionalInfo: 'ข้อมูลเพิ่มเติม',
    productImages: 'รูปภาพสินค้า',
    footer: 'ขอบคุณที่ใช้ระบบตรวจสอบความแท้',
    theme: 'ธีม',
    
    statusBadge: {
      success: 'ตรวจสอบสำเร็จ',
      warning: 'ระวัง',
      error: 'พบปัญหา',
    },
    
    titles: {
      VALID: 'ยืนยันแล้วว่าเป็นสินค้าแท้',
      SUCCESS: 'ยืนยันแล้วว่าเป็นสินค้าแท้',
      OK: 'ยืนยันแล้วว่าเป็นสินค้าแท้',
      ALREADY_REGISTERED: 'โค้ดนี้ถูกใช้ไปแล้ว',
      NOTFOUND: 'ไม่พบโค้ดนี้ในระบบ',
      PARAM_MISSING: 'ข้อมูลที่ส่งมาไม่ครบ',
      PARAMETER_MISSING: 'พารามิเตอร์หายไป',
      NO_DATA: 'ไม่มีข้อมูล',
      MISSING_THEME: 'ไม่มีข้อมูล theme ในลิงค์',
      MISSING_ORG: 'ไม่มีข้อมูล org ในลิงค์',
      DECRYPT_FAIL: 'ไม่สามารถถอดรหัสข้อมูลได้',
      DECRYPT_ERROR: 'ไม่สามารถถอดรหัสข้อมูลได้',
      INVALID: 'โค้ดไม่ถูกต้อง',
      FAILED: 'การตรวจสอบล้มเหลว',
      EXPIRED: 'โค้ดนี้หมดอายุแล้ว',
      UNKNOWN: 'สถานะไม่แน่ชัด กรุณาติดต่อทีมงาน',
    },
    
    messages: {
      VALID: ['ขอบคุณที่ตรวจสอบ — คุณกำลังใช้สินค้าของแท้'],
      SUCCESS: ['ขอบคุณที่ตรวจสอบ — คุณกำลังใช้สินค้าของแท้'],
      OK: ['ขอบคุณที่ตรวจสอบ — คุณกำลังใช้สินค้าของแท้'],
      ALREADY_REGISTERED: [
        'โค้ดนี้ถูกใช้งานไปก่อนหน้าหรืออาจถูกลงทะเบียนโดยผู้อื่น',
        'กรุณาติดต่อทีมงานเพื่อช่วยตรวจสอบเพิ่มเติม'
      ],
      NOTFOUND: ['ไม่พบข้อมูลสินค้านี้ในระบบ สินค้าอาจไม่ได้ลงทะเบียนในระบบ'],
      PARAM_MISSING: ['ข้อมูลที่จำเป็นสำหรับการตรวจสอบไม่ครบถ้วน ไม่สามารถดำเนินการตรวจสอบความแท้ได้'],
      PARAMETER_MISSING: [
        'พารามิเตอร์ที่ส่งมาตรวจสอบไม่ถูกต้องหรือหายไป',
        'กรุณาตรวจสอบลิงก์หรือ QR Code ที่ใช้ใหม่อีกครั้ง'
      ],
      NO_DATA: ['ไม่มีข้อมูลสำหรับการตรวจสอบ ลิงก์หรือ QR Code อาจไม่ถูกต้อง หรือข้อมูลเสียหาย'],
      MISSING_THEME: ['ไม่มีข้อมูล theme ในลิงก์'],
      MISSING_ORG: ['ไม่มีข้อมูล org ในลิงก์'],
      DECRYPT_FAIL: ['ไม่สามารถอ่านข้อมูลสินค้าได้ ข้อมูลอาจเสียหายหรือไม่ถูกต้อง'],
      DECRYPT_ERROR: ['ไม่สามารถอ่านข้อมูลสินค้าได้ ข้อมูลอาจเสียหายหรือไม่ถูกต้อง'],
      INVALID: ['ข้อมูลสินค้าไม่ถูกต้องหรือไม่ตรงกับระบบ อาจเป็นสินค้าปลอมหรือข้อมูลถูกดัดแปลง'],
      FAILED: ['การตรวจสอบความแท้ล้มเหลว เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้งหรือติดต่อทีมงาน'],
      EXPIRED: ['โค้ดยืนยันนี้หมดอายุแล้ว กรุณาขอโค้ดใหม่'],
      UNKNOWN: ['ไม่สามารถสรุปผลได้จากข้อมูลที่ได้รับ'],
    },
    
    labels: {
      serial: 'Serial',
      pin: 'Pin',
      registeredAt: 'Registered At',
      viewProduct: 'ดูข้อมูลสินค้า',
      contactSupport: 'ติดต่อทีมดูแล',
      close: 'ปิด',
      manufacturer: 'ผู้ผลิต',
      lastUpdate: 'อัปเดตล่าสุด',
      moreDetails: 'รายละเอียดเพิ่มเติมของสินค้า',
      productType: 'ประเภทสินค้า',
      height: 'ความสูง',
      width: 'ความกว้าง',
      weight: 'น้ำหนัก',
      features: 'คุณสมบัติเด่น',
      supplierWebsite: 'เว็บไซต์ผู้ผลิต',
      noProductData: 'ไม่พบข้อมูลสินค้า',
      cannotLoadProduct: 'ขออภัย ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้',
      copySerial: 'Copy Serial',
      copyPin: 'Copy Pin',
    },
    
    alerts: {
      successTitle: 'ขอแสดงความยินดี!',
      successMessage: 'เพลิดเพลินกับสิทธิพิเศษและข้อเสนอพิเศษของเรา',
      warningTitle: 'ต้องระวัง!',
      errorTitle: 'ต้องการความช่วยเหลือ?',
      errorMessage: 'กรุณาติดต่อทีมงาน',
    },
    
    languageToggle: {
      thai: 'ไทย',
      english: 'English',
    },
  },
  
  en: {
    // Page content
    title: 'Verification System',
    subtitle: 'Verify product authenticity and integrity',
    noMessage: 'No message',
    scanDetails: 'Scan Details',
    scanId: 'Scan ID',
    organization: 'Organization',
    productId: 'Product ID',
    batchNumber: 'Batch Number',
    serialNumber: 'Serial Number',
    location: 'Location',
    timestamp: 'Timestamp',
    metadata: 'Additional Information',
    ttlInfo: 'Time Information',
    ttl: 'Time To Live (TTL)',
    seconds: 'seconds',
    createdDate: 'Created Date',
    expiryDate: 'Expiry Date',
    productInfo: 'Product Information',
    productCode: 'Product Code',
    category: 'Category',
    manufacturer: 'Manufacturer',
    additionalInfo: 'Additional Information',
    productImages: 'Product Images',
    footer: 'Thank you for using our verification system',
    theme: 'Theme',
    
    statusBadge: {
      success: '✓ Verified',
      warning: '⚠️ Warning',
      error: '⚠️ Issue Detected',
    },
    
    titles: {
      VALID: 'Genuine Product Confirmed',
      SUCCESS: 'Genuine Product Confirmed',
      OK: 'Genuine Product Confirmed',
      ALREADY_REGISTERED: 'Code Already Used',
      NOTFOUND: 'Code Not Found',
      PARAM_MISSING: 'Missing Required Data',
      PARAMETER_MISSING: 'Missing Parameters',
      NO_DATA: 'No Data Available',
      MISSING_THEME: 'Theme Information Missing',
      MISSING_ORG: 'Organization Information Missing',
      DECRYPT_FAIL: 'Decryption Failed',
      DECRYPT_ERROR: 'Decryption Failed',
      INVALID: 'Invalid Code',
      FAILED: 'Verification Failed',
      EXPIRED: 'Code Expired',
      UNKNOWN: 'Unknown Status - Please Contact Support',
    },
    
    messages: {
      VALID: ['Thank you for verifying — You are using a genuine product'],
      SUCCESS: ['Thank you for verifying — You are using a genuine product'],
      OK: ['Thank you for verifying — You are using a genuine product'],
      ALREADY_REGISTERED: [
        'This code has been used before or may have been registered by someone else',
        'Please contact support for further verification'
      ],
      NOTFOUND: ['This product was not found in the system. It may not be registered'],
      PARAM_MISSING: ['Required verification data is incomplete. Cannot proceed with authenticity verification'],
      PARAMETER_MISSING: [
        'The verification parameters are incorrect or missing',
        'Please check the link or QR Code and try again'
      ],
      NO_DATA: ['No verification data available. The link or QR Code may be invalid or corrupted'],
      MISSING_THEME: ['Theme information is missing from the link'],
      MISSING_ORG: ['Organization information is missing from the link'],
      DECRYPT_FAIL: ['Cannot read product data. Data may be corrupted or invalid'],
      DECRYPT_ERROR: ['Cannot read product data. Data may be corrupted or invalid'],
      INVALID: ['Product data is invalid or does not match the system. May be counterfeit or tampered'],
      FAILED: ['Authenticity verification failed. System error occurred. Please try again or contact support'],
      EXPIRED: ['This verification code has expired. Please request a new code'],
      UNKNOWN: ['Unable to determine result from received data'],
    },
    
    labels: {
      serial: 'Serial',
      pin: 'Pin',
      registeredAt: 'Registered At',
      viewProduct: 'View Product',
      contactSupport: 'Contact Support',
      close: 'Close',
      manufacturer: 'Manufacturer',
      lastUpdate: 'Last Update',
      moreDetails: 'More Product Details',
      productType: 'Product Type',
      height: 'Height',
      width: 'Width',
      weight: 'Weight',
      features: 'Key Features',
      supplierWebsite: 'Supplier Website',
      noProductData: 'Product Data Not Found',
      cannotLoadProduct: 'Sorry, unable to load product data at this time',
      copySerial: 'Copy Serial',
      copyPin: 'Copy Pin',
    },
    
    alerts: {
      successTitle: 'Congratulations!',
      successMessage: 'Enjoy our exclusive benefits and special offers',
      warningTitle: 'Caution!',
      errorTitle: 'Need Help?',
      errorMessage: 'Please contact support',
    },
    
    languageToggle: {
      thai: 'ไทย',
      english: 'English',
    },
  },
};

/**
 * Get translations for specified language
 * @param lang Language code (th or en)
 * @returns Translation object
 */
export function getTranslations(lang: Language = 'th'): Translations {
  return translations[lang] || translations.th;
}

/**
 * Helper to get status-specific title
 */
export function getStatusTitle(status: string, lang: Language = 'th'): string {
  const t = getTranslations(lang);
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  return (t.titles as any)[normalizedStatus] || t.titles.UNKNOWN;
}

/**
 * Helper to get status-specific messages
 */
export function getStatusMessages(status: string, lang: Language = 'th'): string[] {
  const t = getTranslations(lang);
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  return (t.messages as any)[normalizedStatus] || t.messages.UNKNOWN;
}
