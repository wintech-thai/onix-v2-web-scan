# Production Deployment Guide for Customer Kubernetes

## Overview

This application gets **ENCRYPTION_KEY** and **ENCRYPTION_IV** from Redis cache in production. Redis is used as a cache to store encryption keys for different organizations in your private cloud.

---

## Required Environment Variables for Kubernetes

### 1. Redis Configuration (REQUIRED)

```yaml
REDIS_HOST=your-redis-host.private.cloud    # Redis hostname in private cloud
REDIS_PORT=6379                             # Redis port (default: 6379)
REDIS_PASSWORD=your-redis-password          # Redis authentication password
NODE_ENV=production                         # Must be "production" for production deployment
```

### 2. Fallback Encryption Keys (OPTIONAL - for emergency fallback only)

```yaml
ENCRYPTION_KEY=16-24-32-chars-key          # Only used if Redis cache miss
ENCRYPTION_IV=exactly-16-chars-iv          # Only used if Redis cache miss
```

**Note**: In normal production operation, these fallback keys should NOT be needed because encryption keys will be fetched from Redis cache.

---

## How It Works

### 1. Application Flow

```
User Request
    ↓
Application extracts organization from URL (e.g., "napbiotec")
    ↓
Application fetches encryption config from Redis:
    Key: CacheLoader:Production:ScanItemActions:napbiotec
    ↓
Redis returns: {"Encryption_Key":"...", "Encryption_Iv":"..."}
    ↓
Application uses keys to decrypt data
    ↓
Display result to user
```

### 2. Redis Cache Pattern

**Cache Key Format** (matches C# pattern):
```
CacheLoader:{Environment}:ScanItemActions:{organization}
```

**Example Production Keys**:
```
CacheLoader:Production:ScanItemActions:napbiotec
CacheLoader:Production:ScanItemActions:company1
CacheLoader:Production:ScanItemActions:company2
```

### 3. Environment Mapping

| NODE_ENV    | Redis Cache Key Environment |
|-------------|----------------------------|
| production  | Production                 |
| development | Development                |
| test        | Test                       |

---

## Step 1: Prepare Redis Cache

Before deploying the application, populate Redis with encryption keys for each organization.

### Connect to Redis

```bash
redis-cli -h your-redis-host.private.cloud -p 6379 -a your-redis-password
```

### Set Encryption Keys for Each Organization

```bash
# For organization "napbiotec"
SET "CacheLoader:Production:ScanItemActions:napbiotec" '{"Encryption_Key":"your-16-24-32-char-key","Encryption_Iv":"your-16-char-iv"}'

# For organization "company1"
SET "CacheLoader:Production:ScanItemActions:company1" '{"Encryption_Key":"company1-key-here","Encryption_Iv":"company1-iv-here"}'

# For organization "company2"
SET "CacheLoader:Production:ScanItemActions:company2" '{"Encryption_Key":"company2-key-here","Encryption_Iv":"company2-iv-here"}'
```

### Verify Keys Are Set

```bash
GET "CacheLoader:Production:ScanItemActions:napbiotec"
# Should return: {"Encryption_Key":"your-16-24-32-char-key","Encryption_Iv":"your-16-char-iv"}
```

### Important Notes

- **Encryption_Key** must be **16, 24, or 32 characters** (for AES-128/192/256)
- **Encryption_Iv** must be **exactly 16 characters**
- Keys are **case-sensitive**: `Encryption_Key` and `Encryption_Iv` (capital E, underscore)
- JSON format must be **exact** - use double quotes, no trailing comma

---

## Step 2: Create Kubernetes Secrets

### Create Secret for Redis Password

```bash
kubectl create secret generic onix-scan-redis \
  --from-literal=password='your-redis-password' \
  --namespace=your-namespace
```

### Create Secret for Fallback Encryption Keys (Optional)

```bash
kubectl create secret generic onix-scan-encryption \
  --from-literal=key='fallback-key-16chars' \
  --from-literal=iv='fallback-iv-16ch' \
  --namespace=your-namespace
```

---

## Step 3: Create Kubernetes ConfigMap

```bash
kubectl create configmap onix-scan-config \
  --from-literal=REDIS_HOST='your-redis-host.private.cloud' \
  --from-literal=REDIS_PORT='6379' \
  --from-literal=NODE_ENV='production' \
  --namespace=your-namespace
```

---

## Step 4: Deploy Application

### Option A: Using kubectl with YAML

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: onix-v2-web-scan
  namespace: your-namespace
spec:
  replicas: 3
  selector:
    matchLabels:
      app: onix-v2-web-scan
  template:
    metadata:
      labels:
        app: onix-v2-web-scan
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
        
        # Redis password from Secret
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: onix-scan-redis
              key: password
        
        # Optional: Fallback encryption keys (only used if Redis fails)
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: onix-scan-encryption
              key: key
              optional: true
        
        - name: ENCRYPTION_IV
          valueFrom:
            secretKeyRef:
              name: onix-scan-encryption
              key: iv
              optional: true
        
        # Health check
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: onix-v2-web-scan
  namespace: your-namespace
spec:
  type: ClusterIP
  selector:
    app: onix-v2-web-scan
  ports:
  - port: 80
    targetPort: 5000
    protocol: TCP
    name: http
```

Deploy:

```bash
kubectl apply -f deployment.yaml
```

### Option B: Using Helm (if you use Helm)

Create `values.yaml`:

```yaml
replicaCount: 3

image:
  repository: your-registry/onix-v2-web-scan
  tag: latest
  pullPolicy: Always

service:
  type: ClusterIP
  port: 80
  targetPort: 5000

env:
  REDIS_HOST: "your-redis-host.private.cloud"
  REDIS_PORT: "6379"
  NODE_ENV: "production"

secrets:
  redisPassword: "your-redis-password"
  encryptionKey: "fallback-key-16chars"  # Optional
  encryptionIv: "fallback-iv-16ch"       # Optional

resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

healthCheck:
  enabled: true
  path: /health
  port: 5000
```

---

## Step 5: Verify Deployment

### Check Pods Are Running

```bash
kubectl get pods -n your-namespace -l app=onix-v2-web-scan
```

Expected output:
```
NAME                                READY   STATUS    RESTARTS   AGE
onix-v2-web-scan-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
onix-v2-web-scan-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
onix-v2-web-scan-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

### Check Application Logs

```bash
kubectl logs -f deployment/onix-v2-web-scan -n your-namespace
```

**Expected logs (SUCCESS)**:
```
✅ Redis connected successfully
Redis password authentication enabled
@@@@ P'James debug nodeEnv: [production]
Fetching encryption config from Redis: CacheLoader:Production:ScanItemActions:napbiotec
✓ Successfully fetched encryption config from Redis
```

**Error logs to watch for**:
```
❌ Redis connection error: ...          # Redis connection failed
Encryption config not found in Redis    # Cache key missing
Fallback failed: ENCRYPTION_KEY...      # No fallback keys
```

### Test Health Endpoint

```bash
kubectl port-forward svc/onix-v2-web-scan 8080:80 -n your-namespace
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-19T...",
  "uptime": 123.456,
  "redis": "connected"
}
```

### Test Actual Verification

Use a real encrypted URL from your system:
```bash