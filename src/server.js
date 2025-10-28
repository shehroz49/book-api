/** @format */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/database");
const swaggerSpec = require("./config/swagger");
const { redis } = require("./config/redis");
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");

// Environment variables yuklash
dotenv.config();

// Database ulanish
connectDB();

const app = express();

// Rate limiting qo'llash
app.use(generalLimiter);

// Middleware - CORS sozlamalari (Swagger va ngrok uchun)
app.use(
  cors({
    origin: true, // Barcha domenlardan ruxsat (dinamik)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-auth-token",
      "Accept",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Books API Documentation",
  })
);

// Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/books", apiLimiter, require("./routes/bookRoutes"));

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
