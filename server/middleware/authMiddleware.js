import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================
// PROTECT ROUTES (REQUIRES LOGIN)
// =========================
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1) Bearer token
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 2) Cookie token (access token only)
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token || token === "null" || token === "undefined") {
            return res.status(401).json({
                message: "Not authorized, no token",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                message: "Invalid or expired token",
            });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        // 🔥 IMPORTANT FIX:
        // alltid säkra id format för controllers
        req.user = {
            ...user.toObject(),
            id: user._id.toString(),
        };

        next();

    } catch (err) {
        console.error("AUTH ERROR:", err);
        return res.status(500).json({
            message: "Server error in auth middleware",
        });
    }
};

// =========================
// OPTIONAL AUTH (FOR GUEST-FRIENDLY ROUTES)
// =========================
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            req.user = null;
            return next();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            req.user = null;
            return next();
        }

        const user = await User.findById(decoded.id).select("-password");

        req.user = user
            ? {
                ...user.toObject(),
                id: user._id.toString(),
            }
            : null;

        next();

    } catch (err) {
        req.user = null;
        next();
    }
};

// =========================
// ADMIN ONLY
// =========================
export const admin = (req, res, next) => {
    if (req.user?.isAdmin) return next();

    return res.status(403).json({
        message: "Admin only",
    });
};

// =========================
// EMAIL VERIFIED GUARD (IMPORTANT FOR SHOP)
// =========================
export const requireVerified = (req, res, next) => {
    if (!req.user?.isVerified) {
        return res.status(403).json({
            message: "Please verify your email",
        });
    }
    next();
};