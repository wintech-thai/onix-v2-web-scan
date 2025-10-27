import {
  translations,
  getStatusTitle,
  getStatusMessages,
} from "../translations";

describe("Translations Module", () => {
  describe("Translation Structure", () => {
    it("should have translations for both Thai and English", () => {
      expect(translations).toHaveProperty("th");
      expect(translations).toHaveProperty("en");
    });

    it("should have all required top-level keys in Thai translations", () => {
      const thaiKeys = Object.keys(translations.th);
      expect(thaiKeys).toContain("title");
      expect(thaiKeys).toContain("scanDetails");
      expect(thaiKeys).toContain("titles");
      expect(thaiKeys).toContain("messages");
      expect(thaiKeys).toContain("registration");
    });

    it("should have all required top-level keys in English translations", () => {
      const englishKeys = Object.keys(translations.en);
      expect(englishKeys).toContain("title");
      expect(englishKeys).toContain("scanDetails");
      expect(englishKeys).toContain("titles");
      expect(englishKeys).toContain("messages");
      expect(englishKeys).toContain("registration");
    });
  });

  describe("Thai Translations", () => {
    const th = translations.th;

    it("should have correct title translation", () => {
      expect(th.title).toBeDefined();
      expect(typeof th.title).toBe("string");
    });

    it("should have scan details translations", () => {
      expect(th.scanDetails).toBeDefined();
      expect(th.serialNumber).toBeDefined();
      expect(th.pin).toBeDefined();
      expect(th.organization).toBeDefined();
    });

    it("should have product and view translations", () => {
      expect(th.viewProduct).toBeDefined();
      expect(th.noProductData).toBeDefined();
    });

    it("should have status titles for all status codes", () => {
      expect(th.titles.VALID).toBe("ตรวจสอบสำเร็จ");
      expect(th.titles.SUCCESS).toBe("ตรวจสอบสำเร็จ");
      expect(th.titles.OK).toBe("ตรวจสอบสำเร็จ");
      expect(th.titles.ALREADY_REGISTERED).toBe("ระวัง");
      expect(th.titles.EXPIRED).toBe("ระวัง");
      expect(th.titles.INVALID).toBe("พบปัญหา");
      expect(th.titles.ERROR).toBe("พบปัญหา");
      expect(th.titles.FAILED).toBe("พบปัญหา");
      expect(th.titles.UNKNOWN).toBe("ไม่ทราบสถานะ");
    });

    it("should have registration translations", () => {
      expect(th.registration.button).toBe("ลงทะเบียน");
      expect(th.registration.alreadyRegisteredLine1).toBe(
        "สินค้านี้ได้ลงทะเบียนไปแล้ว",
      );
      expect(th.registration.alreadyRegisteredLine2).toBeDefined();
      expect(th.registration.emailLabel).toBe("อีเมล");
      expect(th.registration.otpLabel).toBe("รหัส OTP");
      expect(th.registration.sendOtpButton).toBe("ส่ง OTP");
      expect(th.registration.confirmButton).toBe("ยืนยัน");
      expect(th.registration.cancelButton).toBe("ยกเลิก");
    });
  });

  describe("English Translations", () => {
    const en = translations.en;

    it("should have correct title translation", () => {
      expect(en.title).toBeDefined();
      expect(typeof en.title).toBe("string");
    });

    it("should have scan details translations", () => {
      expect(en.scanDetails).toBeDefined();
      expect(en.serialNumber).toBeDefined();
      expect(en.pin).toBeDefined();
      expect(en.organization).toBeDefined();
    });

    it("should have product and view translations", () => {
      expect(en.viewProduct).toBeDefined();
      expect(en.noProductData).toBeDefined();
    });

    it("should have status titles for all status codes", () => {
      expect(en.titles.VALID).toBe("Verification Successful");
      expect(en.titles.SUCCESS).toBe("Verification Successful");
      expect(en.titles.OK).toBe("Verification Successful");
      expect(en.titles.ALREADY_REGISTERED).toBe("Warning");
      expect(en.titles.EXPIRED).toBe("Warning");
      expect(en.titles.INVALID).toBe("Verification Failed");
      expect(en.titles.ERROR).toBe("Verification Failed");
      expect(en.titles.FAILED).toBe("Verification Failed");
      expect(en.titles.UNKNOWN).toBe("Unknown Status");
    });

    it("should have registration translations", () => {
      expect(en.registration.button).toBe("Register");
      expect(en.registration.alreadyRegisteredLine1).toBe(
        "This product is already registered",
      );
      expect(en.registration.alreadyRegisteredLine2).toBeDefined();
      expect(en.registration.emailLabel).toBe("Email");
      expect(en.registration.otpLabel).toBe("OTP Code");
      expect(en.registration.sendOtpButton).toBe("Send OTP");
      expect(en.registration.confirmButton).toBe("Confirm");
      expect(en.registration.cancelButton).toBe("Cancel");
    });
  });

  describe("getStatusTitle Function", () => {
    it("should return correct Thai title for VALID status", () => {
      expect(getStatusTitle("VALID", "th")).toBe("ตรวจสอบสำเร็จ");
    });

    it("should return correct English title for VALID status", () => {
      expect(getStatusTitle("VALID", "en")).toBe("Verification Successful");
    });

    it("should return correct Thai title for ALREADY_REGISTERED status", () => {
      expect(getStatusTitle("ALREADY_REGISTERED", "th")).toBe("ระวัง");
    });

    it("should return correct English title for ERROR status", () => {
      expect(getStatusTitle("ERROR", "en")).toBe("Verification Failed");
    });

    it("should return UNKNOWN title for unrecognized status in Thai", () => {
      expect(getStatusTitle("UNRECOGNIZED_STATUS", "th")).toBe("ไม่ทราบสถานะ");
    });

    it("should return UNKNOWN title for unrecognized status in English", () => {
      expect(getStatusTitle("UNRECOGNIZED_STATUS", "en")).toBe(
        "Unknown Status",
      );
    });

    it("should handle case-insensitive status codes", () => {
      expect(getStatusTitle("valid", "en")).toBe("Verification Successful");
      expect(getStatusTitle("Valid", "en")).toBe("Verification Successful");
      expect(getStatusTitle("VALID", "en")).toBe("Verification Successful");
    });

    it("should default to Thai when invalid language is provided", () => {
      // @ts-ignore - Testing invalid input
      const result = getStatusTitle("VALID", "invalid-lang");
      expect(result).toBe("ตรวจสอบสำเร็จ");
    });
  });

  describe("getStatusMessages Function", () => {
    it("should return array of messages for VALID status in Thai", () => {
      const messages = getStatusMessages("VALID", "th");
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
      expect(typeof messages[0]).toBe("string");
    });

    it("should return array of messages for VALID status in English", () => {
      const messages = getStatusMessages("VALID", "en");
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
      expect(typeof messages[0]).toBe("string");
    });

    it("should return messages for ALREADY_REGISTERED status", () => {
      const messagesTh = getStatusMessages("ALREADY_REGISTERED", "th");
      const messagesEn = getStatusMessages("ALREADY_REGISTERED", "en");

      expect(messagesTh.length).toBeGreaterThan(0);
      expect(messagesEn.length).toBeGreaterThan(0);
    });

    it("should return messages for ERROR status", () => {
      const messagesTh = getStatusMessages("ERROR", "th");
      const messagesEn = getStatusMessages("ERROR", "en");

      expect(messagesTh.length).toBeGreaterThan(0);
      expect(messagesEn.length).toBeGreaterThan(0);
    });

    it("should return UNKNOWN messages for unrecognized status", () => {
      const messagesTh = getStatusMessages("UNRECOGNIZED", "th");
      const messagesEn = getStatusMessages("UNRECOGNIZED", "en");

      expect(messagesTh).toEqual(translations.th.messages.UNKNOWN);
      expect(messagesEn).toEqual(translations.en.messages.UNKNOWN);
    });

    it("should handle case-insensitive status codes", () => {
      const messages1 = getStatusMessages("valid", "en");
      const messages2 = getStatusMessages("VALID", "en");
      const messages3 = getStatusMessages("Valid", "en");

      expect(messages1).toEqual(messages2);
      expect(messages2).toEqual(messages3);
    });
  });

  describe("Translation Consistency", () => {
    it("should have same status codes in both languages", () => {
      const thaiStatusCodes = Object.keys(translations.th.titles);
      const englishStatusCodes = Object.keys(translations.en.titles);

      expect(thaiStatusCodes.sort()).toEqual(englishStatusCodes.sort());
    });

    it("should have same message keys in both languages", () => {
      const thaiMessageKeys = Object.keys(translations.th.messages);
      const englishMessageKeys = Object.keys(translations.en.messages);

      expect(thaiMessageKeys.sort()).toEqual(englishMessageKeys.sort());
    });

    it("should have same registration keys in both languages", () => {
      const thaiRegKeys = Object.keys(translations.th.registration);
      const englishRegKeys = Object.keys(translations.en.registration);

      expect(thaiRegKeys.sort()).toEqual(englishRegKeys.sort());
    });

    it("should have non-empty strings for all Thai translations", () => {
      const checkObject = (obj: any, path = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === "string") {
            expect(value.length).toBeGreaterThan(0);
          } else if (typeof value === "object" && !Array.isArray(value)) {
            checkObject(value, currentPath);
          }
        });
      };

      checkObject(translations.th);
    });

    it("should have non-empty strings for all English translations", () => {
      const checkObject = (obj: any, path = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === "string") {
            expect(value.length).toBeGreaterThan(0);
          } else if (typeof value === "object" && !Array.isArray(value)) {
            checkObject(value, currentPath);
          }
        });
      };

      checkObject(translations.en);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string status", () => {
      expect(() => getStatusTitle("", "th")).not.toThrow();
      expect(() => getStatusMessages("", "en")).not.toThrow();
    });

    it("should handle null/undefined-like status strings", () => {
      expect(getStatusTitle("null", "th")).toBe("ไม่ทราบสถานะ");
      expect(getStatusTitle("undefined", "en")).toBe("Unknown Status");
    });

    it("should handle status with extra whitespace", () => {
      expect(getStatusTitle(" VALID ", "en")).toBe("Verification Successful");
      expect(getStatusTitle("  ERROR  ", "th")).toBe("พบปัญหา");
    });

    it("should handle special characters in status", () => {
      expect(() => getStatusTitle("INVALID@#$", "th")).not.toThrow();
      expect(getStatusTitle("INVALID@#$", "th")).toBe("ไม่ทราบสถานะ");
    });
  });

  describe("Registration Translations Completeness", () => {
    it("should have all required registration fields in Thai", () => {
      const reg = translations.th.registration;
      expect(reg.button).toBeDefined();
      expect(reg.alreadyRegisteredLine1).toBeDefined();
      expect(reg.alreadyRegisteredLine2).toBeDefined();
      expect(reg.emailLabel).toBeDefined();
      expect(reg.otpLabel).toBeDefined();
      expect(reg.sendOtpButton).toBeDefined();
      expect(reg.confirmButton).toBeDefined();
      expect(reg.cancelButton).toBeDefined();
      expect(reg.emailPlaceholder).toBeDefined();
      expect(reg.otpPlaceholder).toBeDefined();
    });

    it("should have all required registration fields in English", () => {
      const reg = translations.en.registration;
      expect(reg.button).toBeDefined();
      expect(reg.alreadyRegisteredLine1).toBeDefined();
      expect(reg.alreadyRegisteredLine2).toBeDefined();
      expect(reg.emailLabel).toBeDefined();
      expect(reg.otpLabel).toBeDefined();
      expect(reg.sendOtpButton).toBeDefined();
      expect(reg.confirmButton).toBeDefined();
      expect(reg.cancelButton).toBeDefined();
      expect(reg.emailPlaceholder).toBeDefined();
      expect(reg.otpPlaceholder).toBeDefined();
    });
  });

  describe("Common Status Codes", () => {
    const commonStatuses = [
      "VALID",
      "SUCCESS",
      "OK",
      "ALREADY_REGISTERED",
      "EXPIRED",
      "INVALID",
      "ERROR",
      "FAILED",
      "NOTFOUND",
      "DECRYPT_ERROR",
      "DECRYPT_FAIL",
    ];

    it("should have translations for all common status codes in Thai", () => {
      commonStatuses.forEach((status) => {
        const title = getStatusTitle(status, "th");
        const messages = getStatusMessages(status, "th");

        expect(title).toBeDefined();
        expect(title.length).toBeGreaterThan(0);
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThan(0);
      });
    });

    it("should have translations for all common status codes in English", () => {
      commonStatuses.forEach((status) => {
        const title = getStatusTitle(status, "en");
        const messages = getStatusMessages(status, "en");

        expect(title).toBeDefined();
        expect(title.length).toBeGreaterThan(0);
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThan(0);
      });
    });
  });
});
