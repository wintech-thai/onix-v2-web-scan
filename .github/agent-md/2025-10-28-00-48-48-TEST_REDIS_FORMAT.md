# Redis Format Testing Guide

## ✅ Your Current Redis Format Works Now!

Your Redis has:
```json
{"encryption_key":"wCCLYnTAlfFk2ccB", "encryption_iv":"2908yrhozH0ppXmA"}
```

**This format is now supported!** ✅

---

## Supported Redis Formats

The application now supports **BOTH** naming conventions:

### Format 1: Lowercase (Your Current Format) ✅
```bash
SET "CacheLoader:Development:ScanItemActions:napbiotec" "{\"encryption_key\":\"wCCLYnTAlfFk2ccB\",\"encryption_iv\":\"2908yrhozH0ppXmA\"}"
```

### Format 2: PascalCase (C# Original Format) ✅
```bash
SET "CacheLoader:Development:ScanItemActions:napbiotec" "{\"Encryption_Key\":\"wCCLYnTAlfFk2ccB\",\"Encryption_Iv\":\"2908yrhozH0ppXmA\"}"
```

### Format 3: Mixed (Also Works) ✅
```bash
SET "CacheLoader:Development:ScanItemActions:napbiotec" "{\"encryption_key\":\"wCCLYnTAlfFk2ccB\",\"Encryption_Iv\":\"2908yrhozH0ppXmA\"}"
```

**All formats above work!** The code automatically detects and uses whichever format you have.

---

## How It Works

The code checks for keys in this priority:

1. **PascalCase first**: `Encryption_Key` / `Encryption_Iv`
2. **Lowercase fallback**: `encryption_key` / `encryption_iv`
3. **Environment variables**: If neither found in Redis

### Code Logic:
```typescript
const config = {
  Encryption_Key: rawConfig.Encryption_Key || rawConfig.encryption_key || '',
  Encryption_Iv: rawConfig.Encryption_Iv || rawConfig.encryption_iv || '',
};
```

---

## Test Your Current Setup

### 1. Check Redis Value
```bash
redis-cli -h 127.0.0.1 -p 6379
GET "CacheLoader:Development:ScanItemActions:napbiotec"
```

Expected output (your current format):
```
"{\"encryption_key\":\"wCCLYnTAlfFk2ccB\",\"encryption_iv\":\"2908yrhozH0ppXmA\"}"
```

### 2. Test Application
Visit your verification URL:
```
http://localhost:5001/verify?data=YOUR_ENCRYPTED_DATA&org=napbiotec
```

### 3. Check Logs
You should see:
```
✅ Redis connected successfully
Fetching encryption config from Redis: CacheLoader:Development:ScanItemActions:napbiotec
✓ Successfully fetched encryption config from Redis
Raw config from Redis: { encryption_key: 'wCCLYnTAlfFk2ccB', encryption_iv: '2908yrhozH0ppXmA' }
```

**No more errors!** ✅

---

## For Production Deployment

### Environment Variables Needed:

```yaml
# Kubernetes ConfigMap
REDIS_HOST: "your-redis-host"
REDIS_PORT: "6379"
NODE_ENV: "production"  # ← Changes to "Production" in cache key

# Kubernetes Secret
REDIS_PASSWORD: "your-redis-password"
```

### Production Redis Keys:

```bash
# Production uses "Production" (capital P) in cache key
SET "CacheLoader:Production:ScanItemActions:napbiotec" "{\"encryption_key\":\"your-prod-key-16chars\",\"encryption_iv\":\"your-prod-iv-16ch\"}"

SET "CacheLoader:Production:ScanItemActions:company1" "{\"encryption_key\":\"company1-key-here\",\"encryption_iv\":\"company1-iv-here\"}"
```

**Note the difference:**
- Development: `CacheLoader:Development:ScanItemActions:napbiotec`
- Production: `CacheLoader:Production:ScanItemActions:napbiotec`

The `NODE_ENV` environment variable controls which cache key to use!

---

## Troubleshooting

### Issue: "Encryption config not found in Redis"

**Check:**
1. Is Redis connected? Look for: `✅ Redis connected successfully`
2. Is `NODE_ENV` correct? 
   - `development` → looks for `CacheLoader:Development:...`
   - `production` → looks for `CacheLoader:Production:...`
3. Does the key exist in Redis?
   ```bash
   KEYS "CacheLoader:*:ScanItemActions:napbiotec"
   ```

### Issue: "Invalid encryption config from Redis"

**Check:**
1. Is the JSON valid?
2. Does it have `encryption_key` or `Encryption_Key`?
3. Does it have `encryption_iv` or `Encryption_Iv`?
4. Are the values not empty strings?

Example of **valid** JSON (all these work):
```json
{"encryption_key":"wCCLYnTAlfFk2ccB","encryption_iv":"2908yrhozH0ppXmA"}
{"Encryption_Key":"wCCLYnTAlfFk2ccB","Encryption_Iv":"2908yrhozH0ppXmA"}
{"encryption_key":"wCCLYnTAlfFk2ccB","Encryption_Iv":"2908yrhozH0ppXmA"}
```

Example of **invalid** JSON:
```json
{"key":"...","iv":"..."}          ❌ Wrong property names
{"encryption_key":""}             ❌ Empty key
{"Encryption_Key":"abc"}          ❌ Key too short (need 16+ chars)
```

---

## Redis is Server-Side Only ✅

**Q: Does Redis connect from server-side or client-side?**

**A: Server-side only!** ✅

In Next.js App Router:
- ✅ **Server Components** (default) - Can access Redis
- ✅ **API Routes** (`/api/*`) - Can access Redis
- ❌ **Client Components** (`'use client'`) - Cannot access Redis (browser)

Your verification page (`app/verify/page.tsx`) is a **Server Component**, so it can access Redis directly. This is correct and secure! 🔒

**Why server-side is better:**
- 🔒 Redis credentials never exposed to browser
- 🔒 Encryption keys never sent to client
- ⚡ Direct database access (faster)
- 🛡️ More secure (no CORS issues)

---

## Summary

✅ **Fixed**: Code now supports both `encryption_key` (lowercase) and `Encryption_Key` (PascalCase)

✅ **Your current Redis format works!** No need to change it.

✅ **Server-side Redis connection** is correct and secure.

✅ **Ready for production** - Just set `NODE_ENV=production` and populate production cache keys.

**Next step**: Test with a real encrypted URL to verify end-to-end flow! 🚀
