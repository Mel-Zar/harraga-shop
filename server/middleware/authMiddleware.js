const rateLimit = require("express-rate-limit");

// =========================
// REGISTER LIMITER
// =========================
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many register attempts. Try again later." }
});

// =========================
// LOGIN LIMITER
// =========================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many login attempts. Try again later." }
});

// =========================
// FORGOT PASSWORD LIMITER
// =========================
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many reset requests. Try again later." }
});

// =========================
// RESET PASSWORD LIMITER (NY)
// =========================
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many password reset attempts. Try again later." }
});

// =========================
// VERIFY EMAIL LIMITER
// =========================
const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many verification attempts. Try again later." }
});

module.exports = {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    verifyEmailLimiter
};
