# C# Encryption Configuration Analysis

## Summary of Findings from `/obsoleted` Folder

Based on analysis of the original C# ASP.NET Core application, here's how encryption keys were configured:

---

## Environment Variables Used

### In C# Code (VerifyController.cs)

```csharp
// Lines 64-65
Encryption_Key = Environment.GetEnvironmentVariable("ENCRYPTION_KEY"),
Encryption_Iv = Environment.GetEnvironmentVariable("ENCRYPTION_IV"),
```

**Environment Variable Names:**
- ✅ `ENCRYPTION_KEY` - Main encryption key
- ✅ `ENCRYPTION_IV` - Initialization Vector

---

## Key Sources (Priority Order)

### 1. **Environment Variables** (Primary - Local Development)

```csharp
var e = new EncryptionConfig()
{
    Encryption_Key = Environment.GetEnvironmentVariable("ENCRYPTION_KEY"),
    Encryption_Iv = Environment.GetEnvironmentVariable("ENCRYPTION_IV"),
};
```

**Used when:** No organization parameter or local development mode

### 2. **Redis Cache** (Production)

```csharp
var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
var cacheKey = $"CacheLoader:{env}:ScanItemActions:{org}";
var t = _redis.GetObjectAsync<EncryptionConfig>(cacheKey).Result;
```

**Redis Key Pattern:** `CacheLoader:{environment}:ScanItemActions:{organization}`

**Example:**
- `CacheLoader:Production:ScanItemActions:napbiotec`
- `CacheLoader:Development:ScanItemActions:testorg`

### 3. **Hardcoded Fallback** (Testing Only)

```csharp
if (t == null)
{
    t = new EncryptionConfig()
    {
        //This is fake
        Encryption_Key = "99999999999999",
        Encryption_Iv = "AAAAAAAAAAAAAAAA",
    };
}
```

**⚠️ Warning:** These are fake/test values, not for production!

---

## Configuration Files

### appsettings.json
```json
{
  "Logging": { ... },
  "AllowedHosts": "*"
}
```

**❌ No encryption keys stored in appsettings.json**

### appsettings.Development.json
```json
{
  "Logging": { ... }
}
```

**❌ No encryption keys stored in appsettings.Development.json**

---

## Encryption Algorithm Details

### From `EncryptionUtils.cs`

```csharp
using (Aes aes = Aes.Create())
{
    aes.Key = Encoding.UTF8.GetBytes(key);
    aes.IV = Encoding.UTF8.GetBytes(iv);
    aes.Mode = CipherMode.CBC;
    aes.Padding = PaddingMode.PKCS7;
    // ...
}
```

**Algorithm:** AES (Advanced Encryption Standard)
**Mode:** CBC (Cipher Block Chaining)
**Padding:** PKCS7
**Encoding:** UTF-8

**Key Requirements:**
- Key is converted to bytes using UTF-8 encoding
- IV is converted to bytes using UTF-8 encoding
- **Key length:** Depends on key size (16, 24, or 32 bytes for AES-128, AES-192, or AES-256)
- **IV length:** Always 16 bytes (128 bits) for AES

---

## Key Length Analysis

### Based on Fallback Values

```csharp
Encryption_Key = "99999999999999",      // 14 characters = 14 bytes ❌
Encryption_Iv = "AAAAAAAAAAAAAAAA",     // 16 characters = 16 bytes ✅
```

**Issue:** The fallback key is only 14 bytes, which is too short for standard AES!

### Standard AES Key Sizes

| AES Type | Key Size | Key Length (bytes) | Key Length (chars UTF-8) |
|----------|----------|-------------------|-------------------------|
| AES-128  | 128 bits | 16 bytes          | 16 characters           |
| AES-192  | 192 bits | 24 bytes          | 24 characters           |
| AES-256  | 256 bits | 32 bytes          | 32 characters           |

**IV Size (Always):** 16 bytes (16 characters in UTF-8)

---

## Your Current `.env` File

```properties
ENCRYPTION_KEY=wCCLYnTAlfFk2ccBxx  # 19 characters = 19 bytes
ENCRYPTION_IV=2908yrhozH0ppXmA     # 16 characters = 16 bytes ✅
```

### Analysis

- ✅ **IV:** Correct length (16 bytes)
- ⚠️ **Key:** 19 bytes - Not standard AES size!
  - Too long for AES-128 (16 bytes)
  - Too short for AES-192 (24 bytes)
  - Too short for AES-256 (32 bytes)

### Recommendation

You need to determine which AES mode the production system uses:

1. **If AES-128:** Key must be **exactly 16 characters**
   ```properties
   ENCRYPTION_KEY=wCCLYnTAlfFk2ccB  # Trim to 16 chars
   ```

2. **If AES-192:** Key must be **exactly 24 characters**
   ```properties
   ENCRYPTION_KEY=wCCLYnTAlfFk2ccBxxxxxxxx  # Extend to 24 chars
   ```

3. **If AES-256:** Key must be **exactly 32 characters**
   ```properties
   ENCRYPTION_KEY=wCCLYnTAlfFk2ccBxxxxxxxxxxxxxxxx  # Extend to 32 chars
   ```

---

## How to Find Production Keys

### Method 1: Check Redis (Production)

```bash
# Connect to production Redis
redis-cli -h your-redis-host -p 6379

# List all cache keys
KEYS CacheLoader:*

# Get specific organization's encryption config
GET CacheLoader:Production:ScanItemActions:napbiotec

# The result should be a JSON object like:
# {"Encryption_Key":"actualkey","Encryption_Iv":"actualiv"}
```

### Method 2: Ask DevOps/Infrastructure Team

The encryption keys are likely:
1. Stored in a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
2. Set as environment variables in the deployment platform
3. Cached in Redis for each organization

### Method 3: Check Production Logs

When decryption succeeds with production data, the key length used will be logged (if you add logging).

---

## Migration Checklist

### For Next.js Application

- [x] Environment variable names match C# (`ENCRYPTION_KEY`, `ENCRYPTION_IV`)
- [ ] **Determine correct key length** from production system
- [ ] **Get actual production keys** from Redis or secrets manager
- [ ] Update `.env` with correct key length
- [ ] Test decryption with production encrypted data
- [ ] Verify decryption produces correct JSON payload

---

## Security Notes

### ⚠️ Current Issues

1. **Key in `.env` file**
   - ✅ Good for local development
   - ❌ Should NOT be committed to git
   - ❌ Should use secrets manager in production

2. **Key length mismatch**
   - Current: 19 bytes (non-standard)
   - Need: 16, 24, or 32 bytes (standard AES)

3. **Fallback keys in code**
   - C# had hardcoded fake keys: `"99999999999999"`
   - These are for testing only, not production!

### ✅ Best Practices

1. **Use different keys per environment:**
   - Development: Test keys in `.env` (not committed)
   - Staging: Staging keys from secrets manager
   - Production: Production keys from secrets manager

2. **Store keys securely:**
   - Local: `.env` file (add to `.gitignore`)
   - CI/CD: GitHub Secrets, GitLab CI Variables
   - Production: AWS Secrets Manager, Azure Key Vault, HashiCorp Vault

3. **Key rotation:**
   - Have a plan to rotate keys periodically
   - Update both encryption service and cached values

---

## Example: Getting Keys from Production Redis

```bash
# 1. Connect to Redis
redis-cli -h production-redis.example.com -p 6379

# 2. Check if keys exist
KEYS CacheLoader:Production:ScanItemActions:*

# Output example:
# 1) "CacheLoader:Production:ScanItemActions:napbiotec"
# 2) "CacheLoader:Production:ScanItemActions:customer2"

# 3. Get encryption config for napbiotec
GET CacheLoader:Production:ScanItemActions:napbiotec

# Output example (JSON string):
# "{\"Encryption_Key\":\"wCCLYnTAlfFk2ccB\",\"Encryption_Iv\":\"2908yrhozH0ppXmA\"}"

# 4. Parse JSON and count characters
# Encryption_Key: "wCCLYnTAlfFk2ccB" = 16 characters = AES-128 ✅
# Encryption_Iv: "2908yrhozH0ppXmA" = 16 characters = Correct ✅
```

---

## Summary Table

| Configuration | C# (Obsoleted) | Next.js (Current) | Match? |
|---------------|----------------|-------------------|--------|
| **Env Var Name (Key)** | `ENCRYPTION_KEY` | `ENCRYPTION_KEY` | ✅ |
| **Env Var Name (IV)** | `ENCRYPTION_IV` | `ENCRYPTION_IV` | ✅ |
| **Algorithm** | AES-CBC-PKCS7 | AES-CBC-PKCS7 | ✅ |
| **Key Source (Dev)** | Environment Variables | Environment Variables (`.env`) | ✅ |
| **Key Source (Prod)** | Redis Cache | Environment Variables | ⚠️ Different |
| **Key Length** | Unknown (from Redis) | 19 bytes | ❓ Need to verify |
| **IV Length** | 16 bytes | 16 bytes | ✅ |
| **Fallback Keys** | `"99999999999999"` (fake) | None | ✅ Better |

---

## Next Steps

1. **Contact DevOps/Infrastructure team** to get:
   - Production Redis host/credentials
   - Organization names (e.g., "napbiotec")
   - Actual encryption keys used

2. **Query Redis** to get actual keys:
   ```bash
   redis-cli -h prod-redis GET CacheLoader:Production:ScanItemActions:napbiotec
   ```

3. **Determine key length** from production data:
   - Count characters in `Encryption_Key`
   - Should be 16, 24, or 32 characters

4. **Update `.env`** with correct key:
   ```properties
   ENCRYPTION_KEY=<actual-production-key>
   ENCRYPTION_IV=<actual-production-iv>
   ```

5. **Test with production URL** to verify decryption works

---

**Date:** October 18, 2025  
**Status:** 🔍 **Investigation Complete - Awaiting Production Keys**  
**Action Required:** Get actual production keys from Redis or secrets manager
