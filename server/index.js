const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit"); // 🔐 Import rate limiting for security

const app = express();

// =========================
// 🔥 GLOBAL MIDDLEWARE
// =========================

// Enable CORS (allow frontend to communicate with backend)
app.use(cors());

// Parse incoming JSON requests (req.body)
app.use(express.json());

// =========================
// 🔐 RATE LIMITER (SECURITY)
// =========================

// Limit number of requests to auth routes (protect against brute force & spam)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // max 100 requests per IP within window
    message: "Too many requests, try again later", // response message when limit exceeded
});

// =========================
// 🔥 DATABASE CONNECTION
// =========================

// Connect to MongoDB
connectDB();

// =========================
// 🔥 ROUTES
// =========================

// Apply rate limiter ONLY to auth routes (register/login)
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// =========================
// 🔐 PROTECTED ROUTE
// =========================

// Import auth middleware
const protect = require("./middleware/authMiddleware");

// Example protected route (only accessible with valid JWT token)
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user, // user comes from middleware
    });
});

// =========================
// 🚀 START SERVER
// =========================

// Define port (from .env or fallback to 5000)
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("🔥 SERVER IS RUNNING");
});
