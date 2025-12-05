# API Proxy Quick Start Guide

**Quick setup guide for the Next.js API proxy architecture**

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Configure Environment Variables

1. **Copy the environment template:**
   ```bash
   cd nextjs
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your settings:**
   ```bash
   # Backend API Configuration
   API_BASE_URL=https://api-dev.please-scan.com

   # Encryption Configuration (get these from backend team or ScanItemAction endpoint)
   ENCRYPTION_KEY=your-32-character-encryption-key
   ENCRYPTION_IV=your-16-char-iv

   # Next.js Configuration
   PORT=5001
   ```

3. **Get encryption credentials:**
   
   **Option A:** From backend team
   ```bash
   # Ask backend team for:
   # - Organization encryption key (32 characters)
   # - Organization encryption IV (16 characters)
   ```

   **Option B:** From backend API
   ```bash
   curl https://api-dev.please-scan.com/api/ScanItemAction/org/napbiotec/action/GetScanItemAction
   ```
   
   Response will include:
   ```json
   {
     "encryptionKey": "your-32-char-key-here",
     "encryptionIV": "your-16-char-iv"
   }
   ```

---

### Step 2: Test the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the verify endpoint:**
   ```bash
   curl -X POST http://localhost:5001/api/verify \
     -H "Content-Type: application/json" \
     -d '{
       "org": "napbiotec",
       "data": "YOUR_ENCRYPTED_DATA_HERE",
       "theme": "default"
     }'
   ```

3. **Expected response:**
   ```json
   {
     "status": "SUCCESS",
     "descriptionThai": "ตรวจสอบสำเร็จ",
     "descriptionEng": "Verification successful",
     "getCustomerUrl": "/api/proxy?url=...",
     "registerCustomerUrl": "/api/proxy?url=...",
     "requestOtpViaEmailUrl": "/api/proxy?url=...",
     "scanItem": { ... }
   }
   ```

---

## 📖 Usage Examples

### Frontend Code

```typescript
import { verifyProduct, getCustomerInfo, sendOtp, registerCustomer } from '@/lib/api';

// 1. Verify product from URL parameters
const searchParams = new URLSearchParams(window.location.search);
const org = searchParams.get('org');
const data = searchParams.get('data');

const verifyResult = await verifyProduct(org, data, 'default');

// 2. Check if customer already registered
const customerInfo = await getCustomerInfo(verifyResult.getCustomerUrl);

if (customerInfo.status === 'SUCCESS') {
  // Already registered
  console.log('Customer email:', customerInfo.maskingEmail);
} else {
  // Not registered, start registration flow
  
  // 3. Request OTP
  const otpResult = await sendOtp(
    verifyResult.requestOtpViaEmailUrl,
    'user@example.com'
  );
  
  // 4. Register with OTP
  const registered = await registerCustomer(
    verifyResult.registerCustomerUrl,
    'user@example.com',
    '123456' // OTP from email
  );
}
```

---

## 🔍 Testing with Real Data

### Get Encrypted Data from QR Code

1. **Scan a real QR code** or use the URL from the backend
2. **Extract the `data` parameter:**
   ```
   http://localhost:5001/verify?org=napbiotec&theme=default&data=3xRnel0oJh...
   ```
3. **Copy the `data` value** (everything after `data=`)
4. **URL-decode it** (browser does this automatically, but for testing):
   ```bash
   # In browser console:
   decodeURIComponent("3xRnel0oJh7B6JUL2kbyWE...")
   ```

### Test Complete Flow

```bash
# 1. Verify
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5001/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "org": "napbiotec",
    "data": "YOUR_DATA_HERE",
    "theme": "default"
  }')

echo $VERIFY_RESPONSE | jq .

# 2. Extract customer URL
CUSTOMER_URL=$(echo $VERIFY_RESPONSE | jq -r '.getCustomerUrl')

# 3. Check customer
curl -s "http://localhost:5001$CUSTOMER_URL" | jq .

# 4. Extract OTP URL and request OTP
OTP_URL=$(echo $VERIFY_RESPONSE | jq -r '.requestOtpViaEmailUrl')
OTP_URL_WITH_EMAIL=$(echo $OTP_URL | sed 's/{email}/user@example.com/')

curl -s "http://localhost:5001$OTP_URL_WITH_EMAIL" | jq .

# 5. Register (after receiving OTP)
REGISTER_URL=$(echo $VERIFY_RESPONSE | jq -r '.registerCustomerUrl')

curl -s -X POST "http://localhost:5001$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "emailOtp": "123456"
  }' | jq .
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Missing encryption credentials"

**Error:**
```json
{
  "status": "ERROR",
  "descriptionEng": "Server configuration error"
}
```

**Solution:**
1. Check `.env.local` file exists
2. Verify `ENCRYPTION_KEY` and `ENCRYPTION_IV` are set
3. Restart dev server after changing `.env.local`

---

### Issue 2: "Decryption failed"

**Error:**
```json
{
  "status": "DECRYPT_FAIL",
  "descriptionEng": "Failed to decrypt data"
}
```

**Solutions:**

**A. Wrong encryption key/IV:**
```bash
# Get correct values from backend
curl https://api-dev.please-scan.com/api/ScanItemAction/org/napbiotec/action/GetScanItemAction

# Update .env.local with correct values
ENCRYPTION_KEY=<from-backend>
ENCRYPTION_IV=<from-backend>
```

**B. Data not URL-decoded:**
```javascript
// The data parameter should be URL-decoded before sending to API
const data = decodeURIComponent(urlParams.get('data'));
```

**C. Key length wrong:**
```bash
# Check key length (must be 16, 24, or 32 characters)
echo -n "your-key-here" | wc -c

# Check IV length (must be 16 characters)
echo -n "your-iv-here" | wc -c
```

---

### Issue 3: "Invalid URL encoding"

**Error:**
```json
{
  "status": "ERROR",
  "descriptionEng": "Invalid URL encoding"
}
```

**Solution:**
The proxy URLs are base64-encoded internally. Don't manually create them:

❌ **Wrong:**
```typescript
// Don't do this
const url = '/api/proxy?url=https://api-dev.please-scan.com/...'
```

✅ **Correct:**
```typescript
// Use URLs returned from verify endpoint
const url = verifyResult.getCustomerUrl; // Already proxied
```

---

### Issue 4: Backend returns 404

**Error:**
```json
{
  "status": "ERROR",
  "descriptionEng": "Backend server error"
}
```

**Solutions:**

**A. Check API_BASE_URL:**
```bash
# Verify in .env.local
API_BASE_URL=https://api-dev.please-scan.com  # No trailing slash!
```

**B. Check organization exists:**
```bash
# Test backend directly
curl https://api-dev.please-scan.com/api/Organization/org/napbiotec/action/GetOrganization
```

**C. Check serial/pin are valid:**
```bash
# Look at decrypted data in server logs
# Verify serial and pin are correct format
```

---

## 🔐 Security Checklist

- [ ] ✅ `.env.local` is in `.gitignore`
- [ ] ✅ Never commit encryption keys to git
- [ ] ✅ Use environment-specific encryption keys (dev/staging/prod)
- [ ] ✅ API_BASE_URL does not have `NEXT_PUBLIC_` prefix
- [ ] ✅ Backend URLs are never exposed to client
- [ ] ✅ Proxy validates URLs point to configured backend

---

## 📊 Monitoring & Debugging

### Enable Debug Logging

Add to `.env.local`:
```bash
DEBUG=true
LOG_LEVEL=debug
```

### Check Server Logs

```bash
# Watch Next.js logs
npm run dev

# Look for:
# - "Calling backend API: https://..."
# - "Proxying GET request to: https://..."
# - Decryption success/failure messages
```

### Network Tab Inspection

In browser DevTools:
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `/api/verify` and `/api/proxy`
4. Verify no requests go directly to `api-dev.please-scan.com`

---

## 🚀 Next Steps

1. **Add to your component:**
   ```typescript
   import { verifyProduct } from '@/lib/api';
   
   const handleVerify = async () => {
     const result = await verifyProduct(org, data, theme);
     // Use result.getCustomerUrl, etc.
   };
   ```

2. **Handle errors:**
   ```typescript
   import { getErrorMessage } from '@/lib/api';
   
   try {
     const result = await verifyProduct(org, data, theme);
   } catch (error) {
     const message = getErrorMessage(error, 'th');
     console.error(message);
   }
   ```

3. **Test all scenarios:**
   - ✅ Valid product (SUCCESS)
   - ✅ Already registered (CUSTOMER_ALREADY_REGISTERED)
   - ✅ Invalid serial/pin (ERROR)
   - ✅ Expired data (based on TTL)

4. **Review documentation:**
   - [API Proxy Architecture](./.github/agent-md/API_PROXY_ARCHITECTURE.md)
   - [Backend Swagger](https://api-dev.please-scan.com/swagger/v1/swagger.json)

---

## 📞 Support

**Issues?**
1. Check this guide first
2. Review [API_PROXY_ARCHITECTURE.md](./API_PROXY_ARCHITECTURE.md)
3. Check server logs
4. Verify environment variables
5. Test backend API directly

**Need help?**
- Backend API issues → Contact backend team
- Frontend/proxy issues → Check implementation
- Encryption issues → Verify keys match backend

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0