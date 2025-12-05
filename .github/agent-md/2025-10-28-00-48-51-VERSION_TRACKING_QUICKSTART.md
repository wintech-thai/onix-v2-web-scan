# Version Tracking - Quick Start

## ✅ What Was Added

1. **Git Commit ID Logging** - Know exactly which code is deployed
2. **Build Timestamp** - Know when it was built  
3. **Version Info in Health Endpoint** - Easy monitoring
4. **Automated Build Script** - One command to build with version tracking

---

## 🚀 Usage

### Build Docker Image with Version Tracking

```bash
# One command - automatically captures Git commit ID, timestamp, and version
./docker-build.sh latest
```

**Output:**
```
════════════════════════════════════════════
🐳 Building Docker Image
════════════════════════════════════════════
📦 Image:      onix-v2-web-scan:latest
📦 Version:    2.0.0
🔖 Commit:     a1b2c3d (develop)
🕐 Build Time: 2025-10-19T09:00:00Z
════════════════════════════════════════════
```

### Check Version of Running Container

```bash
# Health endpoint shows commit ID
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-19T10:15:30.123Z",
  "service": "onix-v2-web-scan",
  "version": "2.0.0",
  "commit": "a1b2c3d",          ← Git commit ID
  "buildTime": "2025-10-19T09:00:00Z",  ← When it was built
  "environment": "production",
  "redis": "connected",
  "uptime": 3600.5
}
```

### Check Logs on Startup

Application logs show version info:

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

---

## 🐛 Why This Helps

### Scenario 1: Production Error

```bash
# Error in production - which code is running?
curl https://your-domain.com/health | jq -r '.commit'
# Output: a1b2c3d

# Checkout that exact commit locally to debug
git checkout a1b2c3d
```

### Scenario 2: Rollback Decision

```bash
# Current version has bugs
# Check commit ID: a1b2c3d

# Previous working version
# Commit ID: x9y8z7w

# Deploy previous version
kubectl set image deployment/onix-v2-web-scan onix-scan=your-registry/onix-v2-web-scan:x9y8z7w
```

### Scenario 3: Deployment Audit

```bash
# Which version is running in each environment?

# Development
curl https://dev.your-domain.com/health | jq -r '.commit'
# a1b2c3d

# Staging
curl https://staging.your-domain.com/health | jq -r '.commit'
# x9y8z7w

# Production
curl https://prod.your-domain.com/health | jq -r '.commit'
# b3c4d5e
```

---

## 📦 For CI/CD

### GitHub Actions

```yaml
- name: Build with version tracking
  run: |
    GIT_COMMIT=$(git rev-parse --short HEAD)
    BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    docker build \
      --build-arg GIT_COMMIT=$GIT_COMMIT \
      --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP \
      -t your-registry/onix-v2-web-scan:$GIT_COMMIT \
      -t your-registry/onix-v2-web-scan:latest \
      .
```

### GitLab CI

```yaml
build:
  script:
    - export GIT_COMMIT=$(git rev-parse --short HEAD)
    - export BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    - docker build --build-arg GIT_COMMIT=$GIT_COMMIT --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP -t $CI_REGISTRY_IMAGE:$GIT_COMMIT .
```

---

## 🎯 Files Added/Modified

1. **`lib/version.ts`** - Version utility functions
2. **`app/health/route.ts`** - Updated health endpoint with version info
3. **`middleware.ts`** - Logs version on startup
4. **`Dockerfile`** - Accepts build args for version tracking
5. **`docker-build.sh`** - Automated build script
6. **`VERSION_TRACKING.md`** - Complete documentation

---

## ✅ Quick Test

```bash
# 1. Build
./docker-build.sh latest

# 2. Run
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e ENCRYPTION_KEY='wCCLYnTAlfFk2ccB' \
  -e ENCRYPTION_IV='2908yrhozH0ppXmA' \
  --name onix-scan \
  onix-v2-web-scan:latest

# 3. Check version
curl http://localhost:5000/health | jq

# 4. Check logs
docker logs onix-scan | head -20

# You should see commit ID in both!
```

---

## 📚 More Info

See **`VERSION_TRACKING.md`** for complete documentation including:
- CI/CD integration examples
- Kubernetes deployment with version tracking
- Troubleshooting and monitoring
- Best practices
