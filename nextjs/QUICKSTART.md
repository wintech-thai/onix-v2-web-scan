# Next.js Implementation - Quick Start

This folder contains the **Next.js 15** implementation of the Onix v2 Web Scan verification system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your encryption keys
nano .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000

## 📁 Folder Structure

```
nextjs/
├── app/                    # Next.js App Router
│   ├── api/health/        # Health check endpoint
│   ├── verify/            # Verification page (SSR)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── themes/
│       └── default/       # Default theme
│           └── VerifyView.tsx
├── lib/                   # Utilities
│   ├── types.ts           # TypeScript interfaces
│   ├── encryption.ts      # AES-256-CBC encryption
│   └── redis.ts           # Redis client (ioredis)
├── middleware.ts          # Audit logging
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind CSS config
├── package.json           # Dependencies
└── .env.example           # Environment template
```

## 🔑 Required Environment Variables

```env
# Encryption (REQUIRED)
ENCRYPTION_KEY=your-32-byte-hex-string-here
ENCRYPTION_IV=your-16-byte-hex-string-here

# Redis (Optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Product API (Optional)
PRODUCT_API_URL=https://api.example.com
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report (target: 80%+) |

## 📚 Documentation

Documentation is in the parent directory:

- **API Docs**: `../docs/api/`
  - Health: `../docs/api/health.md`
  - Verify: `../docs/api/verify.md`

- **Guides**: `../docs/guides/`
  - Getting Started: `../docs/guides/getting-started.md`

- **Full README**: `./README.md` (this folder)

## 🔐 Generating Encryption Keys

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

Run: `node generate-keys.js`

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Coverage Target**: 80%+ for all utilities and components

## 🎨 Adding a New Theme

1. Create directory: `components/themes/[theme-name]/`
2. Add `VerifyView.tsx` component
3. Update theme whitelist in `app/verify/page.tsx`
4. Test with: `http://localhost:3000/verify?data=...&theme=[theme-name]`

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Redis Connection Error

The app works without Redis (uses environment variables as fallback). To use Redis:

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo systemctl start redis-server

# Verify
redis-cli ping  # Should return PONG
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t onix-web-scan .

# Run container
docker run -p 3000:3000 onix-web-scan
```

### Manual Build

```bash
npm run build
npm start
```

## 📝 Notes

- This is a Server Components-first application
- Decryption happens server-side only (security)
- Theme components are Client Components for interactivity
- Middleware handles audit logging for all requests
- Health endpoint excluded from audit logging

## 🔗 Related Files

- **Root README**: `../README.md` - Project overview for both C# and Next.js
- **C# Implementation**: `../` - Original ASP.NET Core implementation
- **AI Instructions**: `../.github/copilot-instructions.md` - Development guidelines

---

**Need Help?** See the full documentation in `../docs/` or check `README.md` in this folder.
