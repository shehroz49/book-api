/** @format */

const Book = require("../models/Book");
const { cache } = require("../config/redis");

// Server startup da cache ni to'ldirish
const warmupCache = async () => {
  try {
    console.log("🔥 Warming up cache...");

    // Barcha kitoblarni olish va cache ga saqlash
    const books = await Book.find({})
      .select("name description image user createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Public cache
    await cache.set("books:public", books, 3600);
    console.log(`✅ Cache warmed: ${books.length} books`);

    // Har bir user uchun cache (agar user lari oz bo'lsa)
    const users = [...new Set(books.map((b) => b.user.toString()))];

    for (const userId of users) {
      const userBooks = books.filter((b) => b.user.toString() === userId);
      await cache.set(`books:${userId}`, userBooks, 3600);
    }

    console.log(`✅ Cache warmed for ${users.length} users`);
  } catch (error) {
    console.error("❌ Cache warmup failed:", error.message);
  }
};

module.exports = { warmupCache };
