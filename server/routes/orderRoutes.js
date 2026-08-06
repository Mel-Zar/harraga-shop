import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/orderController.js";

import {
    protect,
    admin,
    optionalAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// CREATE ORDER
// =========================
router.post(
    "/",
    optionalAuth,
    createOrder
);

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

// =========================
// UPDATE ORDER STATUS (ADMIN ONLY)
// =========================
router.patch(
    "/:id/status",
    protect,
    admin,
    updateOrderStatus
);

export default router;