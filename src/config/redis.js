/** @format */

const Redis = require("ioredis");

// Redis client konfiguratsiyasi
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Redis client yaratish
const redis = new Redis(redisConfig);

// Redis ulanishini tekshirish
redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redis.on("ready", () => {
  console.log("✅ Redis Ready");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Closing Redis connection...");
  await redis.quit();
  process.exit(0);
});

// Cache helper funksiyalari
const cache = {
  // Ma'lumotni cache ga saqlash
  async set(key, value, ttl = 3600) {
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
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error("Cache TTL error:", error.message);
      return -1;
    }
  },
};

module.exports = { redis, cache };
