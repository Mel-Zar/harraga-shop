const rateLimit = require("express-rate-limit");

// =========================
// REGISTER LIMITER
// =========================
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many register attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// LOGIN LIMITER
// =========================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Too many login attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// FORGOT PASSWORD LIMITER
// =========================
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many password reset attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// RESET PASSWORD LIMITER
// =========================
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many reset password attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================
// VERIFY EMAIL LIMITER
// =========================
const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
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
    resetPasswordLimiter,
    verifyEmailLimiter
};
