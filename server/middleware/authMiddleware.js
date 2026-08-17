import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =====================================================
// 🔐 GET TOKEN
// =====================================================

const getTokenFromRequest = (
    req
) => {

    // =============================================
    // 1. AUTHORIZATION HEADER
    // =============================================

    const authHeader =
        req.headers.authorization;

    if (
        authHeader &&
        authHeader.startsWith(
            "Bearer "
        )
    ) {
        const token =
            authHeader
                .split(" ")[1]
                ?.trim();

        if (token) {
            return token;
        }
    }

    // =============================================
    // 2. COOKIE
    // =============================================

    if (req.cookies?.token) {
        return req.cookies.token;
    }

    return null;
};

// =====================================================
// 🛡️ PROTECT ROUTES
// =====================================================

export const protect = async (
    req,
    res,
    next
) => {

    try {

        const token =
            getTokenFromRequest(req);

        // =============================================
        // NO TOKEN
        // =============================================

        if (
            !token ||
            token === "null" ||
            token === "undefined"
        ) {
            return res.status(401).json({
                message:
                    "Not authorized, no token",
            });
        }

        // =============================================
        // VERIFY JWT
        // =============================================

        let decoded;

        try {

            decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

        } catch (error) {

            console.error(
                "JWT VERIFY ERROR:",
                error.message
            );

            return res.status(401).json({
                message:
                    "Invalid or expired token",
            });
        }

        // =============================================
        // CHECK PAYLOAD
        // =============================================

        if (!decoded?.id) {
            return res.status(401).json({
                message:
                    "Invalid authentication token",
            });
        }

        // =============================================
        // GET USER
        // =============================================

        const user =
            await User.findById(
                decoded.id
            ).select("-password");

        if (!user) {
            return res.status(401).json({
                message:
                    "User not found",
            });
        }

        // =============================================
        // ATTACH USER TO REQUEST
        // =============================================

        req.user = {
            ...user.toObject(),

            id: user._id.toString(),
        };

        next();

    } catch (error) {

        console.error(
            "AUTH ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Server error in auth middleware",
        });
    }
};

// =====================================================
// 🌍 OPTIONAL AUTH
// =====================================================

export const optionalAuth = async (
    req,
    res,
    next
) => {

    try {

        const token =
            getTokenFromRequest(req);

        if (!token) {
            req.user = null;
            return next();
        }

        let decoded;

        try {

            decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

        } catch {
            req.user = null;
            return next();
        }

        if (!decoded?.id) {
            req.user = null;
            return next();
        }

        const user =
            await User.findById(
                decoded.id
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
            "OPTIONAL AUTH ERROR:",
            error
        );

        req.user = null;

        next();
    }
};

// =====================================================
// 👑 ADMIN ONLY
// =====================================================

export const admin = (
    req,
    res,
    next
) => {

    if (!req.user) {
        return res.status(401).json({
            message:
                "Not authenticated",
        });
    }

    if (
        req.user.isAdmin !== true
    ) {
        return res.status(403).json({
            message:
                "Admin access required",
        });
    }

    next();
};

// =====================================================
// ✉️ EMAIL VERIFIED GUARD
// =====================================================

export const requireVerified = (
    req,
    res,
    next
) => {

    if (!req.user) {
        return res.status(401).json({
            message:
                "Not authenticated",
        });
    }

    if (
        req.user.isVerified !== true
    ) {
        return res.status(403).json({
            message:
                "Please verify your email",
        });
    }

    next();
};