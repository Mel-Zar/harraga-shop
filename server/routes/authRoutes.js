const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const rateLimiter = require("../middleware/rateLimiter");

// fallback om något saknas
const safeFn = (fn, name) => {
    if (typeof fn !== "function") {
        console.log(`❌ Missing: ${name}`);
        return (req, res) => {
            res.status(500).json({ message: `${name} is not a function` });
        };
    }
    return fn;
};

// =========================
// AUTH
// =========================
router.post(
    "/register",
    rateLimiter.registerLimiter || ((req, res, next) => next()),
    safeFn(controller.register, "register")
);

router.post(
    "/login",
    rateLimiter.loginLimiter || ((req, res, next) => next()),
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
    rateLimiter.forgotPasswordLimiter || ((req, res, next) => next()),
    safeFn(controller.forgotPassword, "forgotPassword")
);

router.post(
    "/reset-password/:token",
    rateLimiter.resetPasswordLimiter || ((req, res, next) => next()),
    safeFn(controller.resetPassword, "resetPassword")
);

// =========================
// EMAIL VERIFY
// =========================
router.get(
    "/verify-email/:userId/:token",
    rateLimiter.verifyEmailLimiter || ((req, res, next) => next()),
    safeFn(controller.verifyEmail, "verifyEmail")
);

router.post(
    "/resend-verify-email",
    rateLimiter.loginLimiter || ((req, res, next) => next()),
    safeFn(controller.resendVerifyEmail, "resendVerifyEmail")
);

module.exports = router;
