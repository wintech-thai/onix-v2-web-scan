# Quick Setup Guide - Strict Deployment Mode

**Two Modes. No Confusion. No Mistakes.**

---

## 🏠 LOCAL Mode (Your Laptop/Desktop)

### Step 1: Set Environment Variables

```bash
# Create .env.local file in nextjs/ directory
cat > nextjs/.env.local << 'EOF'
ENCRYPTION_KEY=12345678901234567890123456789012
ENCRYPTION_IV=1234567890123456
EOF
```

Or export directly:

```bash
export ENCRYPTION_KEY="12345678901234567890123456789012"
export ENCRYPTION_IV="1234567890123456"
```

### Step 2: DO NOT Set Redis

```bash
# Make sure these are NOT set:
unset REDIS_HOST
unset REDIS_PORT
```

### Step 3: Start Development Server

```bash
cd nextjs
npm run dev
```

### ✅ Expected Logs

```
✅ Configuration validated: LOCAL mode (Environment variables)
   Encryption keys will be loaded from environment variables ONLY
```

### ❌ If You See Errors

**Error:** "ENCRYPTION_KEY or ENCRYPTION_IV not set"

**Solution:**
```bash
# Check if variables are set
echo $ENCRYPTION_KEY
echo $ENCRYPTION_IV

# If empty, set them:
export ENCRYPTION_KEY="12345678901234567890123456789012"
export ENCRYPTION_IV="1234567890123456"
```

**Error:** "ENCRYPTION_KEY length must be 16, 24, or 32"

**Solution:** Your key must be exactly 16, 24, or 32 characters long.

```bash
# 32 characters (recommended for AES-256)
export ENCRYPTION_KEY="12345678901234567890123456789012"

# 16 characters
export ENCRYPTION_IV="1234567890123456"
```

---

## 🖥️ SERVER Mode (Deployed - Dev/Staging/Production)

### Step 1: Configure Redis Connection

#### Option A: Environment Variables (Kubernetes/Docker)

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: onix-config
data:
  REDIS_HOST: "redis-service.default.svc.cluster.local"
  REDIS_PORT: "6379"
  RUNTIME_ENV: "production"  # or "development", "test"
  
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
type: Opaque
stringData:
  REDIS_PASSWORD: "your-secure-redis-password"
```

#### Option B: Export Directly (VM/Server)

```bash
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"
export REDIS_PASSWORD="your-secure-password"  # if needed
export REDIS_TLS="true"                       # if using TLS
export RUNTIME_ENV="production"
```

### Step 2: Populate Redis with Encryption Keys

**IMPORTANT:** Do this BEFORE deploying the application!

```bash
# Connect to Redis
redis-cli -h your-redis-host.com -p 6379 -a your-password

# For PRODUCTION environment
SET "CacheLoader:Production:ScanItemActions:napbiotec" '{"Encryption_Key":"your-production-key-123456789012","Encryption_Iv":"prod-iv-1234567"}'

# For DEVELOPMENT environment
SET "CacheLoader:Development:ScanItemActions:napbiotec" '{"Encryption_Key":"your-development-key-12345678901","Encryption_Iv":"dev-iv-12345678"}'

# For TEST environment
SET "CacheLoader:Test:ScanItemActions:napbiotec" '{"Encryption_Key":"your-test-key-1234567890123456","Encryption_Iv":"test-iv-1234567"}'
```

**For multiple organizations:**

```bash
# Napbiotec
SET "CacheLoader:Production:ScanItemActions:napbiotec" '{"Encryption_Key":"napbiotec-key-123456789012345678","Encryption_Iv":"napbiotec-iv-123"}'

# Testorg
SET "CacheLoader:Production:ScanItemActions:testorg" '{"Encryption_Key":"testorg-key-1234567890123456789","Encryption_Iv":"testorg-iv-1234"}'
```

### Step 3: Verify Redis Keys

```bash
# Check if keys exist
redis-cli -h your-redis-host.com -p 6379 -a your-password \
  GET "CacheLoader:Production:ScanItemActions:napbiotec"

# Should return:
# {"Encryption_Key":"...","Encryption_Iv":"..."}

# Validate JSON format
redis-cli -h your-redis-host.com -p 6379 -a your-password \
  GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq .

# Check key lengths
redis-cli -h your-redis-host.com -p 6379 -a your-password \
  GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Key | length'
# Should be: 16, 24, or 32

redis-cli -h your-redis-host.com -p 6379 -a your-password \
  GET "CacheLoader:Production:ScanItemActions:napbiotec" | jq -r '.Encryption_Iv | length'
# Should be: 16
```

### Step 4: Deploy Application

```bash
# Build
npm run build

# Start
npm start

# Or deploy to Kubernetes
kubectl apply -f k8s/
```

### ✅ Expected Logs

```
✅ Configuration validated: SERVER mode (Redis required)
   Redis: your-redis-host.com:6379
   Encryption keys will be loaded from Redis ONLY
✅ Redis connected successfully
🔐 Getting encryption config for org: napbiotec [MODE: SERVER]
📍 SERVER mode: Using Redis (NO env var fallback)
✅ SERVER mode: Successfully loaded encryption config from Redis
```

### ❌ If You See Errors

**Error:** "Redis configuration is REQUIRED when REDIS_HOST is set"

**Solution:** Set both `REDIS_HOST` and `REDIS_PORT`

```bash
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"
```

---

**Error:** "Encryption config not found in Redis"

**Solution:** Populate Redis with keys

```bash
# Check your RUNTIME_ENV
echo $RUNTIME_ENV  # Should be "production", "development", or "test"

# Set the correct key
redis-cli SET "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"your-key-12345678901234567890","Encryption_Iv":"your-iv-1234567"}'
```

---

**Error:** "Redis connection error"

**Solution:** Check Redis connectivity

```bash
# Test connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
# Should return: PONG

# If using password
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping

# If connection fails, check:
# 1. Redis is running
# 2. Network allows connection
# 3. Firewall rules
# 4. Redis password is correct
```

---

## 🔄 Switching Between Modes

### From LOCAL to SERVER

```bash
# 1. Set Redis configuration
export REDIS_HOST="your-redis-host.com"
export REDIS_PORT="6379"

# 2. Populate Redis with keys
redis-cli SET "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"...","Encryption_Iv":"..."}'

# 3. Restart application
# Mode will automatically switch to SERVER
```

### From SERVER to LOCAL

```bash
# 1. Unset Redis configuration
unset REDIS_HOST
unset REDIS_PORT

# 2. Set environment variables
export ENCRYPTION_KEY="12345678901234567890123456789012"
export ENCRYPTION_IV="1234567890123456"

# 3. Restart application
# Mode will automatically switch to LOCAL
```

---

## 📋 Environment Checklist

### LOCAL Mode Checklist

- [ ] `ENCRYPTION_KEY` is set (16, 24, or 32 characters)
- [ ] `ENCRYPTION_IV` is set (16 characters)
- [ ] `REDIS_HOST` is NOT set
- [ ] `REDIS_PORT` is NOT set
- [ ] Application starts without Redis errors
- [ ] Logs show "LOCAL mode"

### SERVER Mode Checklist

- [ ] `REDIS_HOST` is set
- [ ] `REDIS_PORT` is set
- [ ] `REDIS_PASSWORD` is set (if Redis requires auth)
- [ ] `RUNTIME_ENV` is set (`production`, `development`, or `test`)
- [ ] Redis is accessible from application
- [ ] Redis contains keys for all organizations
- [ ] Redis keys match format: `CacheLoader:{env}:ScanItemActions:{org}`
- [ ] Redis values are valid JSON with `Encryption_Key` and `Encryption_Iv`
- [ ] Application starts and connects to Redis
- [ ] Logs show "SERVER mode"
- [ ] No environment variables `ENCRYPTION_KEY` or `ENCRYPTION_IV` in server config

---

## 🧪 Testing Your Setup

### Test LOCAL Mode

```bash
# 1. Ensure LOCAL mode
unset REDIS_HOST
export ENCRYPTION_KEY="12345678901234567890123456789012"
export ENCRYPTION_IV="1234567890123456"

# 2. Start server
npm run dev

# 3. Test endpoint
curl "http://localhost:3500/verify?org=napbiotec&data=YOUR_ENCRYPTED_DATA&theme=default&lang=th"

# 4. Check logs for:
# ✅ Configuration validated: LOCAL mode
```

### Test SERVER Mode

```bash
# 1. Ensure SERVER mode
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export RUNTIME_ENV="production"

# 2. Populate Redis
redis-cli SET "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"12345678901234567890123456789012","Encryption_Iv":"1234567890123456"}'

# 3. Start server
npm run build && npm start

# 4. Test endpoint
curl "http://localhost:3500/verify?org=napbiotec&data=YOUR_ENCRYPTED_DATA&theme=default&lang=th"

# 5. Check logs for:
# ✅ Configuration validated: SERVER mode
# ✅ Redis connected successfully
```

---

## 🚨 Common Pitfalls

### ❌ DON'T: Set ENCRYPTION_KEY on Server

```bash
# ❌ WRONG - These will be IGNORED in SERVER mode
export REDIS_HOST="redis-service"
export ENCRYPTION_KEY="some-key"     # IGNORED!
export ENCRYPTION_IV="some-iv"       # IGNORED!
```

### ❌ DON'T: Set REDIS_HOST Locally

```bash
# ❌ WRONG - Forces SERVER mode when you want LOCAL
export REDIS_HOST="localhost"
export ENCRYPTION_KEY="local-key"    # IGNORED!
```

### ✅ DO: Keep Modes Separate

```bash
# ✅ CORRECT - LOCAL mode
unset REDIS_HOST
export ENCRYPTION_KEY="..."
export ENCRYPTION_IV="..."

# ✅ CORRECT - SERVER mode
export REDIS_HOST="..."
export REDIS_PORT="..."
# Keys in Redis, NOT env vars
```

---

## 📞 Need Help?

### Check Mode

```bash
# View current configuration
curl http://localhost:3500/health

# Check logs
tail -f /var/log/app.log | grep "Configuration validated"
```

### Debug Redis Connection

```bash
# Test Redis from application container
kubectl exec -it your-pod-name -- sh
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

### Verify Environment Variables

```bash
# Check what's set
env | grep -E 'REDIS|ENCRYPTION|RUNTIME'

# Should see either:
# LOCAL: ENCRYPTION_KEY, ENCRYPTION_IV
# SERVER: REDIS_HOST, REDIS_PORT, RUNTIME_ENV
```

---

## ✅ Success Criteria

**LOCAL Mode Working:**
- ✅ Logs show "LOCAL mode"
- ✅ No Redis connection attempts
- ✅ Uses environment variables
- ✅ Fast startup

**SERVER Mode Working:**
- ✅ Logs show "SERVER mode"
- ✅ Redis connected successfully
- ✅ Uses Redis keys
- ✅ No fallback to env vars

---

**Remember:** The mode is automatically detected. Just set the right environment variables and it will work! 🚀