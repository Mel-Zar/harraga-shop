import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// OPTIONAL PROTECT (NO CRASH)
// =========================
const optionalProtect = (req, res, next) => {
    protect(req, res, () => {
        return next();
    });
};

// =========================
// CREATE ORDER
// =========================
router.post("/", optionalProtect, createOrder);

export default router;