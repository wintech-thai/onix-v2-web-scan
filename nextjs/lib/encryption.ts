/**
 * Encryption utilities for Onix v2 Web Scan
 * Implements AES-256-CBC encryption/decryption
 * Ported from Utils/EncryptionUtils.cs
 */

import crypto from 'crypto';
import { DecryptionError } from './types';

/**
 * Encrypts plaintext using AES-256-CBC
 * @param plainText - The text to encrypt
 * @param key - 32-character encryption key
 * @param iv - 16-character initialization vector
 * @returns Base64-encoded encrypted string
 */
export function encrypt(plainText: string, key: string, iv: string): string {
  try {
    // Validate key and IV lengths
    if (key.length !== 32) {
      throw new Error('Encryption key must be 32 characters for AES-256');
    }
    if (iv.length !== 16) {
      throw new Error('Initialization vector must be 16 characters');
    }

    // Create cipher with AES-256-CBC
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
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
 * Decrypts base64-encoded ciphertext using AES-256-CBC
 * @param cipherTextBase64 - Base64-encoded encrypted string
 * @param key - 32-character encryption key
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

    if (key.length !== 32) {
      throw new Error('Encryption key must be 32 characters for AES-256');
    }

    if (iv.length !== 16) {
      throw new Error('Initialization vector must be 16 characters');
    }

    // Create decipher with AES-256-CBC
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
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
