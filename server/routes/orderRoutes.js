import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderById,
} from "../controllers/orderController.js";

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

// =========================
// GET ALL ORDERS
// =========================
router.get("/", getAllOrders);

// =========================
// GET SINGLE ORDER
// =========================
router.get("/:id", getOrderById);

export default router;