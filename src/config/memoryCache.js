/** @format */

// Simple in-memory cache (Redis bo'lmasa ishlatish uchun)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  // Ma'lumotni cache ga saqlash
  async set(key, value, ttl = 3600) {
    try {
      // Eski timer ni tozalash
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }

      // Qiymatni saqlash
      this.cache.set(key, value);

      // TTL timer yaratish
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
      }, ttl * 1000);

      this.timers.set(key, timer);
      return true;
    } catch (error) {
      console.error('Memory cache set error:', error.message);
      return false;
    }
  }

  // Ma'lumotni cache dan olish
  async get(key) {
    try {
      return this.cache.get(key) || null;
    } catch (error) {
      console.error('Memory cache get error:', error.message);
      return null;
    }
  }

  // Ma'lumotni cache dan o'chirish
  async del(key) {
    try {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      this.cache.delete(key);
      return true;
    } catch (error) {
      console.error('Memory cache delete error:', error.message);
      return false;
    }
  }

  // Pattern bo'yicha keylarni o'chirish
  async delPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'));
      const keysToDelete = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        await this.del(key);
      }

      return true;
    } catch (error) {
      console.error('Memory cache delete pattern error:', error.message);
      return false;
    }
  }

  // Cache ni tozalash
  async flush() {
    try {
      // Barcha timer larni tozalash
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.cache.clear();
      this.timers.clear();
      return true;
    } catch (error) {
      console.error('Memory cache flush error:', error.message);
      return false;
    }
  }

  // Cache hajmini olish
  size() {
    return this.cache.size;
  }

  // Connection holatini tekshirish
  isConnected() {
    return true; // Memory cache har doim "connected"
  }
}

// Singleton instance
const memoryCache = new MemoryCache();

module.exports = { memoryCache };
