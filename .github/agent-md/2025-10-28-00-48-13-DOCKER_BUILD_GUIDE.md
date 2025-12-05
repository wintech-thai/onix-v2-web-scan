# Docker Build and Deployment Guide

**Project**: ONIX v2 Web Scan  
**Date**: 2024-10-18  
**Status**: ✅ **Production-Ready**

---

## Quick Start

### Build Docker Image

```bash
# From project root directory
docker build -t onix-v2-web-scan:latest .

# With specific tag
docker build -t your-registry/onix-v2-web-scan:1.0.0 .
```

### Run Locally (Development Mode)

```bash
# Run with environment variables
docker run -d \
  --name onix-scan \
  -p 5000:5000 \
  -e ENCRYPTION_KEY="wCCLYnTAlfFk2ccB" \
  -e ENCRYPTION_IV="2908yrhozH0ppXmA" \
  -e NODE_ENV=development \
  onix-v2-web-scan:latest

# Check logs
docker logs -f onix-scan

# Test health endpoint
curl http://localhost:5000/health

# Test verification endpoint
curl "http://localhost:5000/verify?org=napbiotec&theme=default&data=..."
```

### Run with Redis (Production Mode)

```bash
# Start Redis first
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest

# Populate Redis with test data
docker exec -it redis redis-cli SET \
  "CacheLoader:Development:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"wCCLYnTAlfFk2ccB","Encryption_Iv":"2908yrhozH0ppXmA"}'

# Run application with Redis
docker run -d \
  --name onix-scan \
  --link redis:redis \
  -p 5000:5000 \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e ENCRYPTION_KEY="fallback-key-16" \
  -e ENCRYPTION_IV="fallback-iv-16ch" \
  -e NODE_ENV=development \
  onix-v2-web-scan:latest

# Check logs - should see Redis connection
docker logs -f onix-scan
# Expected: "✅ Redis connected successfully"
# Expected: "Fetching encryption config from Redis: CacheLoader:Development:ScanItemActions:napbiotec"
```

---

## Dockerfile Overview

### Multi-Stage Build (3 Stages)

```dockerfile
# Stage 1: Dependencies
FROM node:22.17.1-alpine3.22 AS deps
# Installs npm packages (node_modules)

# Stage 2: Builder
FROM node:22.17.1-alpine3.22 AS builder
# Builds Next.js application (.next folder)

# Stage 3: Runner
FROM node:22.17.1-alpine3.22 AS runner
# Production runtime (minimal)
```

**Benefits**:
- Small final image size (~200-300MB)
- Only production dependencies included
- Faster deployment and scaling

---

## Environment Variables

### Build-Time Variables (Set in Dockerfile)

```dockerfile
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME=0.0.0.0
```

### Runtime Variables (Inject at Runtime)

**Required for Production**:
```bash
REDIS_HOST=redis-service.namespace.svc.cluster.local
REDIS_PORT=6379
ENCRYPTION_KEY=fallback-key-16-24-or-32-chars
ENCRYPTION_IV=fallback-iv-16-chars
```

**Optional**:
```bash
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true                    # For TLS/SSL Redis connections
NEXT_PUBLIC_LOG_ENDPOINT=https://logs.example.com/api/audit
```

---

## Docker Compose Example

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  onix-scan:
    build: .
    container_name: onix-scan
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - ENCRYPTION_KEY=wCCLYnTAlfFk2ccB
      - ENCRYPTION_IV=2908yrhozH0ppXmA
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://127.0.0.1:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  redis-data:
```

**Run with Docker Compose**:

```bash
# Start all services
docker-compose up -d

# Populate Redis
docker-compose exec redis redis-cli SET \
  "CacheLoader:Production:ScanItemActions:napbiotec" \
  '{"Encryption_Key":"wCCLYnTAlfFk2ccB","Encryption_Iv":"2908yrhozH0ppXmA"}'

# View logs
docker-compose logs -f onix-scan

# Test
curl http://localhost:5000/health
curl "http://localhost:5000/verify?org=napbiotec&theme=default&data=..."

# Stop all services
docker-compose down
```

---

## Building for Production

### 1. Build with Version Tag

```bash
# Build with version tag
docker build -t your-registry/onix-v2-web-scan:1.0.0 .

# Also tag as latest
docker tag your-registry/onix-v2-web-scan:1.0.0 \
           your-registry/onix-v2-web-scan:latest
```

### 2. Push to Registry

```bash
# Docker Hub
docker login
docker push your-registry/onix-v2-web-scan:1.0.0
docker push your-registry/onix-v2-web-scan:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/onix-v2-web-scan:1.0.0

# Google Container Registry
gcloud auth configure-docker
docker push gcr.io/your-project/onix-v2-web-scan:1.0.0
```

### 3. Verify Image

```bash
# Check image size
docker images | grep onix-v2-web-scan

# Inspect image
docker inspect onix-v2-web-scan:latest

# Run and test
docker run -d \
  --name test-scan \
  -p 5000:5000 \
  -e ENCRYPTION_KEY="test-key-16chars" \
  -e ENCRYPTION_IV="test-iv-16chars" \
  your-registry/onix-v2-web-scan:1.0.0

# Test health
curl http://localhost:5000/health

# Cleanup
docker stop test-scan
docker rm test-scan
```

---

## Optimizations

### Build Arguments

Add build arguments for customization:

```dockerfile
# Add to Dockerfile
ARG NODE_VERSION=22.17.1
ARG ALPINE_VERSION=3.22

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS deps
```

**Build with custom arguments**:
```bash
docker build \
  --build-arg NODE_VERSION=22.17.1 \
  --build-arg ALPINE_VERSION=3.22 \
  -t onix-v2-web-scan:latest .
```

### Multi-Platform Build

Build for multiple architectures:

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/onix-v2-web-scan:latest \
  --push .
```

### Build Cache

Use BuildKit cache mounts for faster builds:

```dockerfile
# Add to deps stage
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**Build with BuildKit**:
```bash
DOCKER_BUILDKIT=1 docker build -t onix-v2-web-scan:latest .
```

---

## Health Checks

### Docker Health Check

Built-in health check in Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"
```

**Check health status**:
```bash
docker ps
# CONTAINER ID   IMAGE      STATUS
# abc123         onix...    Up 2 minutes (healthy)

docker inspect --format='{{.State.Health.Status}}' onix-scan
# healthy
```

### Manual Health Check

```bash
# From inside container
docker exec onix-scan wget -qO- http://127.0.0.1:5000/health

# From host
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-10-18T...",
#   "service": "onix-v2-web-scan",
#   "version": "2.0.0"
# }
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs onix-scan

# Common issues:
# 1. Port already in use
docker ps | grep 5000
lsof -ti:5000 | xargs kill -9

# 2. Missing environment variables
docker exec onix-scan env | grep ENCRYPTION
```

### Build Fails

```bash
# Clean build (no cache)
docker build --no-cache -t onix-v2-web-scan:latest .

# Check disk space
docker system df

# Prune unused data
docker system prune -a
```

### Redis Connection Issues

```bash
# Check Redis is running
docker ps | grep redis

# Test Redis connection from app container
docker exec onix-scan nc -zv redis 6379

# Check environment variables
docker exec onix-scan env | grep REDIS

# View Redis logs
docker logs redis
```

### Application Errors

```bash
# Access container shell
docker exec -it onix-scan sh

# Check files
ls -la /app
ls -la /app/.next
ls -la /app/public

# Check Node.js version
node --version

# Test health endpoint from inside
wget -qO- http://127.0.0.1:5000/health
```

---

## Security Best Practices

### 1. Non-Root User

Dockerfile already uses non-root user:
```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### 2. Scan for Vulnerabilities

```bash
# Scan image with Docker Scout
docker scout cves onix-v2-web-scan:latest

# Scan with Trivy
trivy image onix-v2-web-scan:latest

# Scan with Snyk
snyk container test onix-v2-web-scan:latest
```

### 3. Use Secrets

**Don't pass secrets as environment variables in production!**

Use:
- Docker secrets (Swarm)
- Kubernetes secrets
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

### 4. Read-Only File System

```bash
# Run with read-only filesystem
docker run -d \
  --name onix-scan \
  --read-only \
  --tmpfs /tmp \
  -p 5000:5000 \
  onix-v2-web-scan:latest
```

---

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Create secrets
echo "redis-password" | docker secret create redis_password -
echo "encryption-key-16" | docker secret create encryption_key -
echo "encryption-iv-16c" | docker secret create encryption_iv -

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml onix
```

### Kubernetes

See **KUBERNETES_ENV_INJECTION.md** for complete guide.

Quick example:
```bash
# Build and push
docker build -t your-registry/onix-v2-web-scan:1.0.0 .
docker push your-registry/onix-v2-web-scan:1.0.0

# Deploy to Kubernetes
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods
kubectl logs -f deployment/onix-v2-web-scan
```

---

## Performance Monitoring

### Resource Usage

```bash
# Monitor container stats
docker stats onix-scan

# Check container info
docker inspect onix-scan | jq '.[0].State'
```

### Logs

```bash
# Follow logs
docker logs -f onix-scan

# Last 100 lines
docker logs --tail 100 onix-scan

# Logs since 1 hour ago
docker logs --since 1h onix-scan
```

---

## Summary

✅ **Dockerfile is production-ready**:
- Multi-stage build for optimal size
- Non-root user for security
- Health check configured
- Environment variables documented

✅ **Build and test locally**:
```bash
docker build -t onix-v2-web-scan:latest .
docker run -d -p 5000:5000 \
  -e ENCRYPTION_KEY="test-key-16chars" \
  -e ENCRYPTION_IV="test-iv-16chars" \
  onix-v2-web-scan:latest
```

✅ **Ready for Kubernetes deployment** with environment variable injection

---

**Created By**: GitHub Copilot AI Assistant  
**Date**: 2024-10-18  
**Status**: ✅ **Production-Ready**
