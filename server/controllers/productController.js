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

export const createProduct = async (
    req,
    res
) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
        } = req.body;

        // =========================
        // VALIDATE REQUIRED FIELDS
        // =========================

        if (
            !name?.trim() ||
            !description?.trim() ||
            !category?.trim()
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Name, description and category are required.",
                });
        }

        // =========================
        // VALIDATE PRICE
        // =========================

        const parsedPrice =
            Number(price);

        if (
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(
                parsedPrice
            ) ||
            parsedPrice < 0
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Price must be a valid number greater than or equal to 0.",
                });
        }

        // =========================
        // VALIDATE STOCK
        // =========================

        const parsedStock =
            Number(stock);

        if (
            stock !== undefined &&
            stock !== null &&
            stock !== "" &&
            (
                !Number.isFinite(
                    parsedStock
                ) ||
                parsedStock < 0 ||
                !Number.isInteger(
                    parsedStock
                )
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Stock must be a whole number greater than or equal to 0.",
                });
        }

        // =========================
        // IMAGES
        // =========================

        const images =
            req.files?.length
                ? req.files
                    .slice(0, 4)
                    .map(
                        (file) =>
                            `/uploads/${file.filename}`
                    )
                : [];

        // =========================
        // CREATE PRODUCT
        // =========================

        const product =
            await Product.create({
                name:
                    name.trim(),

                description:
                    description.trim(),

                price:
                    parsedPrice,

                category:
                    category.trim(),

                stock:
                    stock === undefined ||
                        stock === null ||
                        stock === ""
                        ? 0
                        : parsedStock,

                image:
                    images[0] || "",

                images,
            });

        return res
            .status(201)
            .json(product);

    } catch (error) {
        console.error(
            "CREATE PRODUCT ERROR:",
            error
        );

        // =========================
        // MONGOOSE VALIDATION ERROR
        // =========================

        if (
            error.name ===
            "ValidationError"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        Object.values(
                            error.errors
                        )
                            .map(
                                (err) =>
                                    err.message
                            )
                            .join(", "),
                });
        }

        return res
            .status(500)
            .json({
                message:
                    "Failed to create product",
            });
    }
};

// =========================
// GET ALL PRODUCTS
// =========================

export const getProducts = async (
    req,
    res
) => {
    try {

        // =========================
        // SEARCH
        // =========================

        const {
            search,
            category,
            sort,
        } = req.query;

        const filter = {};

        if (
            search &&
            search.trim()
        ) {
            const escapedSearch =
                search
                    .trim()
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

            filter.$or = [
                {
                    name: {
                        $regex:
                            escapedSearch,
                        $options:
                            "i",
                    },
                },
                {
                    description: {
                        $regex:
                            escapedSearch,
                        $options:
                            "i",
                    },
                },
            ];
        }

        // =========================
        // CATEGORY FILTER
        // =========================

        if (
            category &&
            category.trim()
        ) {
            filter.category =
                category.trim();
        }

        // =========================
        // SORT
        // =========================

        let sortOption = {
            createdAt: -1,
        };

        switch (sort) {

            case "price_asc":
                sortOption = {
                    price: 1,
                };
                break;

            case "price_desc":
                sortOption = {
                    price: -1,
                };
                break;

            case "name_asc":
                sortOption = {
                    name: 1,
                };
                break;

            case "name_desc":
                sortOption = {
                    name: -1,
                };
                break;

            case "newest":
                sortOption = {
                    createdAt: -1,
                };
                break;

            case "oldest":
                sortOption = {
                    createdAt: 1,
                };
                break;

            default:
                sortOption = {
                    createdAt: -1,
                };
                break;
        }

        // =========================
        // GET PRODUCTS
        // =========================

        const products =
            await Product.find(
                filter
            )
                .select("-__v")
                .sort(
                    sortOption
                )
                .lean();

        return res
            .status(200)
            .json(products);

    } catch (error) {
        console.error(
            "GET PRODUCTS ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Failed to fetch products",
            });
    }
};

// =========================
// GET PRODUCT CATEGORIES
// =========================

export const getProductCategories = async (
    req,
    res
) => {
    try {
        const categories =
            await Product.distinct(
                "category"
            );

        const sortedCategories =
            categories
                .filter(
                    (category) =>
                        typeof category ===
                        "string" &&
                        category.trim() !== ""
                )
                .map(
                    (category) =>
                        category.trim()
                )
                .filter(
                    (
                        category,
                        index,
                        array
                    ) =>
                        array.indexOf(
                            category
                        ) === index
                )
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            undefined,
                            {
                                sensitivity:
                                    "base",
                            }
                        )
                );

        return res
            .status(200)
            .json(
                sortedCategories
            );

    } catch (error) {
        console.error(
            "GET PRODUCT CATEGORIES ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Failed to fetch product categories",
            });
    }
};

// =========================
// GET SINGLE PRODUCT
// =========================

export const getProductById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // =========================
        // VALIDATE PRODUCT ID
        // =========================

        if (
            !isValidObjectId(id)
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid product ID",
                });
        }

        // =========================
        // GET PRODUCT
        // =========================

        const product =
            await Product.findById(
                id
            )
                .select("-__v")
                .lean();

        // =========================
        // PRODUCT NOT FOUND
        // =========================

        if (!product) {
            return res
                .status(404)
                .json({
                    message:
                        "Product not found",
                });
        }

        // =========================
        // SUCCESS
        // =========================

        return res
            .status(200)
            .json(product);

    } catch (error) {
        console.error(
            "GET PRODUCT ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Failed to fetch product",
            });
    }
};

// =========================
// UPDATE PRODUCT
// =========================

export const updateProduct = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // =========================
        // VALIDATE PRODUCT ID
        // =========================

        if (
            !isValidObjectId(id)
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid product ID",
                });
        }

        // =========================
        // FIND PRODUCT
        // =========================

        const product =
            await Product.findById(id);

        if (!product) {
            return res
                .status(404)
                .json({
                    message:
                        "Product not found",
                });
        }

        // =========================
        // VALIDATE NAME
        // =========================

        if (
            req.body.name !==
            undefined &&
            !req.body.name?.trim()
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Product name cannot be empty.",
                });
        }

        // =========================
        // VALIDATE DESCRIPTION
        // =========================

        if (
            req.body.description !==
            undefined &&
            !req.body.description?.trim()
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Product description cannot be empty.",
                });
        }

        // =========================
        // VALIDATE CATEGORY
        // =========================

        if (
            req.body.category !==
            undefined &&
            !req.body.category?.trim()
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Product category cannot be empty.",
                });
        }

        // =========================
        // VALIDATE PRICE
        // =========================

        if (
            req.body.price !==
            undefined
        ) {
            const parsedPrice =
                Number(
                    req.body.price
                );

            if (
                req.body.price ===
                "" ||
                !Number.isFinite(
                    parsedPrice
                ) ||
                parsedPrice < 0
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Price must be a valid number greater than or equal to 0.",
                    });
            }
        }

        // =========================
        // VALIDATE STOCK
        // =========================

        if (
            req.body.stock !==
            undefined
        ) {
            const parsedStock =
                Number(
                    req.body.stock
                );

            if (
                req.body.stock ===
                "" ||
                !Number.isFinite(
                    parsedStock
                ) ||
                parsedStock < 0 ||
                !Number.isInteger(
                    parsedStock
                )
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Stock must be a whole number greater than or equal to 0.",
                    });
            }
        }

        // =========================
        // BASIC INFORMATION
        // =========================

        product.name =
            req.body.name?.trim() ??
            product.name;

        product.description =
            req.body.description?.trim() ??
            product.description;

        product.price =
            req.body.price !==
                undefined
                ? Number(
                    req.body.price
                )
                : product.price;

        product.category =
            req.body.category?.trim() ??
            product.category;

        product.stock =
            req.body.stock !==
                undefined
                ? Number(
                    req.body.stock
                )
                : product.stock;

        // =========================
        // MAKE SURE IMAGES EXISTS
        // =========================

        let currentImages =
            Array.isArray(
                product.images
            )
                ? [
                    ...product.images,
                ]
                : [];

        // =========================
        // SUPPORT OLD PRODUCTS
        // =========================

        if (
            currentImages.length ===
            0 &&
            product.image
        ) {
            currentImages = [
                product.image,
            ];
        }

        // =========================
        // REMOVE IMAGES
        // =========================

        if (
            req.body.removedImages
        ) {
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
                    removedImages =
                        [];
                }
            }

            if (
                Array.isArray(
                    removedImages
                )
            ) {
                currentImages =
                    currentImages.filter(
                        (img) =>
                            !removedImages.includes(
                                img
                            )
                    );
            }
        }

        // =========================
        // ADD NEW IMAGES
        // =========================

        if (
            req.files?.length > 0
        ) {
            const newImages =
                req.files
                    .slice(0, 4)
                    .map(
                        (file) =>
                            `/uploads/${file.filename}`
                    );

            currentImages = [
                ...currentImages,
                ...newImages,
            ].slice(0, 4);
        }

        // =========================
        // SAVE IMAGES
        // =========================

        product.images =
            currentImages;

        // =========================
        // MAIN IMAGE
        // =========================

        product.image =
            currentImages[0] || "";

        // =========================
        // SAVE PRODUCT
        // =========================

        await product.save();

        return res
            .status(200)
            .json(product);

    } catch (error) {
        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );

        // =========================
        // MONGOOSE VALIDATION ERROR
        // =========================

        if (
            error.name ===
            "ValidationError"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        Object.values(
                            error.errors
                        )
                            .map(
                                (err) =>
                                    err.message
                            )
                            .join(", "),
                });
        }

        return res
            .status(500)
            .json({
                message:
                    "Failed to update product",
            });
    }
};

// =========================
// DELETE PRODUCT
// =========================

export const deleteProduct = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        if (
            !isValidObjectId(id)
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid product ID",
                });
        }

        const product =
            await Product.findByIdAndDelete(
                id
            );

        if (!product) {
            return res
                .status(404)
                .json({
                    message:
                        "Product not found",
                });
        }

        return res
            .status(200)
            .json({
                message:
                    "Product deleted successfully",
            });

    } catch (error) {
        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Failed to delete product",
            });
    }
};