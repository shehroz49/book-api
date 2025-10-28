const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Access token yaratish
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// JWT Refresh token yaratish
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Foydalanuvchi mavjudligini tekshirish
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
      });
    }

    // Yangi foydalanuvchi yaratish
    const user = await User.create({
      email,
      password
    });

    // Access va Refresh token yaratish
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh tokenni bazaga saqlash
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email va parol kiritilganligini tekshirish
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Iltimos email va parolni kiriting'
      });
    }

    // Foydalanuvchini topish (parol bilan)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Parolni tekshirish
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Access va Refresh token yaratish
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh tokenni bazaga saqlash
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Tizimga kirish muvaffaqiyatli',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      email: req.user.email,
      createdAt: req.user.createdAt
    };

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token kiritilmagan'
      });
    }

    // Refresh tokenni tekshirish
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Foydalanuvchini topish
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Bazadagi refresh token bilan solishtirib ko'rish
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token noto\'g\'ri'
      });
    }

    // Yangi access token yaratish
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token yangilandi',
      token: newToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Refresh token noto\'g\'ri yoki muddati tugagan',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Foydalanuvchini topish va refresh tokenni o'chirish
    const user = await User.findById(req.user._id);

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqdingiz'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

module.exports = { register, login, getMe, refreshAccessToken, logout };
