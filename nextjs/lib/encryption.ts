/**
 * Encryption utilities for Onix v2 Web Scan
 * Implements AES-256-CBC encryption/decryption
 * Ported from Utils/EncryptionUtils.cs
 */

import crypto from 'crypto';
import { DecryptionError } from './types';

/**
 * Encrypts plaintext using AES-CBC (automatically selects key size based on key length)
 * @param plainText - The text to encrypt
 * @param key - Encryption key (16/24/32 characters for AES-128/192/256)
 * @param iv - 16-character initialization vector
 * @returns Base64-encoded encrypted string
 */
export function encrypt(plainText: string, key: string, iv: string): string {
  try {
    // Validate key length (must be 16, 24, or 32 bytes for AES)
    if (![16, 24, 32].includes(key.length)) {
      throw new Error('Encryption key must be 16, 24, or 32 characters (AES-128/192/256)');
    }
    if (iv.length !== 16) {
      throw new Error('Initialization vector must be 16 characters');
    }

    // Determine algorithm based on key length (matching C# Aes.Create() behavior)
    const algorithm = key.length === 16 ? 'aes-128-cbc' : 
                     key.length === 24 ? 'aes-192-cbc' : 
                     'aes-256-cbc';

    // Create cipher with appropriate AES variant
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, 'utf8'),
      Buffer.from(iv, 'utf8')
    );

    // Encrypt the plaintext
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  } catch (error) {
    throw new DecryptionError(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypts base64-encoded ciphertext using AES-CBC (automatically selects key size based on key length)
 * @param cipherTextBase64 - Base64-encoded encrypted string
 * @param key - Encryption key (16/24/32 characters for AES-128/192/256)
 * @param iv - 16-character initialization vector
 * @returns Decrypted plaintext string
 * @throws DecryptionError if decryption fails
 */
export function decrypt(
  cipherTextBase64: string,
  key: string,
  iv: string
): string {
  try {
    // Validate inputs
    if (!cipherTextBase64 || cipherTextBase64.trim() === '') {
      throw new Error('Cipher text cannot be empty');
    }

    // Validate key length (must be 16, 24, or 32 bytes for AES)
    if (![16, 24, 32].includes(key.length)) {
      throw new Error('Encryption key must be 16, 24, or 32 characters (AES-128/192/256)');
    }

    if (iv.length !== 16) {
      throw new Error('Initialization vector must be 16 characters');
    }

    // Determine algorithm based on key length (matching C# Aes.Create() behavior)
    const algorithm = key.length === 16 ? 'aes-128-cbc' : 
                     key.length === 24 ? 'aes-192-cbc' : 
                     'aes-256-cbc';

    console.log(`Using ${algorithm} for decryption (key length: ${key.length} bytes)`);

    // Create decipher with appropriate AES variant
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, 'utf8'),
      Buffer.from(iv, 'utf8')
    );

    // Decrypt the ciphertext
    let decrypted = decipher.update(cipherTextBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Log error for debugging (but don't expose sensitive details)
    console.error('Decryption failed:', error instanceof Error ? error.message : 'Unknown error');
    
    throw new DecryptionError(
      `Decryption failed: ${error instanceof Error ? error.message : 'Invalid encrypted data'}`
    );
  }
}

/**
 * Validates if a string is valid base64
 * @param str - String to validate
 * @returns True if valid base64, false otherwise
 */
export function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Generates a random encryption key (32 characters for AES-256)
 * WARNING: Use only for testing/development. Store keys securely in production.
 * @returns Random 32-character key
 */
export function generateRandomKey(): string {
  return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex chars
}

/**
 * Generates a random initialization vector (16 characters)
 * WARNING: Use only for testing/development. Store IVs securely in production.
 * @returns Random 16-character IV
 */
export function generateRandomIV(): string {
  return crypto.randomBytes(8).toString('hex'); // 8 bytes = 16 hex chars
}

// Default export for convenience
export default {
  encrypt,
  decrypt,
  isValidBase64,
  generateRandomKey,
  generateRandomIV,
};
