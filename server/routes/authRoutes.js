const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const rateLimiter = require("../middleware/rateLimiter");

// fallback om något saknas (för debug)
const safeFn = (fn, name) => {
    if (typeof fn !== "function") {
        console.log(`❌ Missing: ${name}`);
        return (req, res) => {
            res.status(500).json({ message: `${name} is not a function` });
        };
    }
    return fn;
};

// extra safety check (syns i console direkt om något är fel)
if (!rateLimiter) {
    console.error("❌ rateLimiter middleware not found!");
}

// =========================
// AUTH
// =========================
router.post(
    "/register",
    rateLimiter.registerLimiter,
    safeFn(controller.register, "register")
);

router.post(
    "/login",
    rateLimiter.loginLimiter,
    safeFn(controller.login, "login")
);

// =========================
// JWT FLOW
// =========================
router.post("/refresh", safeFn(controller.refreshToken, "refreshToken"));
router.post("/logout", safeFn(controller.logout, "logout"));

// =========================
// PASSWORD RESET
// =========================
router.post(
    "/forgot-password",
    rateLimiter.forgotPasswordLimiter,
    safeFn(controller.forgotPassword, "forgotPassword")
);

router.post(
    "/reset-password/:token",
    rateLimiter.resetPasswordLimiter,
    safeFn(controller.resetPassword, "resetPassword")
);

// =========================
// EMAIL VERIFY
// =========================
router.get(
    "/verify-email/:userId/:token",
    rateLimiter.verifyEmailLimiter,
    safeFn(controller.verifyEmail, "verifyEmail")
);

router.post(
    "/resend-verify-email",
    rateLimiter.verifyEmailLimiter,
    safeFn(controller.resendVerifyEmail, "resendVerifyEmail")
);

module.exports = router;