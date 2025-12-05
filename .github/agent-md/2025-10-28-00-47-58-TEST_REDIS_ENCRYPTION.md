# Testing Guide: Redis Encryption Key Retrieval

**Purpose:** Verify that the application correctly retrieves encryption keys from Redis in production  
**Status:** Ready for Testing  
**Priority:** Critical  

---

## Quick Test Scenarios

### Scenario 1: Local Development (No Redis)

**Setup:**
```bash
# Ensure Redis is NOT configured
unset REDIS_HOST
unset REDIS_PORT

# Set encryption keys in environment
export ENCRYPTION_KEY="12345678901234567890123456789012"  # 32 chars
export ENCRYPTION_IV="1234567890123456"                   # 16 chars
export RUNTIME_ENV="development"

# Start server
cd nextjs
npm run dev
```

**Test:**
```bash
# Access verify page with encrypted data
curl "http://localhost:3500/verify?org=napbiotec&theme=default&lang=th&data=YOUR_ENCRYPTED_DATA"
```

**Expected Logs:**
```
🔐 Getting encryption config for org: napbiotec
Redis not configured, using environment variable fallback
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)
```

**Expected Result:**
- ✅ Page loads successfully
- ✅ Decryption succeeds
- ✅ Verification data displayed

---

### Scenario 2: Production with Redis (Keys in Redis)

**Setup:**
```bash
# Configure Redis
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"
export REDIS_PASSWORD="your-redis-password"  # Optional
export REDIS_TLS="true"                      # Optional
export RUNTIME_ENV="production"

# Set fallback keys (in case Redis fails)
export ENCRYPTION_KEY="fallback-key-12345678901234567890"
export ENCRYPTION_IV="fallback-iv-12345"

# Populate Redis with org-specific keys
redis-cli -h your-redis-host.com -p 6379 -a your-redis-password \
  SET "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"production-key-1234567890123456","Encryption_Iv":"production-iv-123"}'

# Start server
cd nextjs
npm run build
npm start
```

**Test:**
```bash
curl "http://localhost:3500/verify?org=napbiotec&theme=default&lang=th&data=YOUR_ENCRYPTED_DATA"
```

**Expected Logs:**
```
🔐 Getting encryption config for org: napbiotec
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
✓ Successfully fetched encryption config from Redis
Raw config from Redis: { Encryption_Key: 'production-key-1234567890123456', Encryption_Iv: 'production-iv-123' }
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)
```

**Expected Result:**
- ✅ Page loads successfully
- ✅ Uses Redis keys (NOT environment variables)
- ✅ Decryption succeeds
- ✅ Verification data displayed

---

### Scenario 3: Production with Redis (Keys NOT in Redis - Fallback)

**Setup:**
```bash
# Configure Redis (same as Scenario 2)
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"
export RUNTIME_ENV="production"

# Set fallback keys
export ENCRYPTION_KEY="fallback-key-12345678901234567890"
export ENCRYPTION_IV="fallback-iv-12345"

# DO NOT populate Redis - test fallback
# redis-cli DEL "CacheLoader:Production:ScanItemActions:napbiotec"

# Start server
cd nextjs
npm start
```

**Test:**
```bash
curl "http://localhost:3500/verify?org=napbiotec&theme=default&lang=th&data=YOUR_ENCRYPTED_DATA"
```

**Expected Logs:**
```
🔐 Getting encryption config for org: napbiotec
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
⚠ Encryption config not found in Redis for key: CacheLoader:Production:ScanItemActions:napbiotec
Using environment variable fallback
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)
```

**Expected Result:**
- ✅ Page loads successfully
- ✅ Falls back to environment variables
- ✅ Decryption succeeds (if data was encrypted with fallback keys)
- ✅ Warning logged about missing Redis key

---

### Scenario 4: Multi-Org Test (Different Keys per Org)

**Setup:**
```bash
# Configure Redis
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"
export RUNTIME_ENV="production"

# Populate Redis with DIFFERENT keys for each org
redis-cli SET "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"napbiotec-key-123456789012345678","Encryption_Iv":"napbiotec-iv-123"}'

redis-cli SET "CacheLoader:Production:ScanItemActions:testorg" \
  '{"Encryption_Key":"testorg-key-1234567890123456789","Encryption_Iv":"testorg-iv-1234"}'

# Start server
cd nextjs
npm start
```

**Test Org 1 (napbiotec):**
```bash
curl "http://localhost:3500/verify?org=napbiotec&theme=default&lang=th&data=NAPBIOTEC_ENCRYPTED_DATA"
```

**Expected:** Uses `napbiotec-key-...` from Redis

**Test Org 2 (testorg):**
```bash
curl "http://localhost:3500/verify?org=testorg&theme=default&lang=th&data=TESTORG_ENCRYPTED_DATA"
```

**Expected:** Uses `testorg-key-...` from Redis

**Expected Result:**
- ✅ Each org uses its own encryption keys
- ✅ Decryption succeeds for both
- ✅ No key leakage between orgs

---

## Verification Checklist

### Before Deployment

- [ ] Redis is accessible from application
- [ ] Redis keys exist for all organizations
- [ ] Redis key format is correct: `CacheLoader:{env}:ScanItemActions:{org}`
- [ ] Redis values are valid JSON with `Encryption_Key` and `Encryption_Iv`
- [ ] Key lengths are valid (16, 24, or 32 characters)
- [ ] IV length is valid (16 characters)
- [ ] `RUNTIME_ENV` is set correctly (`production`, `development`, or `test`)
- [ ] Fallback environment variables are set (`ENCRYPTION_KEY`, `ENCRYPTION_IV`)
- [ ] Test with real QR code encrypted with production keys

### After Deployment

- [ ] Check application logs for Redis connection success
- [ ] Verify encryption config retrieval logs
- [ ] Test actual QR code scanning
- [ ] Monitor for decryption errors
- [ ] Verify multi-org deployments use correct keys per org

---

## Manual Testing Commands

### 1. Check Redis Connection from App

```bash
# SSH into app container/pod
kubectl exec -it your-pod-name -- sh

# Test Redis connection
node -e "const redis = require('ioredis'); const client = new redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }); client.ping().then(console.log).catch(console.error);"
```

**Expected:** `PONG`

### 2. Check Redis Key Exists

```bash
# Using redis-cli
redis-cli -h your-redis-host -p 6379 -a your-password

# Get encryption config
GET "CacheLoader:Production:ScanItemActions:napbiotec"
```

**Expected:** Valid JSON with encryption keys

### 3. Validate Redis JSON Format

```bash
# Check JSON is valid
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq .

# Check key length (should be 16, 24, or 32)
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Key | length'

# Check IV length (should be 16)
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Iv | length'
```

### 4. Test Decryption Locally

```bash
# Use the decrypt utility
cd nextjs
node decrypt-production.js
```

---

## Expected Log Messages

### Success (Redis)

```
🔐 Getting encryption config for org: napbiotec
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
✓ Successfully fetched encryption config from Redis
Raw config from Redis: { Encryption_Key: '...', Encryption_Iv: '...' }
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DECRYPTED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Length: 1234
Raw data: {"Status":"VALID","ScanItem":{...}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Success (Environment Fallback)

```
🔐 Getting encryption config for org: napbiotec
Redis not configured, using environment variable fallback
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DECRYPTED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Warning (Redis Key Not Found)

```
🔐 Getting encryption config for org: napbiotec
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
⚠ Encryption config not found in Redis for key: CacheLoader:Production:ScanItemActions:napbiotec
Using environment variable fallback
✅ Successfully retrieved encryption config (key length: 32, IV length: 16)
```

### Error (No Keys Available)

```
🔐 Getting encryption config for org: napbiotec
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
⚠ Encryption config not found in Redis for key: CacheLoader:Production:ScanItemActions:napbiotec
Fallback failed: ENCRYPTION_KEY or ENCRYPTION_IV not set
❌ Failed to get encryption credentials
```

---

## Troubleshooting

### Problem: "Redis connection error"

**Check:**
```bash
# Verify Redis env vars
echo $REDIS_HOST
echo $REDIS_PORT
echo $REDIS_PASSWORD

# Test connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

### Problem: "Encryption config not found in Redis"

**Check:**
```bash
# List all Redis keys
redis-cli KEYS "CacheLoader:*"

# Check exact key
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec"

# Verify RUNTIME_ENV matches
echo $RUNTIME_ENV  # Should be 'production'
```

### Problem: "Decryption failed"

**Check:**
```bash
# Verify key lengths
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Key | length'  # 16, 24, or 32
redis-cli GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Iv | length'   # 16

# Test with known encrypted data
node decrypt-production.js
```

---

## Success Criteria

- ✅ Local development uses environment variables (no Redis)
- ✅ Production reads keys from Redis when available
- ✅ Falls back to environment variables when Redis key missing
- ✅ Multi-org deployments use different keys per organization
- ✅ Decryption succeeds for all valid QR codes
- ✅ Appropriate logs and error messages
- ✅ No security issues (keys not logged in plain text)

---

**Testing Complete:** Once all scenarios pass, the fix is production-ready! 🚀