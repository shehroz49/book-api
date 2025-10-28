/** @format */

const Book = require("../models/Book");
const { cache } = require("../config/redis");

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    // Cache key yaratish
    const userId = req.user ? req.user._id.toString() : "public";
    const cacheKey = `books:${userId}`;

    // Cache dan ma'lumot olish
    let books = await cache.get(cacheKey);

    if (!books) {
      // Autentifikatsiya bo'lsa faqat o'z kitoblarini, bo'lmasa barcha kitoblarni ko'rsatish
      const query = req.user ? { user: req.user._id } : {};
      books = await Book.find(query)
        .select('name description image user createdAt') // Faqat kerakli fieldlar
        .sort({ createdAt: -1 })
        .lean(); // Plain JavaScript object qaytaradi (Mongoose overhead yo'q)

      // Cache ga saqlash (5 daqiqa)
      await cache.set(cacheKey, books, 300);
    }

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
      cached: books ? true : false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const cacheKey = `book:${bookId}`;

    // Cache dan ma'lumot olish
    let book = await cache.get(cacheKey);

    if (!book) {
      book = await Book.findById(bookId)
        .select('name description image user createdAt')
        .lean(); // Tez ishlash uchun

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Kitob topilmadi",
        });
      }

      // Cache ga saqlash (10 daqiqa)
      await cache.set(cacheKey, book, 600);
    }

    // Barcha foydalanuvchilar kitobni ko'rishi mumkin
    res.status(200).json({
      success: true,
      data: book,
      cached: book ? true : false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const book = await Book.create({
      name,
      description,
      image,
      user: req.user._id,
    });

    // Cache ni tozalash
    const userId = req.user._id.toString();
    await cache.delPattern(`books:${userId}`);
    await cache.delPattern("books:public");

    res.status(201).json({
      success: true,
      message: "Kitob muvaffaqiyatli yaratildi",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    let book = await Book.findById(bookId)
      .select('user') // Faqat user field kerak check uchun
      .lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Kitob topilmadi",
      });
    }

    // Faqat o'z kitobini tahrirlashi mumkin
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu kitobni tahrirlashga ruxsat yo'q",
      });
    }

    book = await Book.findByIdAndUpdate(bookId, req.body, {
      new: true,
      runValidators: true,
      lean: true, // Tezroq ishlash uchun
    });

    // Cache ni tozalash
    await cache.del(`book:${bookId}`);
    await cache.delPattern(`books:${req.user._id.toString()}`);
    await cache.delPattern("books:public");

    res.status(200).json({
      success: true,
      message: "Kitob muvaffaqiyatli yangilandi",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId)
      .select('user') // Faqat user field kerak check uchun
      .lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Kitob topilmadi",
      });
    }

    // Faqat o'z kitobini o'chirishi mumkin
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu kitobni o'chirishga ruxsat yo'q",
      });
    }

    await Book.findByIdAndDelete(bookId); // Tezroq

    // Cache ni tozalash
    await cache.del(`book:${bookId}`);
    await cache.delPattern(`books:${req.user._id.toString()}`);
    await cache.delPattern("books:public");

    res.status(200).json({
      success: true,
      message: "Kitob muvaffaqiyatli o'chirildi",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};
