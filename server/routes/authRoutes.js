const express = require("express");
const router = express.Router();

const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require("../controllers/authController");

// ✅ RATE LIMITERS
const {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    verifyEmailLimiter
} = require("../middleware/rateLimiter");

// AUTH
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

// PASSWORD RESET
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// EMAIL VERIFY
router.get("/verify-email/:userId/:token", verifyEmailLimiter, verifyEmail);

module.exports = router;
