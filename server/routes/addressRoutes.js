import express from "express";
import { searchAddress } from "../controllers/addressController.js";

const router = express.Router();

// =========================
// ADDRESS ROUTES
// =========================
router.get("/search", searchAddress);

export default router;