import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;