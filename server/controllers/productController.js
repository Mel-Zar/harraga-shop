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

        const images = req.files
            ? req.files
                .slice(0, 4)
                .map(
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

        const product = await Product.findById(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        product.name =
            req.body.name ??
            product.name;

        product.description =
            req.body.description ??
            product.description;

        product.price =
            req.body.price ??
            product.price;

        product.category =
            req.body.category ??
            product.category;

        product.stock =
            req.body.stock ??
            product.stock;

        // Ta bort specifika bilder
        if (req.body.removedImages) {
            let removedImages =
                req.body.removedImages;

            if (
                typeof removedImages ===
                "string"
            ) {
                try {
                    removedImages =
                        JSON.parse(
                            removedImages
                        );
                } catch {
                    removedImages = [];
                }
            }

            product.images =
                product.images.filter(
                    (img) =>
                        !removedImages.includes(
                            img
                        )
                );
        }

        // Lägg till nya bilder
        if (
            req.files &&
            req.files.length > 0
        ) {
            const newImages =
                req.files.map(
                    (file) =>
                        `/uploads/${file.filename}`
                );

            product.images = [
                ...product.images,
                ...newImages,
            ].slice(0, 4);
        }

        // Uppdatera huvudbild
        product.image =
            product.images[0] || "";

        await product.save();

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