const mongoose = require("mongoose");
const Product = require("../models/Product");

// Helper
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
        } = req.body;

        // HANDLE MULTER IMAGES (max 4)
        const images = req.files
            ? req.files.map(
                (file) =>
                    `/uploads/${file.filename}`
            )
            : [];

        const product = await Product.create({
            name,
            description,
            price,
            image: images[0] || "",
            images,
            category,
            stock,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create product",
        });
    }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({
            createdAt: -1,
        });

        res.status(200).json(products);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch products",
        });
    }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch product",
        });
    }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const updateData = {
            ...req.body,
        };

        if (req.files && req.files.length > 0) {
            const images = req.files.map(
                (file) =>
                    `/uploads/${file.filename}`
            );

            updateData.images = images;
            updateData.image = images[0];
        }

        const product =
            await Product.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update product",
        });
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const product =
            await Product.findByIdAndDelete(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            message:
                "Product deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete product",
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};