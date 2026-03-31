const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// =========================
// 🔐 PROTECTED ROUTE
// =========================
router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user,
    });
});

module.exports = router;
