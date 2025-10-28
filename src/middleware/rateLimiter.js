/** @format */

const rateLimit = require("express-rate-limit");
const { redis } = require("../config/redis");

// Redis store yaratish (fallback)
let RedisStore;
let redisAvailable = false;

try {
  RedisStore = require("rate-limit-redis").RedisStore;
  redisAvailable = true;
} catch (error) {
  console.warn("Redis store yuklanmadi, memory store ishlatilmoqda");
  RedisStore = null;
  redisAvailable = false;
}

// Redis mavjudligini tekshirish
const isRedisConfigured = () => {
  // Faqat REDIS_HOST yoki REDIS_URL ko'rsatilgan bo'lsa true qaytarish
  return !!(process.env.REDIS_HOST || process.env.REDIS_URL);
};

// Har bir limiter uchun alohida store yaratish
const createRedisStore = (prefix) => {
  if (!RedisStore || !isRedisConfigured()) return undefined;

  try {
    return new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${prefix}:`,
    });
  } catch (error) {
    console.warn(`Redis store yaratishda xatolik (${prefix}):`, error.message);
    return undefined;
  }
};

// Rate limiter konfiguratsiyasi
const createLimiter = (config, storePrefix) => {
  const limiterConfig = {
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Redis mavjud bo'lsa va ishlayotgan bo'lsa, Redis store ishlatish
  if (redisAvailable && isRedisConfigured()) {
    const redisStore = createRedisStore(storePrefix);
    if (redisStore) {
      limiterConfig.store = redisStore;
    }
  }

  return rateLimit(limiterConfig);
};

// Umumiy rate limiter
const generalLimiter = createLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 100, // 15 daqiqada 100 ta so'rov
    message: {
      success: false,
      message:
        "Juda ko'p so'rov yuborildi, 15 daqiqadan keyin qayta urinib ko'ring",
    },
  },
  "general"
);

// Auth uchun rate limiter (qattiqroq)
const authLimiter = createLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 5, // 15 daqiqada 5 ta urinish
    message: {
      success: false,
      message: "Juda ko'p urinish, 15 daqiqadan keyin qayta urinib ko'ring",
    },
    skipSuccessfulRequests: true, // Muvaffaqiyatli so'rovlarni hisobga olmaslik
  },
  "auth"
);

// API uchun rate limiter (o'rta)
const apiLimiter = createLimiter(
  {
    windowMs: 1 * 60 * 1000, // 1 daqiqa
    max: 30, // 1 daqiqada 30 ta so'rov
    message: {
      success: false,
      message:
        "Juda ko'p so'rov yuborildi, 1 daqiqadan keyin qayta urinib ko'ring",
    },
  },
  "api"
);

// Upload uchun rate limiter (kam)
const uploadLimiter = createLimiter(
  {
    windowMs: 60 * 60 * 1000, // 1 soat
    max: 10, // 1 soatda 10 ta upload
    message: {
      success: false,
      message: "Juda ko'p fayl yuklandi, 1 soatdan keyin qayta urinib ko'ring",
    },
  },
  "upload"
);

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
};
