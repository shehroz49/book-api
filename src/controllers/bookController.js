const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    // Autentifikatsiya bo'lsa faqat o'z kitoblarini, bo'lmasa barcha kitoblarni ko'rsatish
    const query = req.user ? { user: req.user._id } : {};
    const books = await Book.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitob topilmadi'
      });
    }

    // Barcha foydalanuvchilar kitobni ko'rishi mumkin
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
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
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Kitob muvaffaqiyatli yaratildi',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitob topilmadi'
      });
    }

    // Faqat o'z kitobini tahrirlashi mumkin
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kitobni tahrirlashga ruxsat yo\'q'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Kitob muvaffaqiyatli yangilandi',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitob topilmadi'
      });
    }

    // Faqat o'z kitobini o'chirishi mumkin
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu kitobni o\'chirishga ruxsat yo\'q'
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Kitob muvaffaqiyatli o\'chirildi',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};
