import express from "express";

import upload from "../middleware/upload.js";

import {

    protect,

    admin,

} from "../middleware/authMiddleware.js";

import {

    createProduct,

    getProducts,

    getProductCategories,

    getProductById,

    updateProduct,

    deleteProduct,

} from "../controllers/productController.js";

const router =

    express.Router();

// =====================================

// PRODUCTS

// =====================================

// GET    /api/products

// POST   /api/products

router

    .route("/")

    .get(getProducts)

    .post(

        protect,

        admin,

        upload.array("images", 4),

        createProduct

    );

// =====================================

// PRODUCT CATEGORIES

// =====================================

// GET    /api/products/categories

router

    .route("/categories")

    .get(

        getProductCategories

    );

// =====================================

// SINGLE PRODUCT

// =====================================

// GET    /api/products/:id

// PUT    /api/products/:id

// DELETE /api/products/:id

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