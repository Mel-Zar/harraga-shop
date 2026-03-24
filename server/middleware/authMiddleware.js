const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 Middleware to protect routes (requires valid JWT token)
const protect = async (req, res, next) => {
    let token;

    // =========================
    // 🔍 CHECK FOR TOKEN IN HEADER OR COOKIE
    // =========================

    // 1. Check Authorization header: "Bearer TOKEN"
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check httpOnly cookie (for future frontend use)
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    // =========================
    // ❌ NO TOKEN PROVIDED
    // =========================
    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        // =========================
        // 🔐 VERIFY TOKEN
        // =========================

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("DECODED TOKEN:", decoded); // 🔥 DEBUG

        // =========================
        // 👤 GET USER ID FROM TOKEN
        // =========================

        const userId = decoded.id || decoded.userId || decoded._id;

        // =========================
        // 🔎 FIND USER IN DATABASE
        // =========================

        req.user = await User.findById(userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        // =========================
        // ⏳ TOKEN EXPIRATION CHECK (extra safety)
        // =========================

        // jwt.verify already checks expiration, but we can log/debug
        if (decoded.exp * 1000 < Date.now()) {
            return res.status(401).json({ message: "Token expired" });
        }

        // =========================
        // ✅ ACCESS GRANTED
        // =========================

        return next();

    } catch (error) {
        // =========================
        // ❌ ERROR HANDLING (IMPROVED)
        // =========================

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// =========================
// 🔐 ROLE-BASED AUTH (ADMIN)
// =========================

// Use this AFTER protect middleware
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }

    return res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, admin };
