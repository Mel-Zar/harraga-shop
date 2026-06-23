import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================
// PROTECT ROUTES (GUEST SAFE)
// =========================
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1) Bearer token
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 2) cookie token
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        // 3) refresh token fallback
        if (!token && req.cookies?.refreshToken) {
            token = req.cookies.refreshToken;
        }

        // 🔥 IMPORTANT: ALLOW GUESTS
        if (!token || token === "null" || token === "undefined") {
            req.user = null;
            return next();
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            try {
                decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            } catch (e) {
                req.user = null;
                return next();
            }
        }

        const user = await User.findById(decoded?.id || decoded?._id);

        req.user = user || null;

        return next();

    } catch (err) {
        console.error("AUTH ERROR:", err);
        req.user = null;
        return next();
    }
};

// =========================
// ADMIN ONLY
// =========================
export const admin = (req, res, next) => {
    if (req.user?.isAdmin) return next();
    return res.status(403).json({ message: "Admin only" });
};