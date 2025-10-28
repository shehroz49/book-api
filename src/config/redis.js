/** @format */

const Redis = require("ioredis");

// Redis client konfiguratsiyasi
const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1", // localhost o'rniga 127.0.0.1
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1, // Kamaytirildi
  lazyConnect: false, // Darhol ulanish
  keepAlive: 30000,
  connectTimeout: 3000, // Kamaytirildi
  commandTimeout: 3000, // Kamaytirildi
  family: 4, // IPv4 ni majburiy qilish
  enableReadyCheck: true,
  maxLoadingTimeout: 1000,
  // Production uchun qo'shimcha sozlamalar
  enableOfflineQueue: true, // Offline queue ni yoqish
  retryDelayOnClusterDown: 100,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  // Connection pool
  enableAutoPipelining: false, // Auto pipelining ni o'chirish
  maxLoadingTimeout: 1000,
};

// Redis client yaratish
let redis;
let redisConnected = false;

try {
  redis = new Redis(redisConfig);

  // Redis ulanishini tekshirish
  redis.on("connect", () => {
    console.log("✅ Redis Connected");
    redisConnected = true;
  });

  redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
    redisConnected = false;
  });

  redis.on("ready", () => {
    console.log("✅ Redis Ready");
    redisConnected = true;
  });

  redis.on("close", () => {
    console.log("⚠️ Redis connection closed");
    redisConnected = false;
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("🔄 Closing Redis connection...");
    if (redis) {
      await redis.quit();
    }
    process.exit(0);
  });
} catch (error) {
  console.error("❌ Redis initialization error:", error.message);
  redisConnected = false;
}

// Cache helper funksiyalari
const cache = {
  // Redis ulanishini tekshirish
  isConnected() {
    return redisConnected && redis && redis.status === "ready";
  },

  // Ma'lumotni cache ga saqlash
  async set(key, value, ttl = 3600) {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache set");
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await redis.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error("Cache set error:", error.message);
      return false;
    }
  },

  // Ma'lumotni cache dan olish
  async get(key) {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache get");
      return null;
    }

    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error.message);
      return null;
    }
  },

  // Ma'lumotni cache dan o'chirish
  async del(key) {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache delete");
      return false;
    }

    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error.message);
      return false;
    }
  },

  // Pattern bo'yicha keylarni o'chirish
  async delPattern(pattern) {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache pattern delete");
      return false;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error.message);
      return false;
    }
  },

  // Cache ni tozalash
  async flush() {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache flush");
      return false;
    }

    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error.message);
      return false;
    }
  },

  // TTL ni olish
  async ttl(key) {
    if (!this.isConnected()) {
      console.warn("Redis not connected, skipping cache TTL");
      return -1;
    }

    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error("Cache TTL error:", error.message);
      return -1;
    }
  },
};

module.exports = { redis, cache };
