/**
 * TypeScript type definitions for Onix v2 Web Scan
 * Ported from C# models in Models/ directory
 */

// ============================================================================
// Encryption Configuration
// ============================================================================

export interface EncryptionConfig {
  key: string;
  iv: string;
}

// ============================================================================
// Verification Models
// ============================================================================

export interface VerifyViewModel {
  status: string;
  message: string;
  scanData: ScanItem | null;
  productData: ProductApiResponse | null;
  productUrl?: string; // URL for lazy loading product data on client-side
  theme: string;
  language?: 'th' | 'en'; // Language preference (default: th)
  ttl?: number;
  createdDate?: string; // ISO date string
  expiryDate?: string; // ISO date string
}

export interface VerifyPayload {
  status?: string;
  descriptionThai?: string;
  descriptionEng?: string;
  scanItem?: ScanItem;
  redirectUrl?: string;
  getProductUrl?: string;
  dataGeneratedDate?: string; // ISO date string
  ttlMinute?: number; // Time to live in minutes
  productData?: ProductApiResponse; // Fetched from Product API
}

export interface ScanItem {
  id?: string;
  orgId?: string;
  serial?: string; // Serial number
  pin?: string; // PIN code for verification
  tags?: string;
  productCode?: string;
  sequenceNo?: string;
  url?: string;
  runId?: string;
  uploadedPath?: string;
  itemGroup?: string;
  registeredFlag?: string;
  usedFlag?: string;
  createdDate?: string; // ISO date string
  registeredDate?: string; // ISO date string
}

// ============================================================================
// Product API Models (Matching C# ProductData structure)
// ============================================================================

export interface ProductApiResponse {
  status?: string;
  description?: string;
  item?: ProductItem;
  images?: ProductImage[];
}

export interface ProductItem {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  narrative?: string; // Pipe-separated features
  orgId?: string;
  updatedDate?: string; // ISO date string
  propertiesObj?: ProductPropertiesObj;
}

export interface ProductPropertiesObj {
  category?: string;
  height?: number;
  width?: number;
  weight?: number;
  dimentionUnit?: string; // cm, m, etc.
  weightUnit?: string; // g, kg, etc.
  productUrl?: string; // More details link
  supplierUrl?: string; // Supplier website
}

export interface ProductImage {
  imageUrl: string;
  narative?: string; // Caption for carousel
  altText?: string;
}

// ============================================================================
// Status Types
// ============================================================================

export type VerificationStatus =
  | 'VALID'
  | 'INVALID'
  | 'EXPIRED'
  | 'ERROR'
  | 'OK'
  | 'SUCCESS'
  | 'ALREADY_REGISTERED'
  | 'NOTFOUND'
  | 'FAILED';

export type StatusBadgeClass = 'vx-badge ok' | 'vx-badge warn' | 'vx-badge err';

// ============================================================================
// Environment Variables (for reference only)
// ============================================================================

export interface EnvironmentVariables {
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  ENCRYPTION_KEY: string;
  ENCRYPTION_IV: string;
  NODE_ENV?: 'development' | 'production' | 'test';
}

// ============================================================================
// Custom Error Types
// ============================================================================

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

export class RedisConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedisConnectionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
