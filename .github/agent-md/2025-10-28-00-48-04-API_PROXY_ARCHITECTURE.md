# API Proxy Architecture Documentation

**Created:** 2024-01-XX
**Status:** ✅ Implemented
**Priority:** High

---

## 📋 Overview

This document describes the Next.js API proxy architecture implemented to hide backend API URLs from the client browser. All backend communication is proxied through Next.js API routes, keeping the actual API endpoints secure and private.

---

## 🏗️ Architecture

### Flow Diagram

```
┌─────────────┐
│   Browser   │
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/verify
       │    { org, data, theme }
       │
       ▼
┌──────────────────────┐
│  Next.js API Routes  │
│  (Server-Side Only)  │
└──────┬───────────────┘
       │
       │ 2. Decrypt data
       │    Extract serial/pin
       │
       │ 3. Call backend
       │    GET /org/{id}/VerifyScanItem/{serial}/{pin}
       │
       ▼
┌─────────────────────────────────────┐
│  Backend API                        │
│  https://api-dev.please-scan.com   │
└──────┬──────────────────────────────┘
       │
       │ 4. Return URLs:
       │    - getProductUrl
       │    - getCustomerUrl
       │    - registerCustomerUrl
       │    - requestOtpViaEmailUrl
       │
       ▼
┌──────────────────────┐
│  Next.js API Routes  │
│  Transform URLs      │
└──────┬───────────────┘
       │
       │ 5. Return proxied URLs:
       │    /api/proxy?url=<base64>
       │
       ▼
┌─────────────┐
│   Browser   │
│   Client    │
└─────────────┘
```

---

## 📁 File Structure

```
nextjs/
├── app/
│   └── api/
│       ├── verify/
│       │   └── route.ts          # Main verification endpoint
│       └── proxy/
│           └── route.ts          # Generic proxy endpoint
├── lib/
│   ├── api.ts                    # Updated client functions
│   └── encryption.ts             # AES-256-CBC encryption/decryption
└── .env.local                    # Server-side configuration
```

---

## 🔧 API Routes

### 1. `/api/verify` - Initial Verification

**Method:** `POST`

**Request Body:**
```json
{
  "org": "napbiotec",
  "data": "3xRnel0oJh7B6JUL2kbyWE...",  // URL-encoded encrypted data
  "theme": "default"
}
```

**Process:**
1. Validates request parameters
2. Gets encryption key/IV from environment
3. URL-decodes and decrypts the `data` parameter
4. Extracts `serial` and `pin` from decrypted data
5. Calls backend: `GET /org/{id}/VerifyScanItem/{serial}/{pin}`
6. Transforms returned URLs to proxy URLs
7. Returns response with proxied URLs

**Response:**
```json
{
  "status": "SUCCESS",
  "descriptionThai": "ตรวจสอบสำเร็จ",
  "descriptionEng": "Verification successful",
  "scanItem": { ... },
  "getProductUrl": "/api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL0dldFByb2R1Y3QvLi4u",
  "getCustomerUrl": "/api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL0dldEN1c3RvbWVyLy4uLg==",
  "registerCustomerUrl": "/api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL1JlZ2lzdGVyQ3VzdG9tZXIvLi4u",
  "requestOtpViaEmailUrl": "/api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL0dldE90cFZpYUVtYWlsLy4uLi97ZW1haWx9",
  "themeVerify": "default",
  "ttlMinute": 30
}
```

---

### 2. `/api/proxy` - Generic URL Proxy

**Methods:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

**Query Parameters:**
- `url` - Base64-encoded backend URL

**GET Example:**
```
GET /api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL0dldEN1c3RvbWVyL0FCQzEyMy80NTY3ODkvb3RwMTIz
```

**POST Example:**
```
POST /api/proxy?url=aHR0cHM6Ly9hcGktZGV2LnBsZWFzZS1zY2FuLmNvbS9vcmcvbmFwYmlvdGVjL1JlZ2lzdGVyQ3VzdG9tZXIvQUJDMTIzLzQ1Njc4OS9vdHAxMjM=

{
  "email": "user@example.com",
  "emailOtp": "123456"
}
```

**Process:**
1. Extracts and validates URL parameter
2. Decodes base64 to get actual backend URL
3. Validates URL points to configured backend (security check)
4. Forwards request to backend with appropriate method/body
5. Returns backend response to client

**Security:**
- Only allows URLs pointing to `API_BASE_URL` from environment
- Prevents proxy abuse by validating target URLs

---

## 🔐 Environment Variables

### `.env.local` (Server-Side Only)

```bash
# Backend API Configuration
# This URL is NEVER exposed to the client
API_BASE_URL=https://api-dev.please-scan.com

# Encryption Configuration
# These should match the backend ScanItemAction settings
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_IV=your-16-char-iv

# Next.js Configuration
PORT=5001
```

**Important Notes:**
- ⚠️ **DO NOT** use `NEXT_PUBLIC_` prefix for API_BASE_URL
- ⚠️ Variables without `NEXT_PUBLIC_` are server-side only
- ⚠️ Never commit `.env.local` to git (add to `.gitignore`)
- ⚠️ For production, use proper secrets management

---

## 📚 Client API Functions

### Updated `lib/api.ts`

```typescript
// 1. Verify product (initial call)
import { verifyProduct } from '@/lib/api';

const result = await verifyProduct('napbiotec', encryptedData, 'default');
// Returns: { status, getCustomerUrl, registerCustomerUrl, ... }

// 2. Check customer registration status
import { getCustomerInfo } from '@/lib/api';

const customer = await getCustomerInfo(result.getCustomerUrl);
// Uses: GET /api/proxy?url=...

// 3. Request OTP email
import { sendOtp } from '@/lib/api';

const otpResult = await sendOtp(result.requestOtpViaEmailUrl, 'user@example.com');
// Uses: GET /api/proxy?url=.../GetOtpViaEmail/.../email

// 4. Register customer
import { registerCustomer } from '@/lib/api';

const registered = await registerCustomer(
  result.registerCustomerUrl,
  'user@example.com',
  '123456'
);
// Uses: POST /api/proxy?url=... with { email, emailOtp }
```

---

## 🔄 Data Flow Example

### Complete Registration Flow

**Step 1: User scans QR code**
```
URL: http://localhost:5001/verify?org=napbiotec&data=3xRnel0oJh7B6JUL...
```

**Step 2: Frontend calls verify API**
```typescript
const result = await verifyProduct('napbiotec', 'data=3xRnel0oJh7B6JUL...', 'default');
```

**Step 3: Server-side processing**
1. Decrypt data → extract serial/pin
2. Call backend: `GET https://api-dev.please-scan.com/org/napbiotec/VerifyScanItem/{serial}/{pin}`
3. Transform URLs to proxy format
4. Return to client

**Step 4: Check if already registered**
```typescript
const customer = await getCustomerInfo(result.getCustomerUrl);
// Proxies to: GET /org/napbiotec/GetCustomer/{serial}/{pin}/{otp}
```

**Step 5: Request OTP (if not registered)**
```typescript
const otp = await sendOtp(result.requestOtpViaEmailUrl, 'user@example.com');
// Proxies to: GET /org/napbiotec/GetOtpViaEmail/{serial}/{pin}/{otp}/{email}
```

**Step 6: Register with OTP**
```typescript
const registered = await registerCustomer(
  result.registerCustomerUrl,
  'user@example.com',
  '123456'
);
// Proxies to: POST /org/napbiotec/RegisterCustomer/{serial}/{pin}/{otp}
//             Body: { email, emailOtp }
```

---

## 🔒 Security Features

### 1. **Backend URL Hiding**
- ✅ Client never sees actual backend URLs
- ✅ All URLs are base64-encoded in proxy format
- ✅ API_BASE_URL is server-side only

### 2. **Encryption Key Protection**
- ✅ Encryption keys stored in server environment
- ✅ Decryption happens server-side only
- ✅ Client receives only decrypted results

### 3. **Proxy Validation**
- ✅ Validates decoded URLs point to configured backend
- ✅ Prevents proxy abuse/SSRF attacks
- ✅ Rate limiting can be added at proxy level

### 4. **CORS Protection**
- ✅ No CORS issues since all calls go through same-origin
- ✅ Backend doesn't need to allow browser CORS

---

## 🧪 Testing

### Test Verify Endpoint

```bash
curl -X POST http://localhost:5001/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "org": "napbiotec",
    "data": "3xRnel0oJh7B6JUL2kbyWE...",
    "theme": "default"
  }'
```

### Test Proxy Endpoint

```bash
# Encode URL to base64
echo -n "https://api-dev.please-scan.com/org/napbiotec/GetCustomer/ABC123/456789/otp123" | base64

# Call proxy
curl "http://localhost:5001/api/proxy?url=<base64_encoded_url>"
```

---

## 📊 Performance Considerations

### Pros
✅ **Security**: Backend URLs hidden from client
✅ **Flexibility**: Easy to change backend without client updates
✅ **Caching**: Can add response caching at proxy level
✅ **Monitoring**: Centralized logging and analytics
✅ **Rate Limiting**: Single point for rate limit enforcement

### Cons
❌ **Latency**: Extra hop through Next.js server
❌ **Load**: All API traffic goes through Next.js
❌ **Complexity**: More moving parts to maintain

### Optimizations
- Cache verify responses (TTL-based)
- Use edge runtime for faster proxy
- Add request deduplication
- Implement connection pooling

---

## 🐛 Troubleshooting

### Issue: "Invalid URL encoding"
**Cause:** URL not properly base64-encoded
**Solution:** Ensure URL is base64-encoded before passing to proxy

### Issue: "Decryption failed"
**Cause:** Wrong encryption key/IV or corrupted data
**Solution:** 
1. Check ENCRYPTION_KEY and ENCRYPTION_IV in `.env.local`
2. Verify data is URL-decoded before decryption
3. Ensure key length is 16/24/32 characters

### Issue: "Server configuration error"
**Cause:** Missing environment variables
**Solution:** Check `.env.local` has all required variables

### Issue: "Backend server error"
**Cause:** Backend API issue or wrong URL
**Solution:**
1. Check backend API is running
2. Verify API_BASE_URL is correct
3. Check backend logs for errors

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] Set proper ENCRYPTION_KEY and ENCRYPTION_IV
- [ ] Configure API_BASE_URL for production
- [ ] Add `.env.local` to `.gitignore`
- [ ] Test all API routes work correctly
- [ ] Verify URLs are properly proxied
- [ ] Check error handling and logging
- [ ] Add rate limiting (recommended)
- [ ] Set up monitoring/alerts
- [ ] Document backend API endpoints used
- [ ] Test with production-like data

### Production Environment Variables

```bash
API_BASE_URL=https://api.please-scan.com  # Production backend
ENCRYPTION_KEY=<fetch-from-secrets-manager>
ENCRYPTION_IV=<fetch-from-secrets-manager>
PORT=3000
NODE_ENV=production
```

---

## 📖 References

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Backend Swagger API](https://api-dev.please-scan.com/swagger/v1/swagger.json)
- [Encryption Implementation](../lib/encryption.ts)
- [API Client Implementation](../lib/api.ts)

---

## ✅ Implementation Checklist

- [x] Create `/api/verify` route
- [x] Create `/api/proxy` route
- [x] Update `lib/api.ts` client functions
- [x] Add environment variables
- [x] Document architecture
- [x] Add error handling
- [x] Add URL validation
- [x] Add security checks
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add rate limiting
- [ ] Add response caching
- [ ] Add monitoring

---

**Last Updated:** 2024-01-XX
**Maintained By:** Development Team