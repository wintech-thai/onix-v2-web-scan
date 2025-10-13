# Onix v2 Web Scan - Next.js Transformation

## 🎯 Project Overview

Onix v2 Web Scan is a comprehensive verification system for validating encrypted QR code and scan data. This project has been transformed from C# ASP.NET Core MVC to **Next.js 15** with TypeScript.

### Key Features

- **Data Verification**: Decrypt and validate encrypted scan data from QR codes
- **TTL Validation**: Time-based validation with expiration checking
- **Redis Integration**: Configuration caching and session management
- **AES-256-CBC Encryption**: Secure data transmission
- **Multi-Theme Support**: Dynamic theme selection
- **Product API Integration**: External service calls
- **Audit Logging**: Comprehensive request logging
- **Health Monitoring**: System health check endpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x (LTS)
- Redis server (for production)
- npm/yarn/pnpm/bun

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# ENCRYPTION_KEY and ENCRYPTION_IV are required
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Redis Configuration (optional for local development)
REDIS_HOST=localhost
REDIS_PORT=6379

# Encryption Configuration (required)
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_IV=your-16-char-iv

# Node Environment
NODE_ENV=development
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/health/        # Health check endpoint
│   ├── verify/            # Verification page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── themes/           # Theme-based components
├── lib/                  # Utilities and helpers
│   ├── types.ts         # TypeScript types
│   ├── encryption.ts    # AES encryption
│   └── redis.ts         # Redis client
├── middleware.ts         # Audit logging
├── public/              # Static assets
└── tests/              # Test files
```

## 🔐 Security

- All encryption keys stored in environment variables
- Decryption happens server-side only
- Error messages sanitized
- Custom headers for monitoring
- Secure headers configured in `next.config.js`

## 📝 API Endpoints

### GET /verify

Verification page with query parameters:

- `data` (required): Encrypted verification data
- `theme` (optional): Theme name (default: "default")
- `org` (required): Organization identifier

### GET /api/health

Health check endpoint returning JSON status.

## 🎨 Theming

Themes are located in `/components/themes/[theme-name]/`. To add a new theme:

1. Create a new directory in `/components/themes/`
2. Add theme components
3. Update theme whitelist in verification logic

## 🧪 Testing

Tests are organized in `/tests` directory:

- `/tests/unit/` - Unit tests
- `/tests/integration/` - Integration tests
- `/tests/e2e/` - End-to-end tests

## 📚 Documentation

Documentation is available in the parent `../docs` directory:

- API documentation in `../docs/api/`
- Guides in `../docs/guides/`

**Note**: The `/docs` directory is gitignored as it's generated/maintained by AI agents.

## 🤖 AI Agent Instructions

This project uses GitHub Copilot with custom instructions defined in `.github/copilot-instructions.md`. Key practices:

1. **Sequential Thinking**: Use for complex problems
2. **Task Management**: Store tasks in `.github/tasks/`
3. **Memory Simulation**: Knowledge graphs in `.github/memory/`
4. **API Documentation**: Update `/docs` after changes
5. **Context7**: Use for external documentation
6. **Unit Testing**: Minimum 80% coverage

## 🔄 Migration from C# to Next.js

| C# Component | Next.js Equivalent |
|--------------|-------------------|
| VerifyController.cs | app/verify/page.tsx |
| EncryptionUtils.cs | lib/encryption.ts |
| RedisHelper.cs | lib/redis.ts |
| AuditLogMiddleware.cs | middleware.ts |
| Models/*.cs | lib/types.ts |

## 📦 Dependencies

### Core
- Next.js 15.x
- React 19.x
- TypeScript 5.x
- ioredis 5.x

### Dev Dependencies
- Tailwind CSS 4.x
- Jest & Testing Library
- ESLint & Prettier

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t onix-v2-web-scan .

# Run container
docker run -p 3000:3000 onix-v2-web-scan
```

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines if applicable]

## 📧 Support

[Add support contact information]

---

**Version**: 2.0.0  
**Framework**: Next.js 15  
**Node.js**: 22.x  
**Last Updated**: October 13, 2025
