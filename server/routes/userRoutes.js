const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// =========================
// GET PROFILE
// =========================
router.get("/me", protect, (req, res) => {
    res.json(req.user);
});

// =========================
// UPDATE PROFILE
// =========================
router.put("/me", protect, (req, res) => {
    res.json({ message: "update user here" });
});

module.exports = router;
