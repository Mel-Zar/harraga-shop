const rateLimit = require("express-rate-limit");

// =========================
// 🔥 REGISTER LIMITER (STRICT)
// =========================
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // max 5 register requests per IP
    message: {
        message: "Too many register attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// 🔥 LOGIN LIMITER
// =========================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // max 10 login attempts per IP
    message: {
        message: "Too many login attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// 🔥 FORGOT PASSWORD LIMITER
// =========================
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // max 5 requests
    message: {
        message: "Too many password reset attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// 🔥 VERIFY EMAIL LIMITER
// =========================
const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20, // max 20 verify attempts per IP
    message: {
        message: "Too many verification attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    verifyEmailLimiter
};
