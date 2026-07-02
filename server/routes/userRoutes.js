import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
} from "../controllers/userController.js";

import {
    getAddresses,
    addAddress,
    deleteAddress
} from "../controllers/addressController.js";

const router = express.Router();

// =========================
// PROFILE
// =========================
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

// =========================
// ADDRESSES (USER BASED)
// =========================
router.get("/me/addresses", protect, getAddresses);
router.post("/me/addresses", protect, addAddress);
router.delete("/me/addresses/:id", protect, deleteAddress);

export default router;