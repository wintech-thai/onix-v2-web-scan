/**
 * Redis helper utilities for Onix v2 Web Scan
 * Implements Redis connection and caching functionality
 * Ported from Utils/RedisHelper.cs
 */

import Redis, { Redis as RedisClient } from 'ioredis';
import { RedisConnectionError } from './types';

// Singleton Redis client instance
let redisClient: RedisClient | null = null;

/**
 * Gets or creates a Redis client instance (singleton pattern)
 * @returns Redis client or null if connection fails
 */
export function getRedisClient(): RedisClient | null {
  // Return existing client if already connected
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  // Check if Redis configuration is provided
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;

  if (!redisHost || !redisPort) {
    console.log('Redis configuration not found. Running in local mode without Redis.');
    return null;
  }

  try {
    // Get Redis password and TLS settings (for production)
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisTls = process.env.REDIS_TLS === 'true';

    // Create new Redis client
    const redisOptions: any = {
      host: redisHost,
      port: parseInt(redisPort, 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: false,
    };

    // Add password if provided (production Redis)
    if (redisPassword) {
      redisOptions.password = redisPassword;
      console.log('Redis password authentication enabled');
    }

    // Enable TLS if configured (production Redis)
    if (redisTls) {
      redisOptions.tls = {
        rejectUnauthorized: false, // For self-signed certificates in private cloud
      };
      console.log('Redis TLS/SSL enabled');
    }

    redisClient = new Redis(redisOptions);

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

/**
 * Sets a string value in Redis
 * @param key - Cache key
 * @param value - String value to store
 * @param expirySeconds - Optional expiry time in seconds
 * @returns True if successful, false otherwise
 */
export async function setAsync(
  key: string,
  value: string,
  expirySeconds?: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    console.warn('Redis not available. Skipping cache set.');
    return false;
  }

  try {
    if (expirySeconds) {
      await client.setex(key, expirySeconds, value);
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    console.error('Redis setAsync error:', error);
    return false;
  }
}

/**
 * Gets a string value from Redis
 * @param key - Cache key
 * @returns String value or null if not found
 */
export async function getAsync(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    return value;
  } catch (error) {
    console.error('Redis getAsync error:', error);
    return null;
  }
}

/**
 * Sets an object in Redis (serializes to JSON)
 * @param key - Cache key
 * @param obj - Object to store
 * @param expirySeconds - Optional expiry time in seconds
 * @returns True if successful, false otherwise
 */
export async function setObjectAsync<T>(
  key: string,
  obj: T,
  expirySeconds?: number
): Promise<boolean> {
  try {
    const json = JSON.stringify(obj);
    return await setAsync(key, json, expirySeconds);
  } catch (error) {
    console.error('Redis setObjectAsync error:', error);
    return false;
  }
}

/**
 * Gets an object from Redis (deserializes from JSON)
 * @param key - Cache key
 * @returns Deserialized object or null if not found
 */
export async function getObjectAsync<T>(key: string): Promise<T | null> {
  try {
    const value = await getAsync(key);
    if (!value) {
      return null;
    }

    // Parse JSON with case-insensitive property matching
    const obj = JSON.parse(value) as T;
    return obj;
  } catch (error) {
    console.error('Redis getObjectAsync error:', error);
    return null;
  }
}

/**
 * Publishes a message to a Redis stream
 * @param stream - Stream name
 * @param message - Message to publish
 * @returns Message ID or null if failed
 */
export async function publishMessageAsync(
  stream: string,
  message: string
): Promise<string | null> {
  const client = getRedisClient();
  if (!client) {
    console.warn('Redis not available. Skipping message publish.');
    return null;
  }

  try {
    // Add message to stream with auto-generated ID
    const messageId = await client.xadd(stream, '*', 'message', message);
    return messageId;
  } catch (error) {
    console.error('Redis publishMessageAsync error:', error);
    return null;
  }
}

/**
 * Deletes a key from Redis
 * @param key - Cache key to delete
 * @returns True if deleted, false otherwise
 */
export async function deleteAsync(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    console.error('Redis deleteAsync error:', error);
    return false;
  }
}

/**
 * Closes the Redis connection
 * Should be called on application shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed gracefully');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    } finally {
      redisClient = null;
    }
  }
}

/**
 * Checks if Redis is connected and available
 * @returns True if connected, false otherwise
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && redisClient.status === 'ready';
}

/**
 * Interface matching C# EncryptionConfig model
 * From obsoleted/Models/EncryptionConfig.cs
 */
export interface EncryptionConfig {
  Encryption_Key: string;
  Encryption_Iv: string;
}

/**
 * Get encryption configuration for organization
 * Matches C# GetEncryptionConfig method (VerifyController.cs lines 57-82)
 * 
 * Priority (same as C#):
 * 1. Redis cache (production) - CacheLoader:{env}:ScanItemActions:{org}
 * 2. Environment variables (development fallback)
 * 3. Fake keys (testing only - not implemented in Next.js)
 * 
 * @param org - Organization identifier (e.g., 'napbiotec')
 * @returns Encryption configuration or null if not found
 */
export async function getEncryptionConfig(org: string): Promise<EncryptionConfig | null> {
  const redis = getRedisClient();

  // Case 1: No Redis configured - use environment variable fallback (development)
  // Matches C# VerifyController.cs lines 59-66: if (_redis == null)
  if (redis === null) {
    console.log('Redis not configured, using environment variable fallback');
    const key = process.env.ENCRYPTION_KEY;
    const iv = process.env.ENCRYPTION_IV;

    if (!key || !iv) {
      console.error('ENCRYPTION_KEY or ENCRYPTION_IV not set in environment');
      return null;
    }

    return {
      Encryption_Key: key,
      Encryption_Iv: iv,
    };
  }

  // Case 2: Redis configured - fetch from cache (production)
  // Matches C# VerifyController.cs lines 68-80
  try {
    // Normalize environment name to match C# convention
    // C# uses: ASPNETCORE_ENVIRONMENT (Development, Production, Staging)
    // We use: RUNTIME_ENV (Kubernetes deployment) - explicit environment name
    // Priority: RUNTIME_ENV (Kubernetes) > NODE_ENV (Next.js default) > 'development' (fallback)
    const runtimeEnv = process.env.RUNTIME_ENV || 'development';
    console.log(`@@@@ P'James debug runtimeEnv: [${runtimeEnv}] [RUNTIME_ENV: ${process.env.RUNTIME_ENV}]`);
    

    const env = runtimeEnv === 'production' ? 'Production' : 
                runtimeEnv === 'test' ? 'Test' : 
                'Development';

    // Build cache key matching C# pattern: CacheLoader:{env}:ScanItemActions:{org}
    const cacheKey = `CacheLoader:${env}:ScanItemActions:${org}`;
    console.log(`Fetching encryption config from Redis: ${cacheKey}`);

    const configJson = await getAsync(cacheKey);

    if (!configJson) {
      console.warn(`Encryption config not found in Redis for key: ${cacheKey}`);
      
      // Fallback to environment variables if Redis key not found
      const key = process.env.ENCRYPTION_KEY;
      const iv = process.env.ENCRYPTION_IV;

      if (!key || !iv) {
        console.error('Fallback failed: ENCRYPTION_KEY or ENCRYPTION_IV not set');
        return null;
      }

      console.log('Using environment variable fallback');
      return {
        Encryption_Key: key,
        Encryption_Iv: iv,
      };
    }

    // Parse Redis response
    const rawConfig: any = JSON.parse(configJson);
    console.log('✓ Successfully fetched encryption config from Redis');
    console.log('Raw config from Redis:', rawConfig);
    
    // Support both naming conventions:
    // 1. PascalCase: Encryption_Key, Encryption_Iv (C# convention)
    // 2. lowercase: encryption_key, encryption_iv (common convention)
    const config: EncryptionConfig = {
      Encryption_Key: rawConfig.Encryption_Key || rawConfig.encryption_key || '',
      Encryption_Iv: rawConfig.Encryption_Iv || rawConfig.encryption_iv || '',
    };

    // Validate we got the keys
    if (!config.Encryption_Key || !config.Encryption_Iv) {
      console.error('Invalid encryption config from Redis. Missing key or IV.');
      console.error('Expected: Encryption_Key/encryption_key and Encryption_Iv/encryption_iv');
      console.error('Got:', rawConfig);
      
      // Fallback to environment variables
      const key = process.env.ENCRYPTION_KEY;
      const iv = process.env.ENCRYPTION_IV;

      if (!key || !iv) {
        console.error('Fallback failed: ENCRYPTION_KEY or ENCRYPTION_IV not set');
        return null;
      }

      console.log('Using environment variable fallback');
      return {
        Encryption_Key: key,
        Encryption_Iv: iv,
      };
    }
    
    return config;

  } catch (error) {
    console.error('Error fetching encryption config from Redis:', error);
    
    // Fallback to environment variables on error
    console.log('Redis error, falling back to environment variables');
    const key = process.env.ENCRYPTION_KEY;
    const iv = process.env.ENCRYPTION_IV;

    if (!key || !iv) {
      console.error('Fallback failed: ENCRYPTION_KEY or ENCRYPTION_IV not set');
      return null;
    }

    return {
      Encryption_Key: key,
      Encryption_Iv: iv,
    };
  }
}

// Default export for convenience
export default {
  getRedisClient,
  setAsync,
  getAsync,
  setObjectAsync,
  getObjectAsync,
  publishMessageAsync,
  deleteAsync,
  closeRedisConnection,
  isRedisAvailable,
  getEncryptionConfig,
};
