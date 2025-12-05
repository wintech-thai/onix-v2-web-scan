# API Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the OTP and registration APIs with the newly implemented UI features.

---

## Prerequisites

- Swagger API documentation: https://api-dev.please-scan.com/swagger/index.html
- API access credentials (if required)
- Understanding of the verification flow

---

## Step 1: Identify Required Endpoints

Based on the swagger documentation, identify these endpoints:

### 1. Send OTP Endpoint
- **Purpose:** Send verification code to user's email
- **Expected Path:** `/api/otp/send` or similar
- **Method:** POST
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "orgId": "organization_id",
    "serialNumber": "serial_number_from_qr",
    "language": "th" | "en"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "otpExpiry": "2024-01-15T10:30:00Z"
  }
  ```

### 2. Verify OTP & Register Endpoint
- **Purpose:** Verify OTP code and complete registration
- **Expected Path:** `/api/register/verify` or similar
- **Method:** POST
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "serialNumber": "serial_number_from_qr",
    "orgId": "organization_id"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "registeredEmail": "user@example.com"
  }
  ```

---

## Step 2: Create API Helper Functions

Create a new file: `nextjs/lib/api.ts`

```typescript
/**
 * API Helper Functions for OTP and Registration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-dev.please-scan.com';

interface SendOtpRequest {
  email: string;
  orgId?: string;
  serialNumber?: string;
  language?: 'th' | 'en';
}

interface SendOtpResponse {
  success: boolean;
  message: string;
  otpExpiry?: string;
  error?: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
  serialNumber?: string;
  orgId?: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  registeredEmail?: string;
  error?: string;
}

/**
 * Send OTP to user's email
 */
export async function sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to send OTP',
        error: errorData.error,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'OTP sent successfully',
      otpExpiry: data.otpExpiry,
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Network error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify OTP and complete registration
 */
export async function verifyOtpAndRegister(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to verify OTP',
        error: errorData.error,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Registration successful',
      registeredEmail: data.registeredEmail,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Network error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## Step 3: Update VerifyView.tsx

Replace the placeholder API calls in `nextjs/components/themes/default/VerifyView.tsx`:

### Location 1: Send OTP Button (around line 563)

**FIND:**
```typescript
onClick={async () => {
  if (!email) return;
  setIsSendingOtp(true);
  try {
    // TODO: Call OTP API
    // await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
    setIsOtpSent(true);
  } catch (error) {
    console.error("Failed to send OTP:", error);
  } finally {
    setIsSendingOtp(false);
  }
}}
```

**REPLACE WITH:**
```typescript
onClick={async () => {
  if (!email) return;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email');
    return;
  }
  
  setIsSendingOtp(true);
  try {
    const result = await sendOtp({
      email,
      orgId: verifyData.scanData?.orgId,
      serialNumber: verifyData.scanData?.serial,
      language: lang,
    });
    
    if (result.success) {
      setIsOtpSent(true);
      alert(lang === 'th' ? 'ส่ง OTP สำเร็จ กรุณาตรวจสอบอีเมล' : 'OTP sent successfully. Please check your email.');
    } else {
      alert(result.message || (lang === 'th' ? 'ไม่สามารถส่ง OTP ได้' : 'Failed to send OTP'));
    }
  } catch (error) {
    console.error("Failed to send OTP:", error);
    alert(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
  } finally {
    setIsSendingOtp(false);
  }
}}
```

### Location 2: Confirm Button (around line 591)

**FIND:**
```typescript
onClick={async () => {
  if (!email || !otp) return;
  try {
    // TODO: Call registration API
    // await fetch('/api/register', { method: 'POST', body: JSON.stringify({ email, otp }) });
    setIsRegModalOpen(false);
  } catch (error) {
    console.error("Registration failed:", error);
  }
}}
```

**REPLACE WITH:**
```typescript
onClick={async () => {
  if (!email || !otp) return;
  
  // Validate OTP format (assuming 6 digits)
  if (!/^\d{6}$/.test(otp)) {
    alert(lang === 'th' ? 'กรุณากรอก OTP 6 หลัก' : 'Please enter 6-digit OTP');
    return;
  }
  
  setIsSendingOtp(true); // Reuse for loading state
  try {
    const result = await verifyOtpAndRegister({
      email,
      otp,
      serialNumber: verifyData.scanData?.serial,
      orgId: verifyData.scanData?.orgId,
    });
    
    if (result.success) {
      alert(lang === 'th' ? 'ลงทะเบียนสำเร็จ' : 'Registration successful');
      setIsRegModalOpen(false);
      setEmail("");
      setOtp("");
      setIsOtpSent(false);
      
      // Optionally refresh the page or update UI
      // window.location.reload();
    } else {
      alert(result.message || (lang === 'th' ? 'การลงทะเบียนล้มเหลว' : 'Registration failed'));
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
  } finally {
    setIsSendingOtp(false);
  }
}}
```

### Add Import at Top of File

Add this import statement at the top of `VerifyView.tsx`:

```typescript
import { sendOtp, verifyOtpAndRegister } from "@/lib/api";
```

---

## Step 4: Environment Variables

Add to `.env.local` (for development):

```env
NEXT_PUBLIC_API_BASE_URL=https://api-dev.please-scan.com
```

Add to production environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.please-scan.com
```

---

## Step 5: Error Handling Improvements

### Option 1: Using alert() (Current Implementation)
- Simple and works immediately
- Not ideal UX but functional

### Option 2: Using react-hot-toast (Recommended)

Install:
```bash
npm install react-hot-toast
```

Update `app/layout.tsx`:
```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
```

Update API calls in `VerifyView.tsx`:
```typescript
import toast from 'react-hot-toast';

// Replace alert() with toast
if (result.success) {
  toast.success(lang === 'th' ? 'ส่ง OTP สำเร็จ' : 'OTP sent successfully');
} else {
  toast.error(result.message);
}
```

---

## Step 6: Additional Features

### Add Resend OTP with Countdown

```typescript
const [countdown, setCountdown] = useState(0);

// After successful OTP send:
setCountdown(60); // 60 seconds countdown

// Add useEffect for countdown:
useEffect(() => {
  if (countdown > 0) {
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [countdown]);

// Update Send OTP button:
<button
  onClick={handleSendOtp}
  disabled={isSendingOtp || countdown > 0}
>
  {countdown > 0 
    ? `${lang === 'th' ? 'ส่งอีกครั้งใน' : 'Resend in'} ${countdown}s`
    : isSendingOtp 
      ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending...')
      : t.registration.sendOtpButton
  }
</button>
```

### Add Form Validation

```typescript
// Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// OTP validation
const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

// Show validation errors
const [emailError, setEmailError] = useState('');
const [otpError, setOtpError] = useState('');

// On email blur:
onBlur={() => {
  if (email && !validateEmail(email)) {
    setEmailError(lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format');
  } else {
    setEmailError('');
  }
}}

// Display error:
{emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
```

---

## Step 7: Testing

### Test with Mock API (Optional)

Create `nextjs/app/api/otp/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success response
  return NextResponse.json({
    success: true,
    message: 'OTP sent successfully',
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}
```

Create `nextjs/app/api/register/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OTP verification (accept "123456" as valid)
  if (body.otp === '123456') {
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      registeredEmail: body.email,
    });
  } else {
    return NextResponse.json({
      success: false,
      message: 'Invalid OTP',
      error: 'OTP_INVALID',
    }, { status: 400 });
  }
}
```

---

## Step 8: Security Considerations

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// In api.ts
const OTP_RATE_LIMIT_KEY = 'otp_last_sent';
const RATE_LIMIT_SECONDS = 60;

export async function sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  // Check rate limit
  const lastSent = localStorage.getItem(OTP_RATE_LIMIT_KEY);
  if (lastSent) {
    const secondsSinceLastSent = (Date.now() - parseInt(lastSent)) / 1000;
    if (secondsSinceLastSent < RATE_LIMIT_SECONDS) {
      return {
        success: false,
        message: `Please wait ${Math.ceil(RATE_LIMIT_SECONDS - secondsSinceLastSent)} seconds`,
      };
    }
  }
  
  // ... existing code ...
  
  // Save timestamp on success
  if (result.success) {
    localStorage.setItem(OTP_RATE_LIMIT_KEY, Date.now().toString());
  }
  
  return result;
}
```

### Input Sanitization

```typescript
// Sanitize email input
const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// Sanitize OTP input
const sanitizeOtp = (otp: string): string => {
  return otp.replace(/\D/g, '').slice(0, 6);
};
```

---

## Step 9: Deployment Checklist

- [ ] API endpoints configured correctly
- [ ] Environment variables set in production
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Form validation working
- [ ] Rate limiting implemented
- [ ] Security considerations addressed
- [ ] Mobile testing completed
- [ ] Desktop testing completed
- [ ] API integration tested with real endpoints
- [ ] Error scenarios tested (network errors, invalid OTP, etc.)

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure API server allows requests from your domain:
```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue: OTP Not Received

**Checklist:**
1. Check email address is valid
2. Check spam folder
3. Verify API endpoint is correct
4. Check API logs for errors
5. Verify email service is working

### Issue: Network Timeout

**Solution:** Add timeout to fetch requests:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ... other options
  });
} catch (error) {
  if (error.name === 'AbortError') {
    return { success: false, message: 'Request timeout' };
  }
}
```

---

## Support

For issues with API integration:
1. Check swagger documentation
2. Review API logs
3. Test with curl or Postman first
4. Contact backend team if needed

---

## Summary

1. ✅ Identify API endpoints from swagger
2. ✅ Create API helper functions in `lib/api.ts`
3. ✅ Update VerifyView.tsx with real API calls
4. ✅ Add environment variables
5. ✅ Implement error handling
6. ✅ Add form validation
7. ✅ Test thoroughly
8. ✅ Deploy with confidence

**Status:** Ready for Implementation 🚀