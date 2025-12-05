# Quick Setup Guide: Registration API Integration

**Last Updated:** 2024-01-09

## 📋 Overview

This guide helps you quickly set up the registration button API integration with your backend.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Environment Variable

Add to `nextjs/.env.local` (or `.env`):

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

**Example:**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.onix-verify.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Step 2: Ensure Backend Endpoints Exist

Your backend must provide these 3 endpoints:

#### 1️⃣ Get Customer Info (Dynamic URL)
```
GET {getCustomerUrl}
```
This URL comes from your verify payload's `getCustomerUrl` field.

**Example Response:**
```json
{
  "status": "SUCCESS",
  "email": "user@example.com",
  "description": "Customer already registered"
}
```

**Possible Status Values:**
- `SUCCESS` → Shows "Already Registered" modal
- `CUSTOMER_NOT_ATTACH` → Shows registration form
- `CUSTOMER_NOTFOUND` → Shows registration form
- Any other → Shows error modal

---

#### 2️⃣ Send OTP
```
POST ${NEXT_PUBLIC_API_BASE_URL}/api/otp/send
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "status": "SUCCESS",
  "otpRefCode": "ABC123XYZ",
  "expirySeconds": 300,
  "description": "OTP sent to email",
  "descriptionThai": "ส่ง OTP ไปยังอีเมลแล้ว",
  "descriptionEng": "OTP sent to email"
}
```

**Error Response:**
```json
{
  "status": "ERROR",
  "description": "Failed to send OTP",
  "descriptionThai": "ไม่สามารถส่ง OTP ได้",
  "descriptionEng": "Failed to send OTP"
}
```

---

#### 3️⃣ Verify OTP and Register
```
POST ${NEXT_PUBLIC_API_BASE_URL}/api/register/verify
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "otpRefCode": "ABC123XYZ"
}
```

**Success Response:**
```json
{
  "status": "SUCCESS",
  "token": "jwt-token-here",
  "description": "Registration successful",
  "descriptionThai": "ลงทะเบียนสำเร็จ",
  "descriptionEng": "Registration successful"
}
```

**Error Response:**
```json
{
  "status": "INVALID_OTP",
  "description": "Invalid OTP code",
  "descriptionThai": "รหัส OTP ไม่ถูกต้อง",
  "descriptionEng": "Invalid OTP code"
}
```

---

### Step 3: Test the Integration

```bash
# Start Next.js dev server
cd nextjs
npm run dev

# Open test page
http://localhost:5001/test?scenario=valid

# Click the "Register" button and test the flow
```

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "ลงทะเบียน" (Register) button                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Call GET {getCustomerUrl}                                    │
│ (URL from verify payload)                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ status: SUCCESS  │    │ status: NOT_FOUND│
│                  │    │ or NOT_ATTACH    │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────────────────┐
│ Show Modal 1.1   │    │ Show Modal 2.1 (Reg Form)    │
│ Already Reg      │    │                              │
│ "xxx@xxx.com"    │    │ 1. Enter email → Send OTP    │
└──────────────────┘    │    POST /api/otp/send        │
                        │                              │
                        │ 2. Enter OTP → Verify        │
                        │    POST /api/register/verify │
                        │                              │
                        │ 3. Success → Show Modal 1.1  │
                        └──────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] **Environment variable set**
  ```bash
  echo $NEXT_PUBLIC_API_BASE_URL
  # Should print your backend URL
  ```

- [ ] **Backend endpoints working**
  ```bash
  # Test Get Customer
  curl https://your-api.com/customer/check?serial=TEST
  
  # Test Send OTP
  curl -X POST https://your-api.com/api/otp/send \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  
  # Test Verify OTP
  curl -X POST https://your-api.com/api/register/verify \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","otp":"123456"}'
  ```

- [ ] **Frontend working**
  - Visit http://localhost:5001/test?scenario=valid
  - Click "ลงทะเบียน" button
  - See loading spinner
  - Modal appears based on API response

---

## 🔍 Debugging

### Issue: Button doesn't call API

**Check:**
1. `getCustomerUrl` exists in verify payload
2. Open browser console for errors
3. Check network tab for API calls

**Solution:**
```typescript
// Verify data structure in test page
console.log(verifyData.getCustomerUrl);
// Should print URL like: https://api.example.com/customer/check?serial=...
```

---

### Issue: CORS Error

**Error Message:**
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5001' 
has been blocked by CORS policy
```

**Solution:** Backend must set CORS headers:
```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:5001', 'https://your-frontend.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

### Issue: 404 Not Found

**Error Message:**
```
POST https://api.example.com/api/otp/send 404 (Not Found)
```

**Check:**
1. Backend endpoint exists and is running
2. URL path is correct (`/api/otp/send` not `/otp/send`)
3. HTTP method is POST not GET

---

### Issue: Email validation fails

**Error:** "รูปแบบอีเมลไม่ถูกต้อง"

**Regex used:**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Valid emails:**
- ✅ `user@example.com`
- ✅ `john.doe@company.co.th`
- ❌ `invalid@`
- ❌ `@example.com`
- ❌ `no-domain@`

---

## 📦 Response Status Codes Reference

### GetCustomer API
| Status | Meaning | Modal Shown |
|--------|---------|-------------|
| `SUCCESS` | Already registered | 1.1 (Already Reg) |
| `CUSTOMER_NOT_ATTACH` | Not attached | 2.1 (Reg Form) |
| `CUSTOMER_NOTFOUND` | Not found | 2.1 (Reg Form) |
| `ERROR` | Generic error | Error Modal (Red) |
| Any other | Unknown error | Error Modal (Red) |

### Send OTP API
| Status | Meaning | Action |
|--------|---------|--------|
| `SUCCESS` | OTP sent | Enable OTP input |
| `ERROR` | Failed to send | Show error modal |
| `RATE_LIMIT` | Too many requests | Show error modal |

### Verify OTP API
| Status | Meaning | Action |
|--------|---------|--------|
| `SUCCESS` | Registration OK | Show "Already Reg" modal |
| `INVALID_OTP` | Wrong OTP | Show error modal |
| `EXPIRED_OTP` | OTP expired | Show error modal |
| `ERROR` | Generic error | Show error modal |

---

## 🌐 Multi-language Support

All error messages support Thai and English:

```json
{
  "status": "ERROR",
  "description": "Default message",
  "descriptionThai": "ข้อความภาษาไทย",
  "descriptionEng": "English message"
}
```

Frontend automatically selects:
- `descriptionThai` when `?lang=th` (default)
- `descriptionEng` when `?lang=en`
- Falls back to `description` if language-specific not available

---

## 📝 Next Steps

After basic setup works:

1. **Add OTP countdown timer** (e.g., 5 minutes)
2. **Add resend OTP button** with cooldown (e.g., 60 seconds)
3. **Add rate limiting feedback** (show remaining attempts)
4. **Add success animation** after registration
5. **Write unit tests** for API integration
6. **Add E2E tests** for full flow

---

## 🔗 Related Documentation

- [REGISTRATION_BUTTON_API_INTEGRATION.md](./REGISTRATION_BUTTON_API_INTEGRATION.md) - Full technical documentation
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - General API integration guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Overall project summary

---

## 💡 Tips

1. **Use console.log for debugging:**
   ```typescript
   console.log('GetCustomer Response:', data);
   console.log('OTP RefCode:', otpRefCode);
   ```

2. **Test with mock API first:**
   - Use https://httpbin.org for testing
   - Or use local mock server

3. **Check browser network tab:**
   - See actual request/response
   - Verify headers and payload

4. **Start backend first:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd nextjs && npm run dev
   ```

---

**Need help?** Check the browser console and network tab for detailed error messages!