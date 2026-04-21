const express = require("express");
const router = express.Router();

const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerifyEmail
} = require("../controllers/authController");

// ✅ RATE LIMITERS
const {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    verifyEmailLimiter,
    resetPasswordLimiter // ✅ NY
} = require("../middleware/rateLimiter");

// AUTH
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

// PASSWORD RESET
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

// EMAIL VERIFY
router.get("/verify-email/:userId/:token", verifyEmailLimiter, verifyEmail);

// 🔁 RESEND VERIFY EMAIL
router.post("/resend-verify-email", loginLimiter, resendVerifyEmail);

module.exports = router;
