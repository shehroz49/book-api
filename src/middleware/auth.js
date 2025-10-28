const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Tokenni headerdan olish
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token borligini tekshirish
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Ushbu routega kirish uchun tizimga kirish talab etiladi'
    });
  }

  try {
    // Tokenni verify qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Foydalanuvchini topish
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati o\'tgan'
    });
  }
};

module.exports = { protect };
