import express from "express";
import upload from "../middleware/upload.js";
import {
    protect,
    admin,
} from "../middleware/authMiddleware.js";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// =======================
// PRODUCTS ROUTES
// =======================

// GET ALL + CREATE
router
    .route("/")
    .get(getProducts)
    .post(
        protect,
        admin,
        upload.array("images", 4),
        createProduct
    );

// GET ONE + UPDATE + DELETE
router
    .route("/:id")
    .get(getProductById)
    .put(
        protect,
        admin,
        upload.array("images", 4),
        updateProduct
    )
    .delete(
        protect,
        admin,
        deleteProduct
    );

export default router;