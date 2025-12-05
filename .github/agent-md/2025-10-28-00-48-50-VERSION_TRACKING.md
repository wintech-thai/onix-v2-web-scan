# Version Tracking & Deployment Monitoring

This guide explains how to track Git commit IDs and build information for production deployments.

---

## 🎯 Purpose

When deploying to production, you need to know:
- **Which Git commit** is currently running
- **When it was built**
- **What version** it is

This helps with:
- 🐛 Debugging issues (know exactly which code is running)
- 🔄 Rollback decisions (identify good vs bad deployments)
- 📊 Deployment tracking (audit trail)
- 🚨 Incident response (match errors to specific commits)

---

## 🔍 How to Check Version Info

### 1. Health Endpoint

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-19T10:15:30.123Z",
  "service": "onix-v2-web-scan",
  "version": "2.0.0",
  "commit": "a1b2c3d",
  "buildTime": "2025-10-19T09:00:00Z",
  "environment": "production",
  "redis": "connected",
  "uptime": 3600.5
}
```

### 2. Application Logs

When the application starts, it logs:

```
═══════════════════════════════════════════════════
🚀 ONIX v2 Web Scan - Application Started
═══════════════════════════════════════════════════
📦 Version:    2.0.0
🔖 Commit ID:  a1b2c3d
🕐 Build Time: 2025-10-19T09:00:00Z
🌍 Environment: production
═══════════════════════════════════════════════════
```

### 3. Docker Build Logs

During Docker build:

```
════════════════════════════════════════════
Building ONIX v2 Web Scan
════════════════════════════════════════════
Version:    2.0.0
Commit ID:  a1b2c3d
Build Time: 2025-10-19T09:00:00Z
════════════════════════════════════════════
```

---

## 🏗️ Building with Version Tracking

### Option 1: Using Build Script (Recommended)

```bash
# Build with automatic version tracking
./docker-build.sh latest

# Build with specific tag
./docker-build.sh v2.0.0

# Build with version tag
./docker-build.sh 1.0.0-beta
```

**The script automatically:**
- ✅ Gets current Git commit ID
- ✅ Gets current Git branch
- ✅ Gets build timestamp
- ✅ Gets version from package.json
- ✅ Creates two tags: `latest` and `{commit-id}`
- ✅ Shows helpful post-build instructions

### Option 2: Manual Docker Build

```bash
# Get Git commit ID
GIT_COMMIT=$(git rev-parse --short HEAD)

# Get build timestamp
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build with version info
docker build \
  --build-arg GIT_COMMIT="${GIT_COMMIT}" \
  --build-arg BUILD_TIMESTAMP="${BUILD_TIMESTAMP}" \
  --build-arg APP_VERSION="2.0.0" \
  -t onix-v2-web-scan:latest \
  .
```

### Option 3: CI/CD Pipeline

**GitHub Actions Example:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Get version info
        id: version
        run: |
          echo "commit=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
          echo "timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> $GITHUB_OUTPUT
          echo "version=$(grep '"version"' nextjs/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')" >> $GITHUB_OUTPUT

      - name: Build Docker image
        run: |
          docker build \
            --build-arg GIT_COMMIT=${{ steps.version.outputs.commit }} \
            --build-arg BUILD_TIMESTAMP=${{ steps.version.outputs.timestamp }} \
            --build-arg APP_VERSION=${{ steps.version.outputs.version }} \
            -t your-registry/onix-v2-web-scan:${{ steps.version.outputs.commit }} \
            -t your-registry/onix-v2-web-scan:latest \
            .

      - name: Push to registry
        run: |
          docker push your-registry/onix-v2-web-scan:${{ steps.version.outputs.commit }}
          docker push your-registry/onix-v2-web-scan:latest
```

**GitLab CI Example:**

```yaml
build:
  stage: build
  script:
    - export GIT_COMMIT=$(git rev-parse --short HEAD)
    - export BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    - export APP_VERSION=$(grep '"version"' nextjs/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
    - docker build 
        --build-arg GIT_COMMIT=$GIT_COMMIT
        --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP
        --build-arg APP_VERSION=$APP_VERSION
        -t $CI_REGISTRY_IMAGE:$GIT_COMMIT
        -t $CI_REGISTRY_IMAGE:latest
        .
    - docker push $CI_REGISTRY_IMAGE:$GIT_COMMIT
    - docker push $CI_REGISTRY_IMAGE:latest
```

---

## 📦 Kubernetes Deployment with Version Tracking

### Deployment YAML with Image Tag

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: onix-v2-web-scan
  labels:
    app: onix-v2-web-scan
    version: "2.0.0"  # Update this with each deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: onix-v2-web-scan
  template:
    metadata:
      labels:
        app: onix-v2-web-scan
        version: "2.0.0"
        commit: "a1b2c3d"  # Update this with each deployment
    spec:
      containers:
      - name: onix-scan
        # Use commit ID as tag for precise version tracking
        image: your-registry/onix-v2-web-scan:a1b2c3d
        # Or use latest (less precise)
        # image: your-registry/onix-v2-web-scan:latest
        
        ports:
        - containerPort: 5000
        
        env:
        - name: NODE_ENV
          value: "production"
        
        # Kubernetes adds these automatically
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
```

### Check Running Version in Kubernetes

```bash
# Get pod name
POD_NAME=$(kubectl get pods -l app=onix-v2-web-scan -o jsonpath='{.items[0].metadata.name}')

# Check version via health endpoint
kubectl exec -it $POD_NAME -- wget -qO- http://localhost:5000/health | jq .

# Or port-forward and check locally
kubectl port-forward $POD_NAME 5000:5000
curl http://localhost:5000/health | jq .
```

---

## 🔍 Monitoring & Troubleshooting

### Check Which Version is Running

```bash
# In Kubernetes
kubectl get pods -o=jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'

# Output:
# onix-v2-web-scan-xxx-yyy    your-registry/onix-v2-web-scan:a1b2c3d
# onix-v2-web-scan-xxx-zzz    your-registry/onix-v2-web-scan:a1b2c3d
```

### Match Error Logs to Code

When you see an error in logs:

1. **Check commit ID** from health endpoint or startup logs
2. **Checkout that commit** locally:
   ```bash
   git checkout a1b2c3d
   ```
3. **Debug the exact code** that's running in production

### Rollback to Previous Version

If you need to rollback:

```bash
# Find previous deployment
kubectl rollout history deployment/onix-v2-web-scan

# Rollback to previous version
kubectl rollout undo deployment/onix-v2-web-scan

# Or rollback to specific revision
kubectl rollout undo deployment/onix-v2-web-scan --to-revision=2
```

---

## 📊 Version History Tracking

### Tag Images with Multiple Identifiers

```bash
# Build and tag with multiple identifiers
docker build \
  --build-arg GIT_COMMIT=a1b2c3d \
  -t onix-v2-web-scan:latest \
  -t onix-v2-web-scan:2.0.0 \
  -t onix-v2-web-scan:a1b2c3d \
  -t onix-v2-web-scan:2.0.0-a1b2c3d \
  .

# Push all tags
docker push onix-v2-web-scan:latest
docker push onix-v2-web-scan:2.0.0
docker push onix-v2-web-scan:a1b2c3d
docker push onix-v2-web-scan:2.0.0-a1b2c3d
```

### Keep Deployment History

Create a deployment log file:

```bash
# deployment-history.md
## 2025-10-19 10:00:00 - Production Deployment
- **Version**: 2.0.0
- **Commit**: a1b2c3d
- **Branch**: main
- **Deployed by**: DevOps Team
- **Changes**: Added Redis password support, fixed JSON property names
- **Image**: your-registry/onix-v2-web-scan:a1b2c3d
```

---

## 🛠️ Development vs Production

### Development (npm run dev)

Commit ID will be `unknown` unless you set it manually:

```bash
# Set manually for testing
export NEXT_PUBLIC_GIT_COMMIT=$(git rev-parse --short HEAD)
npm run dev
```

### Production (Docker)

Commit ID is automatically injected during build:

```bash
./docker-build.sh latest
```

---

## ✅ Best Practices

1. **Always use commit ID tags** for production deployments
   - ✅ Good: `onix-v2-web-scan:a1b2c3d`
   - ⚠️ Okay: `onix-v2-web-scan:latest`

2. **Check version after deployment**
   ```bash
   curl https://your-domain.com/health | jq '.commit'
   ```

3. **Keep deployment logs** with commit IDs and timestamps

4. **Use CI/CD** to automatically inject version info

5. **Monitor health endpoint** for version tracking

6. **Tag releases** in Git:
   ```bash
   git tag -a v2.0.0 -m "Release 2.0.0"
   git push origin v2.0.0
   ```

---

## 🎯 Quick Reference

```bash
# Build with version tracking
./docker-build.sh latest

# Check version locally
curl http://localhost:5000/health | jq

# Check version in Kubernetes
kubectl exec -it <pod-name> -- wget -qO- http://localhost:5000/health | jq

# Find which commit is running
kubectl exec -it <pod-name> -- wget -qO- http://localhost:5000/health | jq -r '.commit'

# Checkout that commit locally for debugging
git checkout $(kubectl exec -it <pod-name> -- wget -qO- http://localhost:5000/health | jq -r '.commit')
```

---

## 📝 Summary

With version tracking enabled:
- ✅ Every deployment has a **unique commit ID**
- ✅ You can **match errors to code** exactly
- ✅ You can **rollback** with confidence
- ✅ You have an **audit trail** of deployments
- ✅ Debugging is **faster and more accurate**

**Start using it:**
```bash
./docker-build.sh latest
docker run -p 5000:5000 onix-v2-web-scan:latest
curl http://localhost:5000/health
```
