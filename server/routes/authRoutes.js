import express from "express";

import * as controller from "../controllers/authController.js";

// 🔥 FIX: import named exports korrekt
import {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    verifyEmailLimiter
} from "../middleware/rateLimiter.js";

const router = express.Router();

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

// =========================
// AUTH
// =========================
router.post(
    "/register",
    registerLimiter,
    safeFn(controller.register, "register")
);

router.post(
    "/login",
    loginLimiter,
    safeFn(controller.login, "login")
);

// =========================
// JWT FLOW
// =========================
router.post(
    "/refresh",
    safeFn(controller.refreshToken, "refreshToken")
);

router.post(
    "/logout",
    safeFn(controller.logout, "logout")
);

// =========================
// PASSWORD RESET
// =========================
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    safeFn(controller.forgotPassword, "forgotPassword")
);

router.post(
    "/reset-password/:token",
    resetPasswordLimiter,
    safeFn(controller.resetPassword, "resetPassword")
);

// =========================
// EMAIL VERIFY
// =========================
router.get(
    "/verify-email/:userId/:token",
    verifyEmailLimiter,
    safeFn(controller.verifyEmail, "verifyEmail")
);

router.post(
    "/resend-verify-email",
    verifyEmailLimiter,
    safeFn(controller.resendVerifyEmail, "resendVerifyEmail")
);

export default router;