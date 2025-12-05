# Production Environment Variables - Final Guide

**Status:** Completed  
**Created:** 2025-01-XX  
**Priority:** Critical

## 🎯 Summary

After analyzing the code and QR code formats, here's the **FINAL** list of required environment variables for production deployment.

---

## ✅ **MINIMUM REQUIRED Environment Variables**

### For Production Deployment:

```bash
# ============================================
# MINIMUM REQUIRED FOR PRODUCTION
# ============================================

# Node Environment
NODE_ENV=production

# Encryption Configuration (REQUIRED)
ENCRYPTION_KEY=your-16-24-32-char-key
ENCRYPTION_IV=your-exactly-16-chars-iv
```

**That's it!** 🎉

---

## 🟡 **OPTIONAL Environment Variables**

### Only needed in specific scenarios:

#### 1. Redis (For Multi-Org Encryption Keys)

```bash
REDIS_HOST=redis.your-cloud.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

**When needed:**
- If different organizations use different encryption keys
- Keys are stored in Redis with pattern: `CacheLoader:Production:ScanItemActions:{org}`

**If not using Redis:**
- All orgs use the same `ENCRYPTION_KEY` and `ENCRYPTION_IV` from env

---

#### 2. API_BASE_URL (For Legacy QR Codes)

```bash
API_BASE_URL=https://scan-api.your-domain.com
```

**When needed:**
- Only if you have **legacy QR codes** that contain just `serial|pin` or `{"serial":"...","pin":"..."}`
- Modern QR codes already have the full backend response with all URLs

**How to check if you need it:**
- Look at your server logs
- If you see: `✅ Decrypted data contains FULL BACKEND RESPONSE` → **Don't need it**
- If you see: `🔑 Decrypted data contains SERIAL/PIN` → **Need it**

---

#### 3. Logging Endpoint

```bash
LOG_ENDPOINT=https://logs.your-domain.com/api/audit
```

**When needed:**
- If you want to send audit logs to external service
- Otherwise, logs go to console only

---

## ❌ **NOT NEEDED**

### These variables are NOT required:

- ❌ `NEXT_PUBLIC_BASE_URL` - Not used anywhere in code
- ❌ `NEXT_PUBLIC_API_BASE_URL` - Not used (backend URLs come from response)

---

## 🔧 **How It Works**

### 1. QR Code Decryption Flow

```
User scans QR code
    ↓
QR contains: Encrypted data (base64)
    ↓
Next.js decrypts with ENCRYPTION_KEY + ENCRYPTION_IV
    ↓
Decrypted data format check:
    ├─ Format 1: Full backend response JSON (MODERN) ✅
    │   → Already has all URLs, use them directly
    │
    ├─ Format 2: {"serial":"...", "pin":"..."} (LEGACY)
    │   → Call ${API_BASE_URL}/org/${org}/VerifyScanItem/${serial}/${pin}
    │
    └─ Format 3: "serial|pin" (LEGACY)
        → Call ${API_BASE_URL}/org/${org}/VerifyScanItem/${serial}/${pin}
    ↓
Display result to user
```

### 2. Backend URL Proxying

All backend URLs are automatically proxied through `/api/proxy`:
- `getCustomerUrl` → `/api/proxy?url=base64(backend_url)`
- `registerCustomerUrl` → `/api/proxy?url=base64(backend_url)`
- `requestOtpViaEmailUrl` → `/api/proxy?url=base64(backend_url)`
- `getProductUrl` → `/api/proxy?url=base64(backend_url)`

**Security:** Proxy only allows whitelisted domains (configured in `app/api/proxy/route.ts`)

---

## 🚀 **Deployment Examples**

### Docker Compose

```yaml
version: '3.8'
services:
  verify-app:
    image: your-verify-app:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ENCRYPTION_KEY=wCCLYnTAlfFk2ccB
      - ENCRYPTION_IV=2908yrhozH0ppXmA
      # Optional:
      # - REDIS_HOST=redis
      # - REDIS_PORT=6379
      # - API_BASE_URL=https://scan-api.example.com
```

### Kubernetes Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: verify-app-secrets
type: Opaque
stringData:
  ENCRYPTION_KEY: "wCCLYnTAlfFk2ccB"
  ENCRYPTION_IV: "2908yrhozH0ppXmA"
  # Optional:
  # REDIS_HOST: "redis.default.svc.cluster.local"
  # REDIS_PORT: "6379"
  # REDIS_PASSWORD: "your-password"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verify-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-verify-app:latest
        envFrom:
        - secretRef:
            name: verify-app-secrets
        env:
        - name: NODE_ENV
          value: "production"
```

### Environment File (.env.production)

```bash
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# Required
NODE_ENV=production
ENCRYPTION_KEY=wCCLYnTAlfFk2ccB
ENCRYPTION_IV=2908yrhozH0ppXmA

# Optional - Redis
# REDIS_HOST=redis.your-cloud.com
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password

# Optional - Legacy QR codes
# API_BASE_URL=https://scan-api.example.com

# Optional - Logging
# LOG_ENDPOINT=https://logs.example.com/api/audit
```

---

## 🔒 **Security Best Practices**

1. **Never commit** `.env` or `.env.production` to git
2. **Rotate encryption keys** regularly
3. **Use different keys** for dev/staging/production
4. **Store in secrets manager** (Kubernetes Secrets, AWS Secrets Manager, etc.)
5. **Limit access** to environment variables
6. **Whitelist domains** in proxy (edit `app/api/proxy/route.ts`)

---

## ✅ **Pre-Deployment Checklist**

- [ ] `ENCRYPTION_KEY` is 16, 24, or 32 characters
- [ ] `ENCRYPTION_IV` is exactly 16 characters
- [ ] Keys match what was used to encrypt QR codes
- [ ] `.env.production` is in `.gitignore`
- [ ] Test decryption with sample QR code
- [ ] Backend domains are whitelisted in proxy
- [ ] If using Redis: Connection is tested
- [ ] If using Redis: All org keys are populated

---

## 🧪 **Testing**

### Test Encryption/Decryption

```bash
cd nextjs

# Test decrypt
node tests/manual/test-decrypt.js "encrypted_qr_data_here"

# Test encrypt
node tests/manual/test-encryption.js "data_to_encrypt"
```

### Test Verify Flow

```bash
cd nextjs

# Start server
PORT=3000 npm run dev

# Test with sample QR
curl "http://localhost:3000/verify?org=napbiotec&data=encrypted_data"
```

---

## 📊 **Environment Variable Matrix**

| Scenario | ENCRYPTION_KEY | ENCRYPTION_IV | API_BASE_URL | REDIS_* | LOG_ENDPOINT |
|----------|----------------|---------------|--------------|---------|--------------|
| **Basic Production** | ✅ Required | ✅ Required | ❌ Not needed | ❌ Not needed | ❌ Not needed |
| **Multi-Org (Redis)** | ✅ Fallback | ✅ Fallback | ❌ Not needed | ✅ Required | ❌ Not needed |
| **Legacy QR Support** | ✅ Required | ✅ Required | ✅ Required | ❌ Not needed | ❌ Not needed |
| **Full Setup** | ✅ Required | ✅ Required | ✅ Optional | ✅ Optional | ✅ Optional |

---

## 🎯 **Key Takeaways**

1. **Only 3 variables are REQUIRED** for basic production:
   - `NODE_ENV=production`
   - `ENCRYPTION_KEY`
   - `ENCRYPTION_IV`

2. **Modern QR codes** (with full backend response) don't need `API_BASE_URL`

3. **Proxy handles all backend URLs** automatically - no client-side configuration needed

4. **Redis is optional** - only needed for org-specific encryption keys

5. **The app auto-detects** the serving URL - no need for `NEXT_PUBLIC_BASE_URL`

---

## 📚 **Related Documentation**

- `.github/agent-md/PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `.github/agent-md/ENV_COMPARISON.md` - C# vs Next.js env vars
- `.github/agent-md/MISSING_ENV_VARS.md` - Missing variables analysis
- `nextjs/tests/manual/test-decrypt.js` - Decryption testing tool

---

**Questions? Check your QR code format and server logs to determine which optional variables you need!**
