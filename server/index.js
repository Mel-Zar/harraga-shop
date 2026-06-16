const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// =========================
// TRUST PROXY (for deployment)
// =========================
app.set("trust proxy", 1);

// =========================
// SECURITY HEADERS
// =========================
app.use(helmet());

// =========================
// CORS CONFIG (PRO FIX)
// =========================
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173"];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// =========================
// BODY PARSING
// =========================
app.use(express.json());
app.use(cookieParser());

// =========================
// GLOBAL RATE LIMIT
// =========================
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// =========================
// 🧠 FIX: STATIC FILES (UPLOADS)
// =========================
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
        setHeaders: (res) => {
            res.setHeader(
                "Cross-Origin-Resource-Policy",
                "cross-origin"
            );
        },
    })
);

// extra safety header middleware (fixar browser block)
app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// =========================
// DATABASE CONNECTION
// =========================
connectDB();

// =========================
// ROUTES
// =========================

console.log("🔵 Loading routes...");

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/userRoutes"));

try {
    app.use(
        "/api/address",
        require("./routes/addressRoutes")
    );

    console.log("🟢 /api/address route loaded");
} catch (err) {
    console.error("🔴 Failed to load addressRoutes:", err);
}

app.use("/api/countries", require("./routes/countryRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"));

// =========================
// 🛒 PRODUCTS ROUTE
// =========================
app.use(
    "/api/products",
    require("./routes/productRoutes")
);

// =========================
// HEALTH CHECK
// =========================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
    });
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
    });
});

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);

    res.status(500).json({
        message: "Server error",
    });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});