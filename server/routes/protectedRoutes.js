const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

// fallback
const safeProtect = typeof protect === "function"
    ? protect
    : (req, res, next) => next();

// 👇 FIX: root route "/"
router.get("/", safeProtect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user || null,
    });
});

module.exports = router;
