# Registration Button API Integration

**Status:** ✅ Completed
**Created:** 2024-01-09
**Updated:** 2024-01-09 (Added NEXT_PUBLIC_API_BASE_URL and OTP integration)
**Priority:** High

## Overview

Implemented the registration button click behavior that calls the `GetCustomerUrl` API first, then routes to appropriate modals based on the response status.

## Requirements

When the registration button is clicked:

1. **Call API** at `data.GetCustomerUrl` field
2. **Route based on status**:
   - `SUCCESS` → Show Dialog 1.1 (Already Registered modal with email)
   - `CUSTOMER_NOT_ATTACH` or `CUSTOMER_NOTFOUND` → Show Dialog 2.1 (Email + OTP registration form)
   - **Any other status** → Show error modal with status and description
3. **OTP Flow** (Dialog 2.1):
   - User enters email → Call `${NEXT_PUBLIC_API_BASE_URL}/api/otp/send`
   - User enters OTP → Call `${NEXT_PUBLIC_API_BASE_URL}/api/register/verify`
   - Success → Show "Already Registered" modal with email

## Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

This is used for OTP and registration endpoints:
- Send OTP: `${NEXT_PUBLIC_API_BASE_URL}/api/otp/send`
- Verify OTP: `${NEXT_PUBLIC_API_BASE_URL}/api/register/verify`

## Implementation Details

### Files Modified

1. **`nextjs/lib/types.ts`**
   - Added `getCustomerUrl?: string` to `VerifyPayload` interface
   - Added new API response types:
     - `GetCustomerApiResponse`
     - `SendOtpApiRequest` & `SendOtpApiResponse`
     - `VerifyOtpApiRequest` & `VerifyOtpApiResponse`

2. **`nextjs/lib/api.ts`** (NEW FILE)
   - Created API client with helper functions:
     - `getCustomerInfo(url)` - Call GetCustomer API
     - `sendOtp(url, data)` - Send OTP to email
     - `verifyOtp(url, data)` - Verify OTP and register
   - Error handling classes:
     - `ApiError` - API response errors
     - `NetworkError` - Network/connection errors
     - `TimeoutError` - Request timeout errors
   - Utility functions:
     - `fetchWithTimeout()` - Fetch with timeout support (30s default)
     - `parseApiResponse()` - Parse and validate JSON responses
     - `isNetworkError()` - Check if error is network-related
     - `getErrorMessage()` - Get localized error messages (TH/EN)

3. **`nextjs/components/themes/default/VerifyView.tsx`**
   - Added environment variable:
     - `API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""`
   - Added state management:
     - `isCheckingRegistration` - Loading state during GetCustomer API call
     - `showAlreadyRegisteredModal` - Control Dialog 1.1
     - `showRegistrationFormModal` - Control Dialog 2.1
     - `showErrorModal` - Control error modal
     - `errorModalData` - Store error status and description
     - `registeredEmailForModal` - Store email for display
     - `otpRefCode` - Store OTP reference code from API
     - `isRegistering` - Loading state during registration
   - Implemented `handleRegisterClick()` function:
</parameter>
     - Validates `getCustomerUrl` exists
     - Shows loading state on button
     - Calls GET request to GetCustomerUrl
     - Routes to appropriate modal based on response status
     - Handles network errors gracefully
   - Added three separate modals:
     - **Already Registered Modal** (Dialog 1.1)
       - Shows registered email
       - Blue confirm button to close
     - **Registration Form Modal** (Dialog 2.1)
       - Email input with "Send OTP" button
       - OTP input field (enabled after OTP sent)
       - Confirm/Cancel buttons
       - ✅ Send OTP API integrated
       - ✅ Verify OTP API integrated
       - Email validation (regex check)
       - Loading states for both API calls
     - **Error Modal** (NEW)
       - Red gradient error icon
       - Error status code display
       - Error description (localized)
       - Red close button

4. **`nextjs/app/test/page.tsx`**
   - Added `getCustomerUrl` to all mock scenarios:
     - `valid`: `https://api.example.com/customer/check?serial=SN-123456789`
     - `expired`: `https://api.example.com/customer/check?serial=SN-987654321`
     - `error`: `https://api.example.com/customer/check?serial=INVALID`
     - `with-product`: `https://api.example.com/customer/check?serial=SN-PREMIUM-1234567890`
     - `already-registered`: `https://api.example.com/customer/check?serial=E0000076`

### Registration Button Logic

```typescript
const handleRegisterClick = async () => {
  const getCustomerUrl = (verifyData as any).getCustomerUrl;

  // 1. Validate URL exists
  if (!getCustomerUrl) {
    setErrorModalData({
      status: "ERROR",
      description: lang === "th" 
        ? "ไม่พบ URL สำหรับตรวจสอบข้อมูลลูกค้า"
        : "Customer URL not found",
    });
    setShowErrorModal(true);
    return;
  }

  // 2. Show loading state
  setIsCheckingRegistration(true);

  try {
    // 3. Call GetCustomer API
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

    // 4. Route based on status
    if (responseStatus === "SUCCESS") {
      // Already registered
      setRegisteredEmailForModal(data.email || data.data?.email || "xxx@xxx.com");
      setShowAlreadyRegisteredModal(true);
    } else if (
      responseStatus === "CUSTOMER_NOT_ATTACH" ||
      responseStatus === "CUSTOMER_NOTFOUND"
    ) {
      // Not registered - show registration form
      setShowRegistrationFormModal(true);
    } else {
      // Any other status - show error
      const description = lang === "th" && data.descriptionThai
        ? data.descriptionThai
        : lang === "en" && data.descriptionEng
          ? data.descriptionEng
          : data.description || (lang === "th" ? "เกิดข้อผิดพลาด" : "An error occurred");

      setErrorModalData({
        status: responseStatus || "ERROR",
        description: description,
      });
      setShowErrorModal(true);
    }
  } catch (error) {
    // Network or timeout error
    const description = lang === "th"
      ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
      : "Cannot connect to server. Please check your internet connection.";

    setErrorModalData({
      status: "NETWORK_ERROR",
      description: description,
    });
    setShowErrorModal(true);
  } finally {
    // 5. Hide loading state
    setIsCheckingRegistration(false);
  }
};
```

### API Response Types

```typescript
export interface GetCustomerApiResponse {
  status: string; // SUCCESS, CUSTOMER_NOT_ATTACH, CUSTOMER_NOTFOUND, ERROR, etc.
  description?: string;
  descriptionThai?: string;
  descriptionEng?: string;
  email?: string; // Registered email if status is SUCCESS
  data?: {
    customerId?: string;
    email?: string;
    registeredDate?: string;
    [key: string]: unknown;
  };
}
```

## User Flow

### Flow 1: Already Registered (SUCCESS)

```
User clicks "Register" button
  ↓
Call GetCustomerUrl API
  ↓
Response: { status: "SUCCESS", email: "user@example.com" }
  ↓
Show Dialog 1.1 (Already Registered Modal)
  ↓
Display: "สินค้านี้ลงทะเบียนไปแล้วที่ user@example.com"
  ↓
User clicks "ตกลง" to close
```

### Flow 2: Not Registered (CUSTOMER_NOT_ATTACH/CUSTOMER_NOTFOUND)

```
User clicks "Register" button
  ↓
Call GetCustomerUrl API
  ↓
Response: { status: "CUSTOMER_NOTFOUND" }
  ↓
Show Dialog 2.1 (Registration Form Modal)
  ↓
User enters email → clicks "ส่ง OTP"
  ↓
✅ Call POST ${API_BASE_URL}/api/otp/send
  ↓
Response: { status: "SUCCESS", otpRefCode: "ABC123" }
  ↓
Enable OTP input field
  ↓
User enters OTP → clicks "ยืนยัน"
  ↓
✅ Call POST ${API_BASE_URL}/api/register/verify
  ↓
Response: { status: "SUCCESS" }
  ↓
Show "Already Registered" modal with email
  ↓
Registration complete
```

### Flow 3: Error Status

```
User clicks "Register" button
  ↓
Call GetCustomerUrl API
  ↓
Response: { status: "ERROR", description: "Database error" }
  ↓
Show Error Modal (Red)
  ↓
Display status code and description
  ↓
User clicks "ปิด" to close
```

### Flow 4: Network Error

```
User clicks "Register" button
  ↓
Call GetCustomerUrl API
  ↓
Network timeout or connection failure
  ↓
Show Error Modal (Red)
  ↓
Display: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
  ↓
User clicks "ปิด" to retry later
```

## Testing

### Test Scenarios

1. **Test SUCCESS status** (Already Registered)
   ```
   http://localhost:5001/test?scenario=valid
   http://localhost:5001/test?scenario=already-registered
   ```
   - Click registration button
   - Should show "Already Registered" modal
   - Should display email address

2. **Test CUSTOMER_NOTFOUND status** (Registration Form)
   - Modify mock data to return CUSTOMER_NOTFOUND
   - Click registration button
   - Should show email + OTP form

3. **Test Error Status**
   ```
   http://localhost:5001/test?scenario=error
   ```
   - Click registration button
   - Should show error modal with status and description

4. **Test Network Error**
   - Set invalid URL in getCustomerUrl
   - Click registration button
   - Should show network error message

### Manual Testing Steps

1. Start dev server: `cd nextjs && npm run dev`
2. Open test page: `http://localhost:5001/test`
3. Test each scenario:
   - Valid → Should show registration button
   - Already-registered → Should show registration button
   - Expired → Should NOT show registration button
   - Error → Should NOT show registration button
4. Click registration button on valid scenarios
5. Verify modal routing based on API response
6. Test both Thai and English languages (`?lang=th` and `?lang=en`)

## Known Limitations / TODO

1. **OTP API Integration** - ✅ COMPLETED
   - ✅ Send OTP endpoint integrated (`POST ${API_BASE_URL}/api/otp/send`)
   - ✅ Verify OTP endpoint integrated (`POST ${API_BASE_URL}/api/register/verify`)
   - ✅ Email validation (regex)
   - ✅ Loading states for both API calls
   - ✅ Error handling with localized messages
   - ⚠️ TODO: Add resend OTP button with countdown timer
   - ⚠️ TODO: Add rate limiting UI feedback

2. **Validation** - Basic validation implemented
   - ✅ Email format validation (regex check)
   - ⚠️ TODO: Add OTP format validation (e.g., 6 digits)
   - ✅ Error display for validation failures (via error modal)
   - ⚠️ TODO: Add inline validation messages

3. **UX Improvements**
   - Add loading spinner inside button text
   - Add success animation after registration
   - Add focus trapping in modals
   - Add keyboard shortcuts (ESC to close)

4. **Error Handling**
   - Add retry mechanism for failed API calls
   - Add exponential backoff for retries
   - Add user-friendly error messages for common errors

5. **Accessibility**
   - Add ARIA labels to modals
   - Add focus management
   - Add keyboard navigation

6. **Testing**
   - Write unit tests for handleRegisterClick
   - Write integration tests for API calls
   - Write E2E tests for full registration flow

## API Endpoints (Backend Required)

The following backend endpoints are used:

### 1. Get Customer Info ✅
```
GET {getCustomerUrl}
Response: GetCustomerApiResponse

Example Response:
{
  "status": "SUCCESS" | "CUSTOMER_NOT_ATTACH" | "CUSTOMER_NOTFOUND" | "ERROR",
  "email": "user@example.com",
  "description": "Error message if applicable",
  "descriptionThai": "Thai error message",
  "descriptionEng": "English error message"
}
```

### 2. Send OTP ✅
```
POST ${NEXT_PUBLIC_API_BASE_URL}/api/otp/send
Request: { email: string }
Response: { status: string, otpRefCode?: string, expirySeconds?: number }

Example Request:
{
  "email": "user@example.com"
}

Example Response:
{
  "status": "SUCCESS",
  "otpRefCode": "ABC123XYZ",
  "expirySeconds": 300,
  "description": "OTP sent successfully"
}
```

### 3. Verify OTP and Register ✅
```
POST ${NEXT_PUBLIC_API_BASE_URL}/api/register/verify
Request: { email: string, otp: string, otpRefCode?: string }
Response: { status: string, token?: string }

Example Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "otpRefCode": "ABC123XYZ"
}

Example Response:
{
  "status": "SUCCESS",
  "token": "jwt-token-here",
  "description": "Registration successful"
}
```
</text>

<old_text line=391>
## Next Steps

1. **Backend Integration**
   - Implement GetCustomer endpoint
   - Test with real API URLs
   - Handle authentication if required

2. **OTP Flow**
   - Implement Send OTP API integration
   - Implement Verify OTP API integration
   - Add OTP countdown timer
   - Add resend OTP functionality

## Security Considerations

1. **API Timeout** - 30 seconds default to prevent hanging
2. **HTTPS Required** - All API calls should use HTTPS in production
3. **CSRF Protection** - Consider adding CSRF tokens for POST requests
4. **Rate Limiting** - Backend should implement rate limiting for OTP
5. **Email Validation** - Both frontend and backend should validate email format
6. **OTP Expiry** - Backend should enforce OTP expiration (e.g., 5 minutes)
7. **OTP Attempts** - Backend should limit OTP verification attempts

## Performance Considerations

1. **Loading States** - Show loading indicator during API calls
2. **Error Recovery** - Graceful error handling with user-friendly messages
3. **Timeout Handling** - 30-second timeout prevents infinite waiting
4. **Network Error Detection** - Separate handling for network vs API errors

## Bilingual Support

All UI text and error messages support Thai and English:

- **Loading**: "กำลังตรวจสอบ..." / "Checking..."
- **Network Error**: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" / "Cannot connect to server"
- **Already Registered**: "สินค้านี้ลงทะเบียนไปแล้วที่" / "This product is already registered at"
- **Error Title**: "เกิดข้อผิดพลาด" / "Error"
- **Close Button**: "ปิด" / "Close"

## Next Steps

1. **Backend Integration**
   - Implement GetCustomer endpoint
   - Test with real API URLs
   - Handle authentication if required

2. **OTP Flow**
   - Implement Send OTP API integration
   - Implement Verify OTP API integration
   - Add OTP countdown timer
   - Add resend OTP functionality

3. **Testing**
   - Write comprehensive unit tests
   - Add integration tests for API layer
   - Add E2E tests for registration flow

4. **Documentation**
   - Update API documentation with new endpoints
   - Add Swagger/OpenAPI specs
   - Document error codes and responses

---

## Quick Setup Guide

1. **Add environment variable** to `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
   ```

2. **Backend endpoints required**:
   - `GET {getCustomerUrl}` - Dynamic URL from verify payload
   - `POST ${NEXT_PUBLIC_API_BASE_URL}/api/otp/send`
   - `POST ${NEXT_PUBLIC_API_BASE_URL}/api/register/verify`

3. **Test the flow**:
   ```bash
   cd nextjs && npm run dev
   # Visit http://localhost:5001/test?scenario=valid
   # Click "Register" button
   ```

4. **Expected behavior**:
   - Button calls GetCustomer API first
   - Routes to appropriate modal based on status
   - OTP flow fully functional with API integration
   - Error handling with localized messages

---

**Related Files:**
- `.github/agent-md/API_INTEGRATION_GUIDE.md` - General API integration guide
- `.github/agent-md/IMPLEMENTATION_SUMMARY.md` - Overall project summary
- `.github/agent-md/FIX_REGISTRATION_BUTTON.md` - Previous registration button fixes