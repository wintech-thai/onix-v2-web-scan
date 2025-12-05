# Customer Deployment Checklist - ONIX v2 Web Scan

## ⚠️ CRITICAL: How Encryption Works in Production

**Your app gets ENCRYPTION_KEY and ENCRYPTION_IV from Redis cache in production**

Redis is a **cache** that stores encryption keys for different organizations in your private cloud.

---

## 🔧 Fix Your Current Error

### Error You're Seeing:
```
❌ Redis connection error: Stream isn't writeable and enableOfflineQueue options is false
Encryption config not found in Redis for key: CacheLoader:Development:ScanItemActions:napbiotec
```

### Root Causes:
1. **Redis connection failing** - Missing REDIS_PASSWORD or wrong host
2. **Wrong environment** - Using "Development" instead of "Production"
3. **Cache key not populated** - No encryption keys in Redis yet

---

## ✅ Step-by-Step Fix

### Step 1: Set Redis Password in Kubernetes

Your production Redis requires authentication. Add this environment variable:

```bash
kubectl create secret generic onix-scan-redis \
  --from-literal=password='your-redis-password' \
  --namespace=your-namespace
```

Then in your deployment YAML:
```yaml
env:
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: onix-scan-redis
      key: password
```

### Step 2: Set NODE_ENV to "production"

**CRITICAL**: This determines which Redis cache keys to use.

```yaml
env:
- name: NODE_ENV
  value: "production"  # NOT "development"!
```

This makes the app look for:
```
CacheLoader:Production:ScanItemActions:napbiotec
```
Instead of:
```
CacheLoader:Development:ScanItemActions:napbiotec  ❌
```

### Step 3: Populate Redis with Encryption Keys

**BEFORE deploying the app**, you must add encryption keys to Redis:

```bash
# Connect to your Redis
redis-cli -h your-redis-host.private.cloud -p 6379 -a your-redis-password

# Set encryption keys for each organization
# Option 1: Using lowercase (your current format)
SET "CacheLoader:Production:ScanItemActions:napbiotec" "{\"encryption_key\":\"wCCLYnTAlfFk2ccB\",\"encryption_iv\":\"2908yrhozH0ppXmA\"}"

# Option 2: Using PascalCase (C# format)
SET "CacheLoader:Production:ScanItemActions:napbiotec" "{\"Encryption_Key\":\"wCCLYnTAlfFk2ccB\",\"Encryption_Iv\":\"2908yrhozH0ppXmA\"}"

# Both formats work! The code supports both naming conventions.

# Verify
GET "CacheLoader:Production:ScanItemActions:napbiotec"
```

**Important Notes:**
- ✅ Supports both `encryption_key` (lowercase) and `Encryption_Key` (PascalCase)
- ✅ Supports both `encryption_iv` (lowercase) and `Encryption_Iv` (PascalCase)
- ⚠️ Encryption_Key must be **16, 24, or 32 characters** (AES-128/192/256)
- ⚠️ Encryption_Iv must be **exactly 16 characters**
- ⚠️ Use double quotes in JSON, escape them in the command: `\"`