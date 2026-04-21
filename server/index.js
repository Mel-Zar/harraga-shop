const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

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
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials: true,
    })
);

// =========================
// BODY
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
    })
);

// =========================
// DB
// =========================
connectDB();

// =========================
// ROUTES
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/protected", require("./routes/protectedRoutes"));

// =========================
// 404
// =========================
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Server error" });
});

// =========================
// START
// =========================
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
