import express from "express";

import {
    protect,
    admin,
} from "../middleware/authMiddleware.js";

import {
    getProfile,
    updateProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/userController.js";

import {
    getAddresses,
    addAddress,
    deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

// =====================================================
// 👤 CURRENT USER PROFILE
// IMPORTANT:
// /me MUST COME BEFORE /:id
// =====================================================

// GET /api/users/me
router.get(
    "/me",
    protect,
    getProfile
);

// PUT /api/users/me
router.put(
    "/me",
    protect,
    updateProfile
);

// =====================================================
// 📍 CURRENT USER ADDRESSES
// =====================================================

// GET /api/users/me/addresses
router.get(
    "/me/addresses",
    protect,
    getAddresses
);

// POST /api/users/me/addresses
router.post(
    "/me/addresses",
    protect,
    addAddress
);

// DELETE /api/users/me/addresses/:id
router.delete(
    "/me/addresses/:id",
    protect,
    deleteAddress
);

// =====================================================
// 👑 ADMIN USERS
// =====================================================

// GET /api/users
router.get(
    "/",
    protect,
    admin,
    getUsers
);

// GET /api/users/:id
router.get(
    "/:id",
    protect,
    admin,
    getUserById
);

// PUT /api/users/:id
router.put(
    "/:id",
    protect,
    admin,
    updateUser
);

// DELETE /api/users/:id
router.delete(
    "/:id",
    protect,
    admin,
    deleteUser
);

export default router;