import mongoose from "mongoose";
import Product from "../models/Product.js";

// =========================
// HELPER
// =========================
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// =========================
// CREATE PRODUCT
// =========================
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
        } = req.body;

        const images = req.files?.length
            ? req.files
                .slice(0, 4)
                .map(
                    (file) =>
                        `/uploads/${file.filename}`
                )
            : [];

        const product = await Product.create({
            name: name?.trim(),
            description: description?.trim(),
            price: Number(price),
            category: category?.trim(),
            stock: Number(stock),
            image: images[0] || "",
            images,
        });

        return res.status(201).json(product);

    } catch (error) {

        console.error("CREATE PRODUCT ERROR:", error);

        return res.status(500).json({
            message: "Failed to create product",
        });

    }
};

// =========================
// GET ALL PRODUCTS
// =========================
export const getProducts = async (req, res) => {
    try {

        const products = await Product.find()
            .select("-__v")
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.status(200).json(products);

    } catch (error) {

        console.error("GET PRODUCTS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch products",
        });

    }
};

// =========================
// GET SINGLE PRODUCT
// =========================
export const getProductById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(id)
            .select("-__v")
            .lean();

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json(product);

    } catch (error) {

        console.error("GET PRODUCT ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch product",
        });

    }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        product.name =
            req.body.name?.trim() ?? product.name;

        product.description =
            req.body.description?.trim() ??
            product.description;

        product.price =
            req.body.price !== undefined
                ? Number(req.body.price)
                : product.price;

        product.category =
            req.body.category?.trim() ??
            product.category;

        product.stock =
            req.body.stock !== undefined
                ? Number(req.body.stock)
                : product.stock;

        // =========================
        // REMOVE IMAGES
        // =========================
        if (req.body.removedImages) {

            let removedImages =
                req.body.removedImages;

            if (typeof removedImages === "string") {

                try {

                    removedImages =
                        JSON.parse(removedImages);

                } catch {

                    removedImages = [];

                }

            }

            product.images =
                product.images.filter(
                    (img) =>
                        !removedImages.includes(img)
                );

        }

        // =========================
        // ADD NEW IMAGES
        // =========================
        if (req.files?.length > 0) {

            const newImages = req.files.map(
                (file) =>
                    `/uploads/${file.filename}`
            );

            product.images = [
                ...product.images,
                ...newImages,
            ].slice(0, 4);

        }

        // =========================
        // MAIN IMAGE
        // =========================
        product.image =
            product.images[0] || "";

        await product.save();

        return res.status(200).json(product);

    } catch (error) {

        console.error("UPDATE PRODUCT ERROR:", error);

        return res.status(500).json({
            message: "Failed to update product",
        });

    }
};

// =========================
// DELETE PRODUCT
// =========================
export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const product =
            await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message:
                "Product deleted successfully",
        });

    } catch (error) {

        console.error("DELETE PRODUCT ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete product",
        });

    }
};