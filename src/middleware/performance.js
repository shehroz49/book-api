/** @format */

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Response tugagach vaqtni o'lchash
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    // Faqat 100ms dan ortiq bo'lgan so'rovlarni ko'rsatish
    if (duration > 100) {
      console.log(`⚠️  SLOW: ${method} ${url} - ${status} - ${duration}ms`);
    } else {
      console.log(`✅ FAST: ${method} ${url} - ${status} - ${duration}ms`);
    }
  });

  next();
};

module.exports = { performanceMonitor };
