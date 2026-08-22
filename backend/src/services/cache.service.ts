import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 1 })
  : undefined;

redis?.on('error', (error) => logger.warn({ err: error }, 'Redis cache operation failed; continuing without cache'));

const key = (name: string): string => `electronics-commerce:${name}`;

export async function readCache<T>(name: string): Promise<T | undefined> {
  if (!redis || env.CACHE_TTL_SECONDS === 0) return undefined;
  try {
    const value = await redis.get(key(name));
    return value ? JSON.parse(value) as T : undefined;
  } catch {
    return undefined;
  }
}

export async function writeCache<T>(name: string, value: T, ttlSeconds = env.CACHE_TTL_SECONDS): Promise<void> {
  if (!redis || ttlSeconds === 0) return;
  try {
    await redis.set(key(name), JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Cache availability must never affect a commerce request.
  }
}

export async function invalidateCache(prefix: string): Promise<void> {
  if (!redis) return;
  try {
    let cursor = '0';
    const pattern = key(`${prefix}*`);
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) await redis.unlink(...keys);
    } while (cursor !== '0');
  } catch {
    // Cache invalidation is best effort; the short TTL bounds a Redis outage's impact.
  }
}

export async function closeCache(): Promise<void> {
  if (redis) await redis.quit();
}
