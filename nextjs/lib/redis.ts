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
    // Create new Redis client
    redisClient = new Redis({
      host: redisHost,
      port: parseInt(redisPort, 10),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: false,
    });

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
};
