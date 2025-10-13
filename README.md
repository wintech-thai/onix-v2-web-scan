# Onix v2 Web Scan

Comprehensive verification system for validating encrypted QR code and scan data with Time-To-Live (TTL) validation.

## Project Structure

This repository contains two implementations of the Onix v2 Web Scan system:

### 🔷 C# ASP.NET Core (Original)
**Location: Root directory**

The original implementation built with:
- ASP.NET Core 8.0 MVC
- C# 12
- StackExchange.Redis
- System.Security.Cryptography
- Razor views

**Key Files:**
- `Program.cs` - Application entry point
- `Controllers/` - MVC controllers (VerifyController, HomeController)
- `Models/` - Data models (EncryptionConfig, VerifyViewModel)
- `Views/` - Razor views with theme support
- `Utils/` - Utility classes (EncryptionUtils, RedisHelper)
- `Middlewares/` - Audit logging middleware

**Run C# Application:**
```bash
dotnet run
```

The application will start on the port configured in `appsettings.json`.

### 🟦 Next.js (Modernized Implementation)
**Location: `nextjs/` folder**

Modern implementation built with:
- Next.js 15.x
- React 19.x
- TypeScript 5.x
- ioredis
- Tailwind CSS 4.x

**Key Directories:**
- `nextjs/app/` - Next.js App Router (pages and API routes)
- `nextjs/components/` - React components with theme system
- `nextjs/lib/` - Utility libraries (encryption, Redis, types)
- `nextjs/middleware.ts` - Audit logging middleware

**Run Next.js Application:**
```bash
cd nextjs
npm install
npm run dev
```

Visit http://localhost:3000

## Features

### Core Functionality
- 🔐 **Data Verification**: Decrypt and validate encrypted scan data from QR codes
- ⏱️ **TTL Validation**: Time-based validation with expiration checking
- 💾 **Redis Integration**: Configuration caching and session management
- 🔒 **Encryption/Decryption**: AES-256-CBC encryption for secure data transmission
- 🎨 **Multi-Theme Support**: Dynamic theme selection for customizable UI
- 🔌 **Product API Integration**: External service calls for product information
- 📝 **Audit Logging**: Comprehensive request logging with custom status tracking
- 🏥 **Health Monitoring**: System health check endpoints
- ✅ **Status Visualization**: Visual badges (OK/WARN/ERR) for verification results

## Quick Start

### C# ASP.NET Core

```bash
# Restore dependencies
dotnet restore

# Run the application
dotnet run

# Or use the provided scripts
./run.sh
```

**Configuration:**
Edit `appsettings.json` or `appsettings.Development.json`:
```json
{
  "Redis": {
    "Host": "localhost",
    "Port": 6379
  },
  "Encryption": {
    "Key": "your-encryption-key",
    "IV": "your-encryption-iv"
  }
}
```

### Next.js

```bash
# Navigate to nextjs folder
cd nextjs

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local

# Start development server
npm run dev
```

**Environment Variables:**
```env
# Required
ENCRYPTION_KEY=your-32-byte-hex-string
ENCRYPTION_IV=your-16-byte-hex-string

# Optional (for Redis caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional (for product API)
PRODUCT_API_URL=https://api.example.com
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

### API Documentation (`docs/api/`)
- **Health Check Endpoint**: `docs/api/health.md`
  - System health status monitoring
  - Returns JSON with status and timestamp
  
- **Verification Endpoint**: `docs/api/verify.md`
  - QR code verification flow
  - Query parameters and payload structure
  - Status codes and error handling

### Guides (`docs/guides/`)
- **Getting Started**: `docs/guides/getting-started.md`
  - Installation instructions
  - Environment configuration
  - Generating encryption keys
  - Redis setup
  - Troubleshooting

### Next.js Specific
- **Next.js README**: `nextjs/README.md`
  - Detailed Next.js implementation guide
  - Component architecture
  - Development workflow

## Architecture

Both implementations follow a similar verification flow:

### Verification Process

1. **Parameter Validation**
   - Validate required `data` parameter
   - Check optional `theme` and `org` parameters

2. **Encryption Config Retrieval**
   - Attempt to fetch from Redis (org-specific)
   - Fallback to environment variables

3. **Data Decryption**
   - Decrypt base64-encoded data using AES-256-CBC
   - Handle decryption errors gracefully

4. **Payload Validation**
   - Parse JSON payload
   - Validate required fields (scanItem, ttl, createdDate)

5. **TTL Check**
   - Calculate expiration time
   - Verify data hasn't expired

6. **Product Data Retrieval** (optional)
   - Fetch product information if productId present
   - Handle API errors

7. **Theme Rendering**
   - Select appropriate theme
   - Render verification results with status badge

### Status System

Both implementations use consistent status codes:

| Status | Badge | Description |
|--------|-------|-------------|
| `VALID`, `SUCCESS`, `OK` | 🟢 OK | Data is valid and verified |
| `EXPIRED`, `ALREADY_REGISTERED` | 🟡 WARN | Warning conditions |
| `INVALID`, `FAILED`, `ERROR`, `NOTFOUND` | 🔴 ERR | Error conditions |

### Security Features

- **Server-side Decryption**: All decryption happens on the server
- **AES-256-CBC Encryption**: Industry-standard encryption algorithm
- **Environment Variables**: Secrets stored securely outside codebase
- **TTL Validation**: Prevents replay attacks with time-based expiration
- **Sanitized Errors**: No sensitive data in error messages
- **Audit Logging**: Comprehensive request/response tracking
- **Custom Headers**: Monitoring and debugging support

## Technology Stack Comparison

| Feature | C# Implementation | Next.js Implementation |
|---------|-------------------|------------------------|
| **Framework** | ASP.NET Core 8.0 | Next.js 15.x |
| **Language** | C# 12 | TypeScript 5.x |
| **View Engine** | Razor | React 19 |
| **Redis Client** | StackExchange.Redis | ioredis |
| **Encryption** | System.Security.Cryptography | Node.js crypto |
| **Logging** | Serilog | Console + External API |
| **Styling** | CSS + Bootstrap | Tailwind CSS 4.x |
| **Rendering** | Server-side MVC | Server Components + Client Components |

## Deployment

### C# Deployment

**Development:**
```bash
dotnet run
```

**Production:**
```bash
# Publish the application
dotnet publish -c Release -o ./publish

# Run the published application
cd publish
dotnet onix-v2-web-scan.dll
```

**Docker:**
```bash
# Build Docker image
docker build -t onix-v2-web-scan-csharp .

# Run container
docker run -p 5000:80 onix-v2-web-scan-csharp
```

### Next.js Deployment

**Development:**
```bash
cd nextjs
npm run dev
```

**Production:**
```bash
cd nextjs
npm run build
npm start
```

**Deployment Platforms:**
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (Dockerfile included in nextjs/)
- **Any Node.js hosting**

## Migration Information

The Next.js implementation is a complete transformation of the C# codebase:

### Feature Parity
✅ 100% feature parity with C# implementation  
✅ Same encryption algorithm (AES-256-CBC)  
✅ Compatible with existing encrypted data  
✅ Identical verification flow  
✅ Same status codes and theme system  

### File Mapping

| C# File | Next.js Equivalent |
|---------|-------------------|
| `Controllers/VerifyController.cs` | `nextjs/app/verify/page.tsx` |
| `Controllers/HomeController.cs` | `nextjs/app/page.tsx` |
| `Utils/EncryptionUtils.cs` | `nextjs/lib/encryption.ts` |
| `Utils/RedisHelper.cs` | `nextjs/lib/redis.ts` |
| `Middlewares/AuditLogMiddleware.cs` | `nextjs/middleware.ts` |
| `Models/EncryptionConfig.cs` | `nextjs/lib/types.ts` |
| `Models/VerifyViewModel.cs` | `nextjs/lib/types.ts` |
| `Views/Verify/Theme/default/` | `nextjs/components/themes/default/` |

### Migration Documentation

Detailed migration documentation is available in:
- `.github/tasks/task-2024-01-15-csharp-to-nextjs-transformation.md`
- `.github/memory/entities/project-structure.md`

## Development

### AI Agent Instructions

This project uses GitHub Copilot with custom instructions. See `.github/copilot-instructions.md` for:

- Sequential thinking requirements
- Task management in `.github/tasks/`
- Memory simulation in `.github/memory/`
- API documentation updates
- Context7 usage for external docs
- Unit testing standards (80%+ coverage)
- Development server management

### Testing

**Next.js Tests:**
```bash
cd nextjs
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

Target: 80%+ code coverage for all utilities and components

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting configured
- **Prettier**: Code formatting
- **Type Safety**: Full TypeScript coverage in Next.js

## Environment Variables

### C# (appsettings.json)

```json
{
  "Redis": {
    "Host": "localhost",
    "Port": 6379
  },
  "Encryption": {
    "Key": "your-encryption-key",
    "IV": "your-encryption-iv"
  },
  "ProductApi": {
    "Url": "https://api.example.com"
  }
}
```

### Next.js (.env.local)

```env
# Required
ENCRYPTION_KEY=your-32-byte-hex-string
ENCRYPTION_IV=your-16-byte-hex-string

# Optional
REDIS_HOST=localhost
REDIS_PORT=6379
PRODUCT_API_URL=https://api.example.com
AUDIT_LOG_ENDPOINT=https://log.example.com/api/logs
NODE_ENV=development
```

## Generating Encryption Keys

Both implementations require proper encryption keys:

**Using Node.js:**
```javascript
// generate-keys.js
import crypto from 'crypto';

// 32-byte (256-bit) key for AES-256
const key = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + key);

// 16-byte (128-bit) IV
const iv = crypto.randomBytes(16).toString('hex');
console.log('ENCRYPTION_IV=' + iv);
```

**Using C#:**
```csharp
using System.Security.Cryptography;
using System;

var key = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
Console.WriteLine($"ENCRYPTION_KEY={key}");

var iv = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
Console.WriteLine($"ENCRYPTION_IV={iv}");
```

## Support & Contribution

### Issues
For bugs and feature requests, please create an issue in the repository.

### Documentation
- Full documentation: `docs/` directory
- API specs: `docs/api/`
- Setup guides: `docs/guides/`

### Contact
Contact the Onix Development Team for support.

---

**Version**: 2.0.0  
**Last Updated**: October 13, 2025  
**License**: © 2024-2025 Onix Development Team. All rights reserved.
