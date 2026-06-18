const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

// =======================
// PRODUCTS ROUTES
// =======================

// GET ALL + CREATE
router
    .route("/")
    .get(getProducts)
    .post(
        upload.array("images", 4),
        createProduct
    );

// GET ONE + UPDATE + DELETE
router
    .route("/:id")
    .get(getProductById)
    .put(
        upload.array("images", 4), // gamla + nya bilder hanteras i controllern
        updateProduct
    )
    .delete(deleteProduct);

module.exports = router;