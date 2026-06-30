import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderById,
} from "../controllers/orderController.js";

import {
    protect,
    admin,
} from "../middleware/authMiddleware.js";

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
// GET ALL ORDERS (ADMIN ONLY)
// =========================
router.get(
    "/",
    protect,
    admin,
    getAllOrders
);

// =========================
// GET SINGLE ORDER (ADMIN ONLY)
// =========================
router.get(
    "/:id",
    protect,
    admin,
    getOrderById
);

export default router;