
import express from "express";
import * as controller from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { verifyTwoFactorToken } from "../middleware/twoFactorMiddleware.js";

import {
    registerLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    verifyEmailLimiter,
} from "../middleware/rateLimiter.js";

import {
    setupTwoFactor,
    enableTwoFactor,
    verifyTwoFactorLogin,
    disableTwoFactor,
} from "../controllers/twoFactorController.js";

// =====================================================
// ROUTER CONFIGURATION
// =====================================================

const router = express.Router();

// =====================================================
// REGISTRATION
// =====================================================

// Kontrollera användarnamn och e-post innan CAPTCHA
router.post(
    "/check-availability",
    registerLimiter,
    controller.checkRegistrationAvailability
);

// Slutför registrering efter CAPTCHA
router.post(
    "/register",
    registerLimiter,
    controller.register
);

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginLimiter,
    controller.login
);

// =====================================================
// JWT TOKEN MANAGEMENT
// =====================================================

router.post(
    "/refresh",
    controller.refreshToken
);

router.post(
    "/logout",
    controller.logout
);

// =====================================================
// PASSWORD RESET
// =====================================================

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

// =====================================================
// EMAIL VERIFICATION
// =====================================================

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

// =====================================================
// TWO-FACTOR AUTHENTICATION (2FA)
// =====================================================

// Kund: konfigurera 2FA
// Administratör: konfigurera 2FA med tillfällig token

router.post(
    "/2fa/setup",
    protect,
    setupTwoFactor
);

router.post(
    "/2fa/enroll-setup",
    verifyTwoFactorToken("2fa-enroll"),
    setupTwoFactor
);

// =====================================================
// ENABLE TWO-FACTOR AUTHENTICATION
// =====================================================

// Kund: aktivera 2FA
// Administratör: aktivera 2FA med tillfällig token

router.post(
    "/2fa/enable",
    protect,
    enableTwoFactor
);

router.post(
    "/2fa/enroll-enable",
    verifyTwoFactorToken("2fa-enroll"),
    enableTwoFactor
);

// =====================================================
// TWO-FACTOR LOGIN VERIFICATION
// =====================================================

router.post(
    "/2fa/login-verify",
    verifyTwoFactorToken("2fa-login"),
    verifyTwoFactorLogin
);

// =====================================================
// DISABLE TWO-FACTOR AUTHENTICATION
// =====================================================

router.post(
    "/2fa/disable",
    protect,
    disableTwoFactor
);

// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;
