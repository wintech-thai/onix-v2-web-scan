/**
 * API client for Onix v2 Web Scan
 * Handles HTTP requests via Next.js API proxy routes
 * This keeps backend API URLs hidden from the client
 */

import type {
  GetCustomerApiResponse,
  SendOtpApiRequest,
  SendOtpApiResponse,
  VerifyOtpApiRequest,
  VerifyOtpApiResponse,
} from "./types";

// ============================================================================
// Configuration
// ============================================================================

const API_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(`Request timeout after ${timeout}ms`);
    }
    throw new NetworkError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Parse API response with error handling
 */
async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    throw new ApiError(
      "Invalid response format: expected JSON",
      response.status,
    );
  }

  try {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.description || data.message || `HTTP ${response.status}`,
        response.status,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`,
      response.status,
    );
  }
}

// ============================================================================
// Verification API
// ============================================================================

/**
 * Verify product using encrypted data
 *
 * @param org - Organization ID
 * @param data - Encrypted verification data (URL-encoded)
 * @param theme - Optional theme name
 * @returns Verification result with proxied URLs
 */
export async function verifyProduct(
  org: string,
  data: string,
  theme?: string,
): Promise<GetCustomerApiResponse> {
  if (!org || !data) {
    throw new ApiError("Organization and data are required");
  }

  try {
    const response = await fetchWithTimeout("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ org, data, theme }),
    });

    return await parseApiResponse<GetCustomerApiResponse>(response);
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError
    ) {
      throw error;
    }

    throw new ApiError(
      `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Customer Registration APIs
// ============================================================================

/**
 * Get customer registration status
 *
 * @param url - The proxied GetCustomerUrl from verify response (starts with /api/proxy)
 * @returns Customer information and registration status
 *
 * Possible status values:
 * - SUCCESS: Customer is already registered
 * - CUSTOMER_NOT_ATTACH: Customer exists but not attached to this product
 * - CUSTOMER_NOTFOUND: Customer not found in system
 * - ERROR: General error occurred
 */
export async function getCustomerInfo(
  url: string,
): Promise<GetCustomerApiResponse> {
  if (!url || typeof url !== "string") {
    throw new ApiError("Invalid URL provided");
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return await parseApiResponse<GetCustomerApiResponse>(response);
  } catch (error) {
    // Re-throw known errors
    if (
      error instanceof ApiError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError
    ) {
      throw error;
    }

    // Wrap unknown errors
    throw new ApiError(
      `Failed to get customer info: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Request OTP to be sent to email address
 *
 * @param url - The proxied requestOtpViaEmailUrl from verify response
 * @param email - Email address to send OTP to
 * @returns OTP reference code and expiry information
 *
 * Note: The backend expects email as a URL path parameter, but the proxied URL
 * already includes it. For flexibility, we support both patterns.
 */
export async function sendOtp(
  url: string,
  email: string,
): Promise<SendOtpApiResponse> {
  if (!url || typeof url !== "string") {
    throw new ApiError("Invalid URL provided");
  }

  if (!email || !email.trim()) {
    throw new ApiError("Email is required");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError("Invalid email format");
  }

  try {
    // Replace {email} placeholder if present in URL
    const finalUrl = url.replace("{email}", encodeURIComponent(email));

    const response = await fetchWithTimeout(finalUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return await parseApiResponse<SendOtpApiResponse>(response);
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError
    ) {
      throw error;
    }

    throw new ApiError(
      `Failed to send OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Register customer with email and OTP
 *
 * @param url - The proxied registerCustomerUrl from verify response
 * @param email - Customer email address
 * @param emailOtp - OTP code received via email
 * @returns Registration result with customer info
 */
export async function registerCustomer(
  url: string,
  email: string,
  emailOtp: string,
): Promise<VerifyOtpApiResponse> {
  if (!url || typeof url !== "string") {
    throw new ApiError("Invalid URL provided");
  }

  if (!email || !email.trim()) {
    throw new ApiError("Email is required");
  }

  if (!emailOtp || !emailOtp.trim()) {
    throw new ApiError("OTP is required");
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, emailOtp }),
    });

    return await parseApiResponse<VerifyOtpApiResponse>(response);
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError
    ) {
      throw error;
    }

    throw new ApiError(
      `Failed to register customer: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Verify OTP and complete registration (alias for registerCustomer)
 * @deprecated Use registerCustomer instead
 */
export async function verifyOtp(
  url: string,
  data: VerifyOtpApiRequest,
): Promise<VerifyOtpApiResponse> {
  return registerCustomer(url, data.email, data.otp);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    (error instanceof Error &&
      error.name === "TypeError" &&
      error.message.includes("fetch"))
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  language: "th" | "en" = "th",
): string {
  if (error instanceof ApiError) {
    const response = error.response as
      | GetCustomerApiResponse
      | SendOtpApiResponse
      | VerifyOtpApiResponse
      | undefined;

    if (response) {
      if (language === "th" && response.descriptionThai) {
        return response.descriptionThai;
      }
      if (language === "en" && response.descriptionEng) {
        return response.descriptionEng;
      }
      if (response.description) {
        return response.description;
      }
    }

    return error.message;
  }

  if (error instanceof NetworkError) {
    return language === "th"
      ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
      : "Cannot connect to server. Please check your internet connection.";
  }

  if (error instanceof TimeoutError) {
    return language === "th"
      ? "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง"
      : "Connection timeout. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return language === "th"
    ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
    : "An unknown error occurred";
}
