import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =====================================================
// 🔐 GET TOKEN
// =====================================================

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;

    // 1. AUTHORIZATION HEADER
    if (authHeader) {
        const parts = authHeader.trim().split(/\s+/);

        if (
            parts.length === 2 &&
            parts[0].toLowerCase() === "bearer" &&
            parts[1]
        ) {
            return parts[1].trim();
        }
    }

    // 2. COOKIE
    if (req.cookies?.token) {
        return req.cookies.token;
    }

    return null;
};

// =====================================================
// 🛡️ PROTECT ROUTES
// =====================================================

export const protect = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        // SAFE AUTH DEBUG: never log the token itself
        console.log("🔐 AUTH DEBUG:", {
            method: req.method,
            path: req.originalUrl,
            hasAuthorizationHeader: Boolean(
                req.headers.authorization
            ),
            hasCookieToken: Boolean(req.cookies?.token),
            hasToken: Boolean(token),
            jwtSecretConfigured: Boolean(
                process.env.JWT_SECRET
            ),
        });

        // NO TOKEN
        if (
            !token ||
            token === "null" ||
            token === "undefined"
        ) {
            return res.status(401).json({
                message: "Not authorized, no token",
            });
        }

        // VERIFY JWT
        let decoded;

        try {
            if (!process.env.JWT_SECRET) {
                console.error(
                    "❌ JWT_SECRET is missing from backend environment"
                );

                return res.status(500).json({
                    message:
                        "Authentication configuration error",
                });
            }

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            console.error("❌ JWT VERIFY ERROR:", {
                name: error.name,
                message: error.message,
            });

            return res.status(401).json({
                message:
                    error.name === "TokenExpiredError"
                        ? "Token expired. Please log in again."
                        : "Invalid authentication token",
            });
        }

        // CHECK PAYLOAD
        // Accept the existing "id" claim and the common "_id" claim.
        const userId = decoded?.id || decoded?._id;

        if (!userId) {
            console.error(
                "❌ JWT payload does not contain id or _id"
            );

            return res.status(401).json({
                message:
                    "Invalid authentication token: user ID missing",
            });
        }

        console.log("✅ JWT VERIFIED:", {
            hasUserId: true,
            expiresAt: decoded.exp
                ? new Date(
                    decoded.exp * 1000
                ).toISOString()
                : null,
        });

        // GET USER
        const user = await User.findById(
            userId
        ).select("-password");

        if (!user) {
            console.error(
                "❌ AUTH USER NOT FOUND for verified JWT"
            );

            return res.status(401).json({
                message: "User not found",
            });
        }

        // ATTACH USER TO REQUEST
        req.user = {
            ...user.toObject(),
            id: user._id.toString(),
        };

        next();
    } catch (error) {
        console.error("❌ AUTH MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            message: "Server error in auth middleware",
        });
    }
};

// =====================================================
// 🌍 OPTIONAL AUTH
// =====================================================

export const optionalAuth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (
            !token ||
            token === "null" ||
            token === "undefined"
        ) {
            req.user = null;
            return next();
        }

        let decoded;

        try {
            if (!process.env.JWT_SECRET) {
                req.user = null;
                return next();
            }

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            console.warn(
                "⚠️ OPTIONAL AUTH TOKEN INVALID:",
                error.message
            );

            req.user = null;
            return next();
        }

        const userId = decoded?.id || decoded?._id;

        if (!userId) {
            req.user = null;
            return next();
        }

        const user = await User.findById(
            userId
        ).select("-password");

        req.user = user
            ? {
                ...user.toObject(),
                id: user._id.toString(),
            }
            : null;

        next();
    } catch (error) {
        console.error(
            "❌ OPTIONAL AUTH ERROR:",
            error
        );

        req.user = null;
        next();
    }
};

// =====================================================
// 👑 ADMIN ONLY
// =====================================================

export const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Not authenticated",
        });
    }

    if (req.user.isAdmin !== true) {
        return res.status(403).json({
            message: "Admin access required",
        });
    }

    next();
};

// =====================================================
// ✉️ EMAIL VERIFIED GUARD
// =====================================================

export const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Not authenticated",
        });
    }

    if (req.user.isVerified !== true) {
        return res.status(403).json({
            message: "Please verify your email",
        });
    }

    next();
};
