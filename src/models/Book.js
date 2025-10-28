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
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);
