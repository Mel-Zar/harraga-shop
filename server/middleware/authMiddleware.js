const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================
// PROTECT ROUTES
// =========================
const protect = async (req, res, next) => {
    let token;

    // =========================
    // 1) ACCESS TOKEN (Bearer)
    // =========================
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // =========================
    // 2) COOKIE TOKEN (if you ever use it)
    // =========================
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    // =========================
    // 3) REFRESH TOKEN COOKIE (fallback)
    // =========================
    if (!token && req.cookies?.refreshToken) {
        token = req.cookies.refreshToken;
    }

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        let decoded;

        // =========================
        // Try JWT_SECRET first
        // =========================
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // =========================
            // fallback: verify refresh secret
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        }

        const userId = decoded.id || decoded._id;

        req.user = await User.findById(userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized" });
    }
};

// =========================
// ADMIN ONLY
// =========================
const admin = (req, res, next) => {
    if (req.user?.isAdmin) return next();
    return res.status(403).json({ message: "Admin only" });
};

module.exports = { protect, admin };
