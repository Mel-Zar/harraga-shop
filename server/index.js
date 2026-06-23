import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// =========================
// FIX __dirname (ESM)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// TRUST PROXY
// =========================
app.set("trust proxy", 1);

// =========================
// SECURITY
// =========================
app.use(helmet());

// =========================
// CORS
// =========================
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

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
// RATE LIMIT
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
// STATIC FILES
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

app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// =========================
// DB
// =========================
connectDB();

// =========================
// ROUTES
// =========================

console.log("🔵 Loading routes...");

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// =========================
// HEALTH
// =========================
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// =========================
// 404
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