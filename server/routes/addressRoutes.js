import express from "express";

import {
    searchAddress,
    addAddress,
    getAddresses,
    setDefaultAddress,
    deleteAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// GOOGLE ADDRESS SEARCH
// =========================

router.get(
    "/search",
    searchAddress
);

// =========================
// SAVED ADDRESSES
// =========================

router.get(
    "/",
    protect,
    getAddresses
);

router.post(
    "/",
    protect,
    addAddress
);

// =========================
// SET PRIMARY ADDRESS
// =========================

router.put(
    "/:id/default",
    protect,
    setDefaultAddress
);

// =========================
// DELETE ADDRESS
// =========================

router.delete(
    "/:id",
    protect,
    deleteAddress
);

export default router;