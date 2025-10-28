/** @format */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // MongoDB URI ni tekshirish va fallback berish
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/book-api";

    if (!process.env.MONGODB_URI) {
      console.warn(
        "⚠️  MONGODB_URI environment variable is not set. Using default local MongoDB connection."
      );
      console.warn(
        "   To use a different database, set MONGODB_URI in your .env file"
      );
    }

    // MongoDB connection options - Ultra performance optimization
    const options = {
      maxPoolSize: 50, // Katta connection pool (Railway uchun)
      minPoolSize: 5, // Minimal connection soni
      maxIdleTimeMS: 60000, // 60 soniya idle
      serverSelectionTimeoutMS: 3000, // 3 soniya timeout (tezroq)
      socketTimeoutMS: 30000, // 30 soniya socket timeout
      connectTimeoutMS: 3000, // 3 soniya connection timeout
      family: 4, // IPv4 ishlatish (tezroq)
      retryWrites: true, // Retry failed writes
      w: 'majority', // Write concern
      compressors: ['zlib'], // Network compression
      zlibCompressionLevel: 6, // Compression level
      readPreference: 'nearest', // Eng yaqin MongoDB node dan o'qish (tezroq!)
      readConcern: { level: 'local' }, // Local read (tezroq, eventual consistency)
    };

    const conn = await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error("Please check:");
    console.error("1. MongoDB server is running");
    console.error("2. MONGODB_URI environment variable is set correctly");
    console.error("3. Network connection is available");
    process.exit(1);
  }
};

module.exports = connectDB;
