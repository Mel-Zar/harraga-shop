import express from "express";

import {
    createOrder,
    getAllOrders,
    getOrderById,
    getMyOrders,
    getMyOrderById,
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
// GUEST + CUSTOMER
// =========================
router.post(
    "/",
    optionalAuth,
    createOrder
);


// =========================
// GET MY ORDERS
// CUSTOMER ONLY
// =========================
router.get(
    "/my-orders",
    protect,
    getMyOrders
);


// =========================
// GET MY SINGLE ORDER
// CUSTOMER ONLY
// =========================
router.get(
    "/my-orders/:id",
    protect,
    getMyOrderById
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
// GET SINGLE ORDER
// ADMIN ONLY
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