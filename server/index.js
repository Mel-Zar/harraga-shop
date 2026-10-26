import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// =========================
// SAFETY CHECK (VIKTIGT)
// =========================
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI saknas i .env");
    process.exit(1);
}

if (
    !process.env.MONGO_URI.startsWith("mongodb://") &&
    !process.env.MONGO_URI.startsWith("mongodb+srv://")
) {
    console.error("❌ MONGO_URI har fel format.");
    console.error(
        "MONGO_URI börjar med:",
        process.env.MONGO_URI.slice(0, 20)
    );
    process.exit(1);
}

// =========================
// APP INIT
// =========================
const app = express();

// =========================
// FIX __dirname (ESM)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// UPLOADS DIRECTORY
// =========================
const uploadsPath = path.join(__dirname, "uploads");

console.log("📁 UPLOADS DIRECTORY:", uploadsPath);

// =========================
// TRUST PROXY
// =========================
app.set("trust proxy", 1);

// =========================
// SECURITY
// =========================
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

// =========================
// CORS
// BEHÅLLER BEFINTLIG CORS_ORIGIN
// OCH TILLÅTER LOKAL UTVECKLING
// =========================
const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

const allowedOrigins = [
    ...new Set([
        ...configuredOrigins,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://harraga.local:5173",
    ]),
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Tillåt anrop utan Origin-header, exempelvis vissa
            // server-till-server-anrop och lokala verktyg.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked origin: ${origin}`)
            );
        },
        credentials: true,
    })
);

// =====================================================
// STRIPE WEBHOOK
// VIKTIGT: MÅSTE ligga före express.json()
// =====================================================

import paymentRoutes from "./routes/paymentRoutes.js";

app.use(
    "/api/payments/stripe/webhook",
    express.raw({
        type: "application/json",
    }),
    paymentRoutes
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
// STATIC FILES - IMAGE HEADERS
// =========================
const uploadStaticOptions = {
    setHeaders: (res) => {
        res.setHeader(
            "Cross-Origin-Resource-Policy",
            "cross-origin"
        );

        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );
    },
};

// =========================
// STATIC FILES - ORIGINAL URL
// /uploads/filename.jpeg
// =========================
app.use(
    "/uploads",
    express.static(
        uploadsPath,
        uploadStaticOptions
    )
);

// =========================
// STATIC FILES - API URL
// /api/uploads/filename.jpeg
// =========================
app.use(
    "/api/uploads",
    express.static(
        uploadsPath,
        uploadStaticOptions
    )
);

// =========================
// EXISTING UPLOAD HEADERS
// BEHÅLLEN
// =========================
app.use(
    "/uploads",
    (req, res, next) => {
        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.setHeader(
            "Cross-Origin-Resource-Policy",
            "cross-origin"
        );

        next();
    }
);

// =========================
// DB (SAFE INIT)
// =========================
connectDB();

// =========================
// ROUTES
// =========================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// =========================
// CUSTOMER SERVICE ROUTES
// =========================
import supportRoutes from "./routes/supportRoutes.js";

app.use(
    "/api/support",
    supportRoutes
);

// =========================
// EXISTING ROUTES
// =========================
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/address",
    addressRoutes
);

app.use(
    "/api/countries",
    countryRoutes
);

app.use(
    "/api/protected",
    protectedRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

// =========================
// HEALTH
// =========================
app.get(
    "/api/health",
    (req, res) => {
        res.status(200).json({
            status: "OK",
        });
    }
);

// =========================
// 404
// =========================
app.use(
    (req, res) => {
        res.status(404).json({
            message: "Route not found",
            path: req.originalUrl,
        });
    }
);

// =========================
// ERROR HANDLER
// =========================
app.use(
    (err, req, res, next) => {
        console.error("❌ Server error:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
);

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5050;

app.listen(
    PORT,
    () => {
        console.log(
            `🚀 Server running on port ${PORT}`
        );
        console.log("✅ Allowed CORS origins:", allowedOrigins);
    }
);

console.log(
    "GOOGLE MAPS KEY LOADED:",
    Boolean(process.env.GOOGLE_MAPS_API_KEY)
);
