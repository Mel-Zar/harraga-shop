const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit"); // 🔐 Import rate limiting for security
const cookieParser = require("cookie-parser"); // 🔐 Import cookie parser (for httpOnly cookies)

const app = express();

// =========================
// 🔥 GLOBAL MIDDLEWARE
// =========================

// Enable CORS (allows frontend to communicate with backend)
app.use(cors());

// Parse incoming JSON requests (req.body)
app.use(express.json());

// Parse cookies from incoming requests (req.cookies)
app.use(cookieParser());

// =========================
// 🔐 RATE LIMITER (SECURITY)
// =========================

// Limit number of requests to auth routes (protect against brute force & spam attacks)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // max 100 requests per IP within this time
    message: "Too many requests, try again later", // response when limit exceeded
});

// =========================
// 🔥 DATABASE CONNECTION
// =========================

// Connect to MongoDB database
connectDB();

// =========================
// 🔥 ROUTES
// =========================

// Apply rate limiter ONLY to authentication routes (register/login)
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// =========================
// 🔐 PROTECTED ROUTE
// =========================

// Import authentication middleware
const protect = require("./middleware/authMiddleware");

// Example protected route (requires valid JWT token to access)
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user, // user is attached by middleware
    });
});

// =========================
// 🚀 START SERVER
// =========================

// Define port (use .env or fallback to 5000)
const PORT = process.env.PORT || 5000;

// Start server and listen for requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("🔥 SERVER IS RUNNING");
});
