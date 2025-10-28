/** @format */

const rateLimit = require("express-rate-limit");
const { redis } = require("../config/redis");

// Redis store yaratish (fallback)
let RedisStore;
try {
  RedisStore = require("rate-limit-redis").RedisStore;
} catch (error) {
  console.warn("Redis store yuklanmadi, memory store ishlatilmoqda");
  RedisStore = null;
}

// Har bir limiter uchun alohida store yaratish
const createRedisStore = (prefix) => {
  if (!RedisStore) return undefined;

  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });
};

// Rate limiter konfiguratsiyasi
const createLimiter = (config, storePrefix) => {
  const limiterConfig = {
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
  };

  if (RedisStore) {
    limiterConfig.store = createRedisStore(storePrefix);
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
