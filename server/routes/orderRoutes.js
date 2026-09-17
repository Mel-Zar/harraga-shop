import express from "express";

import {

    createOrder,

    getAllOrders,

    getOrderById,

    getMyOrders,

    getMyOrderById,

    updateOrderStatus,

    cancelMyOrder,

    createPayment,

    getPaymentStatus,

} from "../controllers/orderController.js";

import {

    protect,

    admin,

    optionalAuth,

} from "../middleware/authMiddleware.js";


const router =
    express.Router();


// =====================================================
// CREATE ORDER
// =====================================================
// GUEST + CUSTOMER
// =====================================================

router.post(
    "/",
    optionalAuth,
    createOrder
);


// =====================================================
// CREATE PAYMENT
// =====================================================
// GUEST + CUSTOMER
// =====================================================

router.post(
    "/:id/payment",
    optionalAuth,
    createPayment
);


// =====================================================
// GET PAYMENT STATUS
// =====================================================

router.get(
    "/:id/payment-status",
    optionalAuth,
    getPaymentStatus
);


// =====================================================
// GET MY ORDERS
// =====================================================

router.get(
    "/my-orders",
    protect,
    getMyOrders
);


// =====================================================
// GET MY SINGLE ORDER
// =====================================================

router.get(
    "/my-orders/:id",
    protect,
    getMyOrderById
);


// =====================================================
// CANCEL MY ORDER
// =====================================================

router.patch(
    "/my-orders/:id/cancel",
    protect,
    cancelMyOrder
);


// =====================================================
// GET ALL ORDERS
// ADMIN ONLY
// =====================================================

router.get(
    "/",
    protect,
    admin,
    getAllOrders
);


// =====================================================
// GET SINGLE ORDER
// ADMIN ONLY
// =====================================================

router.get(
    "/:id",
    protect,
    admin,
    getOrderById
);


// =====================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// =====================================================

router.patch(
    "/:id/status",
    protect,
    admin,
    updateOrderStatus
);


export default router;