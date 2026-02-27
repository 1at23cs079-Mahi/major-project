"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.client = null;
        this.isConnected = false;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.memoryCache = new Map();
        this.enabled = this.configService.get('REDIS_ENABLED', 'false') === 'true';
    }
    async onModuleInit() {
        if (!this.enabled) {
            this.logger.warn('Redis is disabled. Using in-memory cache fallback.');
            return;
        }
        try {
            this.client = new ioredis_1.default({
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: this.configService.get('REDIS_PORT', 6379),
                password: this.configService.get('REDIS_PASSWORD') || undefined,
                retryStrategy: (times) => {
                    if (times > 3) {
                        this.logger.warn('Redis connection failed after 3 attempts. Using in-memory fallback.');
                        return null;
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
        }
        catch (error) {
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
    cleanExpiredMemoryEntries() {
        const now = Date.now();
        for (const [key, entry] of this.memoryCache.entries()) {
            if (entry.expires && entry.expires < now) {
                this.memoryCache.delete(key);
            }
        }
    }
    getClient() {
        return this.client;
    }
    isRedisConnected() {
        return this.isConnected && this.client !== null;
    }
    async get(key) {
        try {
            if (this.isRedisConnected()) {
                const value = await this.client.get(key);
                if (!value)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            }
        }
        catch (error) {
            this.logger.debug(`Redis get failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        this.cleanExpiredMemoryEntries();
        const entry = this.memoryCache.get(key);
        if (!entry)
            return null;
        if (entry.expires && entry.expires < Date.now()) {
            this.memoryCache.delete(key);
            return null;
        }
        try {
            return JSON.parse(entry.value);
        }
        catch {
            return entry.value;
        }
    }
    async set(key, value, ttlSeconds) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        try {
            if (this.isRedisConnected()) {
                if (ttlSeconds) {
                    await this.client.setex(key, ttlSeconds, stringValue);
                }
                else {
                    await this.client.set(key, stringValue);
                }
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis set failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        this.memoryCache.set(key, {
            value: stringValue,
            expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
        });
    }
    async setNX(key, value, ttlSeconds) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        try {
            if (this.isRedisConnected()) {
                let result;
                if (ttlSeconds) {
                    result = await this.client.set(key, stringValue, 'EX', ttlSeconds, 'NX');
                }
                else {
                    result = await this.client.set(key, stringValue, 'NX');
                }
                return result === 'OK';
            }
        }
        catch (error) {
            this.logger.debug(`Redis setNX failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
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
    async del(key) {
        try {
            if (this.isRedisConnected()) {
                await this.client.del(key);
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis del failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        this.memoryCache.delete(key);
    }
    async delPattern(pattern) {
        try {
            if (this.isRedisConnected()) {
                const keys = await this.client.keys(pattern);
                if (keys.length > 0) {
                    await this.client.del(...keys);
                }
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis delPattern failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
            }
        }
    }
    async exists(key) {
        try {
            if (this.isRedisConnected()) {
                const result = await this.client.exists(key);
                return result === 1;
            }
        }
        catch (error) {
            this.logger.debug(`Redis exists failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const entry = this.memoryCache.get(key);
        if (!entry)
            return false;
        if (entry.expires && entry.expires < Date.now()) {
            this.memoryCache.delete(key);
            return false;
        }
        return true;
    }
    async ttl(key) {
        try {
            if (this.isRedisConnected()) {
                return await this.client.ttl(key);
            }
        }
        catch (error) {
            this.logger.debug(`Redis ttl failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const entry = this.memoryCache.get(key);
        if (!entry || !entry.expires)
            return -1;
        const remaining = Math.floor((entry.expires - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }
    async incr(key) {
        try {
            if (this.isRedisConnected()) {
                return await this.client.incr(key);
            }
        }
        catch (error) {
            this.logger.debug(`Redis incr failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const entry = this.memoryCache.get(key);
        const current = entry ? parseInt(entry.value, 10) || 0 : 0;
        const newValue = current + 1;
        this.memoryCache.set(key, { value: String(newValue), expires: entry?.expires });
        return newValue;
    }
    async expire(key, seconds) {
        try {
            if (this.isRedisConnected()) {
                await this.client.expire(key, seconds);
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis expire failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const entry = this.memoryCache.get(key);
        if (entry) {
            entry.expires = Date.now() + seconds * 1000;
        }
    }
    async hset(key, field, value) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        try {
            if (this.isRedisConnected()) {
                await this.client.hset(key, field, stringValue);
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis hset failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const hashKey = `__hash__${key}`;
        const existing = this.memoryCache.get(hashKey);
        let hash = {};
        if (existing) {
            try {
                hash = JSON.parse(existing.value);
            }
            catch { }
        }
        hash[field] = stringValue;
        this.memoryCache.set(hashKey, { value: JSON.stringify(hash) });
    }
    async hget(key, field) {
        try {
            if (this.isRedisConnected()) {
                const value = await this.client.hget(key, field);
                if (!value)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            }
        }
        catch (error) {
            this.logger.debug(`Redis hget failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const hashKey = `__hash__${key}`;
        const existing = this.memoryCache.get(hashKey);
        if (!existing)
            return null;
        try {
            const hash = JSON.parse(existing.value);
            const value = hash[field];
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch {
            return null;
        }
    }
    async hdel(key, field) {
        try {
            if (this.isRedisConnected()) {
                await this.client.hdel(key, field);
                return;
            }
        }
        catch (error) {
            this.logger.debug(`Redis hdel failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const hashKey = `__hash__${key}`;
        const existing = this.memoryCache.get(hashKey);
        if (existing) {
            try {
                const hash = JSON.parse(existing.value);
                delete hash[field];
                this.memoryCache.set(hashKey, { value: JSON.stringify(hash) });
            }
            catch { }
        }
    }
    async hgetall(key) {
        try {
            if (this.isRedisConnected()) {
                const result = await this.client.hgetall(key);
                const parsed = {};
                for (const [k, v] of Object.entries(result)) {
                    try {
                        parsed[k] = JSON.parse(v);
                    }
                    catch {
                        parsed[k] = v;
                    }
                }
                return parsed;
            }
        }
        catch (error) {
            this.logger.debug(`Redis hgetall failed, using memory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const hashKey = `__hash__${key}`;
        const existing = this.memoryCache.get(hashKey);
        if (!existing)
            return {};
        try {
            const hash = JSON.parse(existing.value);
            const parsed = {};
            for (const [k, v] of Object.entries(hash)) {
                try {
                    parsed[k] = JSON.parse(v);
                }
                catch {
                    parsed[k] = v;
                }
            }
            return parsed;
        }
        catch {
            return {};
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map