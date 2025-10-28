/** @format */

const Redis = require("ioredis");
const { memoryCache } = require("./memoryCache");

// Redis client konfiguratsiyasi
const redisConfig = {
  host:
    process.env.REDIS_HOST ||
    process.env.REDIS_URL?.split("://")[1]?.split(":")[0] ||
    "127.0.0.1",
  port:
    parseInt(process.env.REDIS_PORT) ||
    parseInt(process.env.REDIS_URL?.split(":")[2]) ||
    6379,
  password:
    process.env.REDIS_PASSWORD ||
    process.env.REDIS_URL?.split("://")[1]?.split("@")[0]?.split(":")[1] ||
    undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  lazyConnect: true, // Production uchun lazy connect
  keepAlive: 30000,
  connectTimeout: 5000, // Production uchun ko'proq vaqt
  commandTimeout: 5000,
  family: 4,
  enableReadyCheck: true,
  maxLoadingTimeout: 1000,
  // Production uchun qo'shimcha sozlamalar
  enableOfflineQueue: true,
  retryDelayOnClusterDown: 100,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  // Connection pool
  enableAutoPipelining: false,
  maxLoadingTimeout: 1000,
  // Railway uchun qo'shimcha sozlamalar
  showFriendlyErrorStack: process.env.NODE_ENV !== "production",
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  // Connection retry
  retryDelayOnClusterDown: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 1000,
};

// Redis client yaratish
let redis;
let redisConnected = false;

// Redis mavjudligini tekshirish
const isRedisAvailable = () => {
  // Faqat REDIS_HOST yoki REDIS_URL ko'rsatilgan bo'lsa true qaytarish
  return !!(process.env.REDIS_HOST || process.env.REDIS_URL);
};

if (isRedisAvailable()) {
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
} else {
  console.warn("⚠️ Redis not configured, using memory cache fallback");
  redisConnected = false;
}

// Cache helper funksiyalari
const cache = {
  // Redis yoki Memory cache ulanishini tekshirish
  isConnected() {
    const redisReady = redisConnected && redis && redis.status === "ready";
    const memoryReady = memoryCache && memoryCache.isConnected();
    return redisReady || memoryReady;
  },

  // Ma'lumotni cache ga saqlash
  async set(key, value, ttl = 3600) {
    // Redis mavjud va ishlamoqda bo'lsa
    if (redisConnected && redis && redis.status === "ready") {
      try {
        const serializedValue = JSON.stringify(value);
        await redis.setex(key, ttl, serializedValue);
        return true;
      } catch (error) {
        console.error("Redis cache set error:", error.message);
        // Redis error bo'lsa, memory cache ga fallback
      }
    }

    // Memory cache ishlatish (fallback)
    return await memoryCache.set(key, value, ttl);
  },

  // Ma'lumotni cache dan olish
  async get(key) {
    // Redis mavjud va ishlamoqda bo'lsa
    if (redisConnected && redis && redis.status === "ready") {
      try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error("Redis cache get error:", error.message);
        // Redis error bo'lsa, memory cache ga fallback
      }
    }

    // Memory cache ishlatish (fallback)
    return await memoryCache.get(key);
  },

  // Ma'lumotni cache dan o'chirish
  async del(key) {
    // Redis mavjud va ishlamoqda bo'lsa
    if (redisConnected && redis && redis.status === "ready") {
      try {
        await redis.del(key);
        return true;
      } catch (error) {
        console.error("Redis cache delete error:", error.message);
        // Redis error bo'lsa, memory cache ga fallback
      }
    }

    // Memory cache ishlatish (fallback)
    return await memoryCache.del(key);
  },

  // Pattern bo'yicha keylarni o'chirish
  async delPattern(pattern) {
    // Redis mavjud va ishlamoqda bo'lsa
    if (redisConnected && redis && redis.status === "ready") {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return true;
      } catch (error) {
        console.error("Redis cache delete pattern error:", error.message);
        // Redis error bo'lsa, memory cache ga fallback
      }
    }

    // Memory cache ishlatish (fallback)
    return await memoryCache.delPattern(pattern);
  },

  // Cache ni tozalash
  async flush() {
    // Redis mavjud va ishlamoqda bo'lsa
    if (redisConnected && redis && redis.status === "ready") {
      try {
        await redis.flushdb();
        return true;
      } catch (error) {
        console.error("Redis cache flush error:", error.message);
        // Redis error bo'lsa, memory cache ga fallback
      }
    }

    // Memory cache ishlatish (fallback)
    return await memoryCache.flush();
  },

  // Cache hajmini olish
  size() {
    return memoryCache.size();
  },
};

module.exports = { redis, cache };
