const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const app = express();

// =========================
// 🌍 TRUST PROXY
// =========================
app.set("trust proxy", 1);

// =========================
// 🛡️ SECURITY HEADERS
// =========================
app.use(helmet());

// =========================
// 🌐 CORS CONFIG
// =========================
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// =========================
// BODY PARSER
// =========================
app.use(express.json());
app.use(cookieParser());

// =========================
// 🔐 RATE LIMITER (AUTH)
// =========================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later",
});

// =========================
// 🔥 DATABASE
// =========================
connectDB();

// =========================
// 🔥 ROUTES
// =========================

// AUTH ROUTES
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// USER ROUTES
app.use("/api", require("./routes/userRoutes"));

// ADDRESS ROUTES
app.use("/api/address", require("./routes/addressRoutes"));

// 🔐 PROTECTED ROUTES (PRO)
app.use("/api", require("./routes/protectedRoutes"));

// =========================
// 🚫 404 HANDLER
// =========================
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

// =========================
// ❌ ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR:", err.stack);

    res.status(500).json({
        message: "Something went wrong",
    });
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("🔥 SERVER IS RUNNING");
});
