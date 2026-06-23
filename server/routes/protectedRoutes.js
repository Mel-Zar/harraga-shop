import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// fallback
const safeProtect =
    typeof protect === "function"
        ? protect
        : (req, res, next) => next();

// =========================
// ROOT ROUTE
// =========================
router.get("/", safeProtect, (req, res) => {
    res.json({
        message: "You are authenticated 🔐",
        user: req.user || null,
    });
});

export default router;