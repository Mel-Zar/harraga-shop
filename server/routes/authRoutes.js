const express = require("express");
const router = express.Router();

const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require("../controllers/authController");

// AUTH
router.post("/register", register);
router.post("/login", login);

// PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// EMAIL VERIFY
router.get("/verify-email/:userId/:token", verifyEmail);

module.exports = router;
