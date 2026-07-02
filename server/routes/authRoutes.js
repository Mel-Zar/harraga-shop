import express from "express";
import * as controller from "../controllers/authController.js";

import {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    verifyEmailLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// =========================
// AUTH
// =========================
router.post(
    "/register",
    registerLimiter,
    controller.register
);

router.post(
    "/login",
    loginLimiter,
    controller.login
);

// =========================
// JWT FLOW
// =========================
router.post(
    "/refresh",
    controller.refreshToken
);

router.post(
    "/logout",
    controller.logout
);

// =========================
// PASSWORD RESET
// =========================
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    controller.forgotPassword
);

router.post(
    "/reset-password/:token",
    resetPasswordLimiter,
    controller.resetPassword
);

// =========================
// EMAIL VERIFY
// =========================
router.get(
    "/verify-email/:userId/:token",
    verifyEmailLimiter,
    controller.verifyEmail
);

router.post(
    "/resend-verify-email",
    verifyEmailLimiter,
    controller.resendVerifyEmail
);

export default router;