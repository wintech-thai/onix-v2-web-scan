# Kubernetes Deployment Guide - Environment Variables

**Project**: ONIX v2 Web Scan  
**Date**: 2024-10-18  
**Purpose**: Guide for injecting environment variables in Kubernetes deployment

---

## Overview

This Next.js application is configured to work exactly like the C# version:
- **Development**: Uses `.env` file with fallback encryption keys
- **Production (Kubernetes)**: Uses environment variables injected by Kubernetes
- **Redis**: Fetches organization-specific encryption keys from Redis cache

---

## Environment Variables Required

### 1. Redis Configuration (Production)

```yaml
# Required for production - fetches encryption keys from Redis
REDIS_HOST: your-redis-service.namespace.svc.cluster.local
REDIS_PORT: "6379"
REDIS_PASSWORD: your-redis-password          # Optional
REDIS_TLS: "false"                           # Set to "true" for TLS
```

**Purpose**: Connect to Redis cache to fetch organization-specific encryption keys

**Redis Cache Pattern** (matching C#):
```
CacheLoader:{Environment}:ScanItemActions:{organization}
```

Example:
- Key: `CacheLoader:Production:ScanItemActions:napbiotec`
- Value: `{"Encryption_Key":"prod-key-16chars","Encryption_Iv":"prod-iv-16chars"}`

---

### 2. Encryption Fallback (Development/Backup)

```yaml
# Fallback encryption keys (used when Redis is not available)
ENCRYPTION_KEY: your-fallback-key-16-24-or-32-chars
ENCRYPTION_IV: your-fallback-iv-16-chars
```

**Purpose**: Fallback keys when:
- Redis is not configured (development)
- Redis connection fails
- Organization key not found in Redis

**Requirements**:
- `ENCRYPTION_KEY`: Must be 16, 24, or 32 characters (AES-128/192/256)
- `ENCRYPTION_IV`: Must be exactly 16 characters

---

### 3. Application Configuration

```yaml
# Node environment
NODE_ENV: production

# Server configuration
PORT: "5000"
HOSTNAME: "0.0.0.0"

# Optional: External logging endpoint
NEXT_PUBLIC_LOG_ENDPOINT: https://your-logging-service.com/api/logs
```

---

## Kubernetes Deployment Examples

### Option 1: Using ConfigMap and Secrets (Recommended)

**Step 1: Create Secret for sensitive data**

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: onix-scan-secrets
  namespace: your-namespace
type: Opaque
stringData:
  redis-password: "your-redis-password"
  encryption-key: "prod-key-16chars"
  encryption-iv: "prod-iv-16chars"
```

Apply:
```bash
kubectl apply -f k8s/secrets.yaml
```

---

**Step 2: Create ConfigMap for non-sensitive data**

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: onix-scan-config
  namespace: your-namespace
data:
  NODE_ENV: "production"
  PORT: "5000"
  HOSTNAME: "0.0.0.0"
  REDIS_HOST: "redis-service.your-namespace.svc.cluster.local"
  REDIS_PORT: "6379"
  REDIS_TLS: "false"
```

Apply:
```bash
kubectl apply -f k8s/configmap.yaml
```

---

**Step 3: Create Deployment with environment injection**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: onix-v2-web-scan
  namespace: your-namespace
spec:
  replicas: 3
  selector:
    matchLabels:
      app: onix-scan
  template:
    metadata:
      labels:
        app: onix-scan
    spec:
      containers:
      - name: onix-scan
        image: your-registry/onix-v2-web-scan:latest
        ports:
        - containerPort: 5000
          name: http
        
        # Environment variables from ConfigMap
        envFrom:
        - configMapRef:
            name: onix-scan-config
        
        # Environment variables from Secret
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: onix-scan-secrets
              key: redis-password
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: onix-scan-secrets
              key: encryption-key
        - name: ENCRYPTION_IV
          valueFrom:
            secretKeyRef:
              name: onix-scan-secrets
              key: encryption-iv
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

Apply:
```bash
kubectl apply -f k8s/deployment.yaml
```

---

### Option 2: Direct Environment Variable Injection

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: onix-v2-web-scan
spec:
  template:
    spec:
      containers:
      - name: onix-scan
        image: your-registry/onix-v2-web-scan:latest
        env:
        # Redis Configuration
        - name: REDIS_HOST
          value: "redis-service.namespace.svc.cluster.local"
        - name: REDIS_PORT
          value: "6379"
        - name: REDIS_PASSWORD
          value: "your-redis-password"
        - name: REDIS_TLS
          value: "false"
        
        # Encryption Fallback
        - name: ENCRYPTION_KEY
          value: "fallback-key-16c"
        - name: ENCRYPTION_IV
          value: "fallback-iv-16ch"
        
        # Application Config
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        - name: HOSTNAME
          value: "0.0.0.0"
```

---

### Option 3: Using External Secrets Operator (Advanced)

If your organization uses AWS Secrets Manager, Azure Key Vault, or Google Secret Manager:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretsmanager
  namespace: your-namespace
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: onix-scan-secrets
  namespace: your-namespace
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: onix-scan-secrets
  data:
  - secretKey: redis-password
    remoteRef:
      key: onix/redis-password
  - secretKey: encryption-key
    remoteRef:
      key: onix/encryption-key
  - secretKey: encryption-iv
    remoteRef:
      key: onix/encryption-iv
```

---

## How It Works (Same as C#)

### Application Startup Flow

```typescript
// 1. Request comes in: /verify?org=napbiotec&data=...

// 2. Extract organization from query parameter
const org = searchParams.org || 'unknown';

// 3. Get encryption config (matches C# GetEncryptionConfig)
const encryptionConfig = await getEncryptionConfig(org);

// Inside getEncryptionConfig():
if (REDIS_HOST is set) {
  // Production mode - fetch from Redis
  const cacheKey = `CacheLoader:${NODE_ENV}:ScanItemActions:${org}`;
  const config = await redis.get(cacheKey);
  
  if (config found) {
    return config; // Organization-specific keys
  } else {
    // Fallback to environment variables
    return { 
      Encryption_Key: ENCRYPTION_KEY,
      Encryption_Iv: ENCRYPTION_IV 
    };
  }
} else {
  // Development mode - use environment variables
  return { 
    Encryption_Key: ENCRYPTION_KEY,
    Encryption_Iv: ENCRYPTION_IV 
  };
}

// 4. Decrypt data with fetched keys
const decrypted = decrypt(data, key, iv);

// 5. Return verification result
```

---

## Redis Cache Setup

### Populating Redis Cache (Production)

Your owner/admin needs to populate Redis with organization-specific keys:

```bash
# Connect to Redis
redis-cli -h your-redis-host -p 6379

# Set encryption config for organization
SET "CacheLoader:Production:ScanItemActions:napbiotec" '{"Encryption_Key":"actual-prod-key-16","Encryption_Iv":"actual-prod-iv16"}'

# Set for multiple organizations
SET "CacheLoader:Production:ScanItemActions:org1" '{"Encryption_Key":"org1-key-16chars","Encryption_Iv":"org1-iv-16chars"}'
SET "CacheLoader:Production:ScanItemActions:org2" '{"Encryption_Key":"org2-key-16chars","Encryption_Iv":"org2-iv-16chars"}'

# Verify
GET "CacheLoader:Production:ScanItemActions:napbiotec"
```

**Result**:
```json
{"Encryption_Key":"actual-prod-key-16","Encryption_Iv":"actual-prod-iv16"}
```

---

### Environment Normalization

Application automatically normalizes `NODE_ENV` to match C# convention:

| NODE_ENV | C# Equivalent | Redis Key |
|----------|---------------|-----------|
| `development` | `Development` | `CacheLoader:Development:ScanItemActions:{org}` |
| `production` | `Production` | `CacheLoader:Production:ScanItemActions:{org}` |
| `test` | `Test` | `CacheLoader:Test:ScanItemActions:{org}` |

---

## Testing

### 1. Test Redis Connection

```bash
# Deploy with Redis configured
kubectl apply -f k8s/deployment.yaml

# Check logs
kubectl logs -f deployment/onix-v2-web-scan

# Should see:
# ✅ Redis connected successfully
# Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
# ✓ Successfully fetched encryption config from Redis
```

---

### 2. Test Fallback (Redis Unavailable)

```bash
# Deploy without Redis configuration
# Comment out REDIS_HOST in ConfigMap

kubectl apply -f k8s/deployment.yaml

# Check logs
kubectl logs -f deployment/onix-v2-web-scan

# Should see:
# Redis not configured, using environment variable fallback
# Using ENCRYPTION_KEY and ENCRYPTION_IV from environment
```

---

### 3. Test Decryption

```bash
# Forward port to access application
kubectl port-forward deployment/onix-v2-web-scan 5000:5000

# Test with encrypted URL
curl "http://localhost:5000/verify?org=napbiotec&theme=default&data=your-encrypted-data"

# Should see successful decryption and verification page
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Redis Setup**
  - [ ] Redis service running in Kubernetes
  - [ ] Redis host/port accessible from application pods
  - [ ] Redis password configured (if required)
  - [ ] TLS configured (if required)

- [ ] **Redis Cache Population**
  - [ ] Connect to production Redis
  - [ ] Populate encryption keys for each organization:
    ```bash
    SET "CacheLoader:Production:ScanItemActions:{org}" '{"Encryption_Key":"...","Encryption_Iv":"..."}'
    ```
  - [ ] Verify keys are accessible:
    ```bash
    GET "CacheLoader:Production:ScanItemActions:{org}"
    ```

- [ ] **Kubernetes Secrets**
  - [ ] Create secret with Redis password
  - [ ] Create secret with fallback encryption keys
  - [ ] Verify secrets exist:
    ```bash
    kubectl get secrets -n your-namespace
    ```

- [ ] **ConfigMap**
  - [ ] Create ConfigMap with application config
  - [ ] Set `REDIS_HOST`, `REDIS_PORT`, `NODE_ENV`, etc.
  - [ ] Verify ConfigMap:
    ```bash
    kubectl get configmap onix-scan-config -o yaml
    ```

---

### Deployment

- [ ] **Build and Push Docker Image**
  ```bash
  docker build -t your-registry/onix-v2-web-scan:latest .
  docker push your-registry/onix-v2-web-scan:latest
  ```

- [ ] **Apply Kubernetes Manifests**
  ```bash
  kubectl apply -f k8s/secrets.yaml
  kubectl apply -f k8s/configmap.yaml
  kubectl apply -f k8s/deployment.yaml
  kubectl apply -f k8s/service.yaml
  ```

- [ ] **Verify Deployment**
  ```bash
  kubectl get pods -n your-namespace
  kubectl logs -f deployment/onix-v2-web-scan
  ```

---

### Post-Deployment

- [ ] **Health Check**
  ```bash
  kubectl port-forward deployment/onix-v2-web-scan 5000:5000
  curl http://localhost:5000/health
  # Should return: {"status":"OK",...}
  ```

- [ ] **Redis Connection Test**
  - Check logs for: `✅ Redis connected successfully`
  - Verify no Redis connection errors

- [ ] **Encryption Key Fetch Test**
  - Access verify endpoint with real data
  - Check logs for: `✓ Successfully fetched encryption config from Redis`
  - Verify decryption works correctly

- [ ] **Multi-Organization Test**
  - Test with different `?org=...` parameters
  - Verify each organization gets correct encryption keys
  - Confirm decryption works for all organizations

---

## Environment Variables Reference

### Complete List

```properties
# Redis Configuration (Production)
REDIS_HOST=redis-service.namespace.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password              # Optional
REDIS_TLS=false                                 # Optional

# Encryption Fallback Keys
ENCRYPTION_KEY=fallback-key-16-24-or-32-chars  # 16/24/32 chars
ENCRYPTION_IV=fallback-iv-16chars              # 16 chars

# Application Configuration
NODE_ENV=production                             # development, production, test
PORT=5000                                       # Application port
HOSTNAME=0.0.0.0                               # Listen on all interfaces

# Optional: External Logging
NEXT_PUBLIC_LOG_ENDPOINT=https://logs.example.com/api/audit
```

---

## Troubleshooting

### Redis Connection Issues

**Problem**: `Redis connection error`

**Solution**:
```bash
# Check Redis service is running
kubectl get svc redis-service -n your-namespace

# Test Redis connection from pod
kubectl exec -it deployment/onix-v2-web-scan -- sh
nc -zv redis-service 6379

# Check Redis password
kubectl get secret onix-scan-secrets -o yaml
```

---

### Encryption Key Not Found

**Problem**: `Encryption config not found in Redis for key: CacheLoader:Production:ScanItemActions:napbiotec`

**Solution**:
```bash
# Connect to Redis
redis-cli -h your-redis-host -p 6379

# Check if key exists
EXISTS "CacheLoader:Production:ScanItemActions:napbiotec"

# If not exists, create it
SET "CacheLoader:Production:ScanItemActions:napbiotec" '{"Encryption_Key":"your-key","Encryption_Iv":"your-iv"}'

# Verify
GET "CacheLoader:Production:ScanItemActions:napbiotec"
```

---

### Decryption Failed

**Problem**: `Decryption failed: Invalid key/IV length`

**Solution**:
```bash
# Check key lengths
# ENCRYPTION_KEY: Must be 16, 24, or 32 characters
# ENCRYPTION_IV: Must be exactly 16 characters

# Update secret with correct lengths
kubectl edit secret onix-scan-secrets
# Or delete and recreate with correct values
```

---

## Security Best Practices

1. **Never Commit Secrets**
   - Don't commit `.env` files with production keys
   - Use `.gitignore` to exclude sensitive files
   - Use Kubernetes Secrets or external secret management

2. **Use TLS for Redis**
   - Set `REDIS_TLS=true` for production
   - Configure TLS certificates if required
   - Use encrypted connections to prevent eavesdropping

3. **Rotate Keys Regularly**
   - Update Redis cache with new keys
   - Update Kubernetes secrets
   - Restart pods to pick up new keys

4. **Limit Secret Access**
   - Use Kubernetes RBAC to restrict secret access
   - Only grant access to necessary service accounts
   - Audit secret access regularly

5. **Monitor Redis Access**
   - Enable Redis audit logging
   - Monitor for unauthorized access attempts
   - Set up alerts for failed authentication

---

## Summary

Your Next.js application now works **exactly like the C# version**:

✅ **Development Mode** (no Redis):
- Uses `ENCRYPTION_KEY` and `ENCRYPTION_IV` from `.env` file
- Falls back to environment variables

✅ **Production Mode** (with Redis):
- Connects to Redis using `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Fetches organization-specific keys: `CacheLoader:Production:ScanItemActions:{org}`
- Falls back to environment variables if key not found or Redis unavailable

✅ **Kubernetes Deployment**:
- Owner injects environment variables via ConfigMap and Secrets
- Application automatically detects Redis and uses it
- Graceful fallback to environment variables if needed

**Your owner can now deploy to Kubernetes and inject environment variables just like they did with the C# application!** 🚀

---

**Created By**: GitHub Copilot AI Assistant  
**Date**: 2024-10-18  
**Status**: ✅ **Production-Ready - Matches C# Implementation**
