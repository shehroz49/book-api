const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kitob nomi kiritish majburiy'],
    trim: true,
    maxlength: [200, 'Kitob nomi 200 ta belgidan oshmasligi kerak']
  },
  description: {
    type: String,
    required: [true, 'Kitob ma\'lumoti kiritish majburiy'],
    maxlength: [2000, 'Kitob ma\'lumoti 2000 ta belgidan oshmasligi kerak']
  },
  image: {
    type: String,
    required: [true, 'Kitob rasmi kiritish majburiy']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // User bo'yicha tez qidiruv uchun
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Sana bo'yicha tez sorting uchun
  }
});

// Compound index - user va createdAt uchun
bookSchema.index({ user: 1, createdAt: -1 });

// _id avtomatik index bo'ladi, qo'shimcha keremas

module.exports = mongoose.model('Book', bookSchema);
