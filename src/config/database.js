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

    const conn = await mongoose.connect(mongoURI);
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
