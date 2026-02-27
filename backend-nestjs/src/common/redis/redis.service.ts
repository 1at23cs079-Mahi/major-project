import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Service with graceful fallback to in-memory cache when Redis is unavailable.
 * This allows the application to work in development without Redis.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isConnected = false;
  private readonly enabled: boolean;
  private readonly logger = new Logger(RedisService.name);
  
  // In-memory fallback cache
  private memoryCache = new Map<string, { value: string; expires?: number }>();

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<string>('REDIS_ENABLED', 'false') === 'true';
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('Redis is disabled. Using in-memory cache fallback.');
      return;
    }

    try {
      this.client = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 attempts. Using in-memory fallback.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          this.logger.error(`Redis connection lost: ${err.message}`);
          this.isConnected = false;
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected successfully');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.warn(`Redis connection failed: ${error instanceof Error ? error.message : "Unknown error"}. Using in-memory fallback.`);
      this.client = null;
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  private cleanExpiredMemoryEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expires && entry.expires < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isRedisConnected()) {
        const value = await this.client!.get(key);
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      }
    } catch (error) {
      this.logger.debug(`Redis get failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback to memory
    this.cleanExpiredMemoryEntries();
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (entry.expires && entry.expires < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      if (this.isRedisConnected()) {
        if (ttlSeconds) {
          await this.client!.setex(key, ttlSeconds, stringValue);
        } else {
          await this.client!.set(key, stringValue);
        }
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis set failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback to memory
    this.memoryCache.set(key, {
      value: stringValue,
      expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  /**
   * Set a value only if it does not exist (NX option).
   * Useful for distributed locking.
   * @returns true if the key was set, false if it already existed
   */
  async setNX(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      if (this.isRedisConnected()) {
        let result: 'OK' | null;
        if (ttlSeconds) {
          // SET key value EX seconds NX
          result = await this.client!.set(key, stringValue, 'EX', ttlSeconds, 'NX');
        } else {
          result = await this.client!.set(key, stringValue, 'NX');
        }
        return result === 'OK';
      }
    } catch (error) {
      this.logger.debug(`Redis setNX failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback to memory - check if exists first
    this.cleanExpiredMemoryEntries();
    if (this.memoryCache.has(key)) {
      return false;
    }
    this.memoryCache.set(key, {
      value: stringValue,
      expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
    return true;
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isRedisConnected()) {
        await this.client!.del(key);
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis del failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    this.memoryCache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.isRedisConnected()) {
        const keys = await this.client!.keys(pattern);
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis delPattern failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback - simple pattern matching for memory cache
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isRedisConnected()) {
        const result = await this.client!.exists(key);
        return result === 1;
      }
    } catch (error) {
      this.logger.debug(`Redis exists failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return false;
    if (entry.expires && entry.expires < Date.now()) {
      this.memoryCache.delete(key);
      return false;
    }
    return true;
  }

  async ttl(key: string): Promise<number> {
    try {
      if (this.isRedisConnected()) {
        return await this.client!.ttl(key);
      }
    } catch (error) {
      this.logger.debug(`Redis ttl failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    const entry = this.memoryCache.get(key);
    if (!entry || !entry.expires) return -1;
    const remaining = Math.floor((entry.expires - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async incr(key: string): Promise<number> {
    try {
      if (this.isRedisConnected()) {
        return await this.client!.incr(key);
      }
    } catch (error) {
      this.logger.debug(`Redis incr failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    const entry = this.memoryCache.get(key);
    const current = entry ? parseInt(entry.value, 10) || 0 : 0;
    const newValue = current + 1;
    this.memoryCache.set(key, { value: String(newValue), expires: entry?.expires });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      if (this.isRedisConnected()) {
        await this.client!.expire(key, seconds);
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis expire failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.expires = Date.now() + seconds * 1000;
    }
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      if (this.isRedisConnected()) {
        await this.client!.hset(key, field, stringValue);
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis hset failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback - store as JSON object
    const hashKey = `__hash__${key}`;
    const existing = this.memoryCache.get(hashKey);
    let hash: Record<string, string> = {};
    if (existing) {
      try {
        hash = JSON.parse(existing.value);
      } catch {}
    }
    hash[field] = stringValue;
    this.memoryCache.set(hashKey, { value: JSON.stringify(hash) });
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      if (this.isRedisConnected()) {
        const value = await this.client!.hget(key, field);
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      }
    } catch (error) {
      this.logger.debug(`Redis hget failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback
    const hashKey = `__hash__${key}`;
    const existing = this.memoryCache.get(hashKey);
    if (!existing) return null;
    try {
      const hash = JSON.parse(existing.value);
      const value = hash[field];
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      if (this.isRedisConnected()) {
        await this.client!.hdel(key, field);
        return;
      }
    } catch (error) {
      this.logger.debug(`Redis hdel failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback
    const hashKey = `__hash__${key}`;
    const existing = this.memoryCache.get(hashKey);
    if (existing) {
      try {
        const hash = JSON.parse(existing.value);
        delete hash[field];
        this.memoryCache.set(hashKey, { value: JSON.stringify(hash) });
      } catch {}
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      if (this.isRedisConnected()) {
        const result = await this.client!.hgetall(key);
        const parsed: Record<string, T> = {};
        for (const [k, v] of Object.entries(result)) {
          try {
            parsed[k] = JSON.parse(v) as T;
          } catch {
            parsed[k] = v as unknown as T;
          }
        }
        return parsed;
      }
    } catch (error) {
      this.logger.debug(`Redis hgetall failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Fallback
    const hashKey = `__hash__${key}`;
    const existing = this.memoryCache.get(hashKey);
    if (!existing) return {};
    try {
      const hash = JSON.parse(existing.value);
      const parsed: Record<string, T> = {};
      for (const [k, v] of Object.entries(hash)) {
        try {
          parsed[k] = JSON.parse(v as string) as T;
        } catch {
          parsed[k] = v as unknown as T;
        }
      }
      return parsed;
    } catch {
      return {};
    }
  }
}
