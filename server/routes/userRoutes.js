const express = require("express");
const router = express.Router();

// import middleware
const { protect, admin } = require("../middleware/authMiddleware");

// =========================
// 🔐 PROTECTED ROUTE
// =========================
// Requires valid JWT token
router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user,
    });
});

// =========================
// 👤 USER PROFILE (REAL APP 🔥)
// =========================
// Example: get logged-in user data
router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

// =========================
// 👑 ADMIN ROUTE
// =========================
// Only admins can access
router.get("/admin", protect, admin, (req, res) => {
    res.json({
        message: "Welcome Admin 👑",
        user: req.user,
    });
});

module.exports = router;
