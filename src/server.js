/** @format */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/database");
const swaggerSpec = require("./config/swagger");
const { redis } = require("./config/redis");
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");
const { performanceMonitor } = require("./middleware/performance");

// Environment variables yuklash
dotenv.config();

// Database ulanish
connectDB();

const app = express();

// Performance monitoring (development da)
if (process.env.NODE_ENV !== 'production') {
  app.use(performanceMonitor);
}

// Compression middleware (eng birinchi bo'lishi kerak)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false; // Compression kerak bo'lmasa
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression darajasi (1-9, 6 optimal)
  threshold: 1024, // Faqat 1KB dan katta response lar uchun
}));

// Rate limiting qo'llash (faqat production da)
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

// Middleware - CORS sozlamalari (optimized)
const corsOptions = {
  origin: true, // Barcha domenlardan ruxsat
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 soat CORS cache
  preflightContinue: false,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb', strict: true })); // Body size limit
app.use(express.urlencoded({ extended: false, limit: '1mb' })); // extended: false tezroq

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Books API Documentation",
  })
);

// Routes (rate limiter faqat production da)
if (process.env.NODE_ENV === 'production') {
  app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
  app.use("/api/books", apiLimiter, require("./routes/bookRoutes"));
} else {
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/books", require("./routes/bookRoutes"));
}

// Asosiy route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Books API ishlamoqda",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route topilmadi",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server xatosi",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`);
});
