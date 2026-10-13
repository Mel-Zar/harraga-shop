import mongoose from "mongoose";

import Product from "../models/Product.js";

// =========================

// HELPER

// =========================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// =========================

// CATEGORY HELPERS

// =========================

// Formuläret skickar categoryPath som JSON via FormData.

// Vi accepterar även en array om den skickas direkt.

const parseCategoryPath = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    try {
        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

const normalizeCategoryPath = (value) => {
    const parsed = parseCategoryPath(value);

    if (!parsed) {
        return null;
    }

    const path = parsed.map((item) =>
        typeof item === "string" ? item.trim() : "",
    );

    if (
        path.length < 1 ||
        path.length > 20 ||
        path.some((item) => !item || item.length > 100)
    ) {
        return null;
    }

    return path;
};

const getCategoryFields = (categoryPath) => {
    return {
        category: categoryPath[0],

        categoryPath,

        subCategory: categoryPath[categoryPath.length - 1],
    };
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

        // =========================

        // CATEGORY PATH

        // =========================

        let categoryPath = null;

        if (req.body.categoryPath !== undefined) {
            categoryPath = normalizeCategoryPath(req.body.categoryPath);

            if (!categoryPath) {
                return res.status(400).json({
                    message: "Category path must contain 1–20 valid category levels.",
                });
            }
        } else if (typeof category === "string" && category.trim()) {
            // Bakåtkompatibilitet med gamla formulär.

            categoryPath = [category.trim()];
        }

        const mainCategory =
            categoryPath?.[0] ||
            (typeof category === "string" ? category.trim() : "");

        if (!name?.trim() || !description?.trim() || !mainCategory) {
            return res.status(400).json({
                message: "Name, description and category are required.",
            });
        }

        // =========================

        // VALIDATE PRICE

        // =========================

        const parsedPrice = Number(price);

        if (
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            return res.status(400).json({
                message: "Price must be a valid number greater than or equal to 0.",
            });
        }

        // =========================

        // VALIDATE STOCK

        // =========================

        const parsedStock = Number(stock);

        if (
            stock !== undefined &&
            stock !== null &&
            stock !== "" &&
            (!Number.isFinite(parsedStock) ||
                parsedStock < 0 ||
                !Number.isInteger(parsedStock))
        ) {
            return res.status(400).json({
                message: "Stock must be a whole number greater than or equal to 0.",
            });
        }

        // =========================

        // IMAGES

        // =========================

        const images = req.files?.length
            ? req.files

                .slice(0, 4)

                .map((file) => `/uploads/${file.filename}`)
            : [];

        // =========================

        // CREATE PRODUCT

        // =========================

        const categoryFields = getCategoryFields(categoryPath);

        const product = await Product.create({
            name: name.trim(),

            description: description.trim(),

            price: parsedPrice,

            ...categoryFields,

            stock:
                stock === undefined || stock === null || stock === "" ? 0 : parsedStock,

            image: images[0] || "",

            images,
        });

        return res.status(201).json(product);
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

        // =========================

        // MONGOOSE VALIDATION ERROR

        // =========================

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: Object.values(error.errors)

                    .map((err) => err.message)

                    .join(", "),
            });
        }

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
        // =========================

        // SEARCH

        // =========================

        const {
            search,

            category,

            sort,
        } = req.query;

        const filter = {};

        const conditions = [];

        if (search && search.trim()) {
            const escapedSearch = search

                .trim()

                .replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");

            conditions.push({
                $or: [
                    {
                        name: {
                            $regex: escapedSearch,

                            $options: "i",
                        },
                    },

                    {
                        description: {
                            $regex: escapedSearch,

                            $options: "i",
                        },
                    },
                ],
            });
        }

        // =========================

        // CATEGORY FILTER

        // =========================

        if (category && typeof category === "string" && category.trim()) {
            const selectedCategory = category.trim();

            // Träffar både gamla produkter och alla nivåer

            // i den nya kategorisökvägen.

            conditions.push({
                $or: [
                    { category: selectedCategory },

                    { categoryPath: selectedCategory },

                    { subCategory: selectedCategory },
                ],
            });
        }

        if (conditions.length === 1) {
            Object.assign(filter, conditions[0]);
        } else if (conditions.length > 1) {
            filter.$and = conditions;
        }

        // =========================

        // SORT

        // =========================

        let sortOption = {
            createdAt: -1,
        };

        switch (sort) {
            case "price_asc":
                sortOption = { price: 1 };

                break;

            case "price_desc":
                sortOption = { price: -1 };

                break;

            case "name_asc":
                sortOption = { name: 1 };

                break;

            case "name_desc":
                sortOption = { name: -1 };

                break;

            case "newest":
                sortOption = { createdAt: -1 };

                break;

            case "oldest":
                sortOption = { createdAt: 1 };

                break;

            default:
                sortOption = { createdAt: -1 };

                break;
        }

        // =========================

        // GET PRODUCTS

        // =========================

        const products = await Product.find(filter)

            .select("-__v")

            .sort(sortOption)

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

// GET PRODUCT CATEGORIES

// =========================

export const getProductCategories = async (req, res) => {
    try {
        const products = await Product.find({})

            .select("category categoryPath subCategory")

            .lean();

        const categorySet = new Set();

        products.forEach((product) => {
            // Huvudkategori: stöder befintliga produkter.

            if (typeof product.category === "string" && product.category.trim()) {
                categorySet.add(product.category.trim());
            }

            // Alla nivåer i den djupa kategorisökvägen.

            if (Array.isArray(product.categoryPath)) {
                product.categoryPath.forEach((item) => {
                    if (typeof item === "string" && item.trim()) {
                        categorySet.add(item.trim());
                    }
                });
            }

            // Stöd för produkter som har subCategory men

            // saknar categoryPath.

            if (
                typeof product.subCategory === "string" &&
                product.subCategory.trim()
            ) {
                categorySet.add(product.subCategory.trim());
            }
        });

        const sortedCategories = Array.from(categorySet).sort((a, b) =>
            a.localeCompare(b, undefined, {
                sensitivity: "base",
            }),
        );

        return res.status(200).json(sortedCategories);
    } catch (error) {
        console.error(
            "GET PRODUCT CATEGORIES ERROR:",

            error,
        );

        return res.status(500).json({
            message: "Failed to fetch product categories",
        });
    }
};

// =========================

// GET SINGLE PRODUCT

// =========================

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // =========================

        // VALIDATE PRODUCT ID

        // =========================

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        // =========================

        // GET PRODUCT

        // =========================

        const product = await Product.findById(id)

            .select("-__v")

            .lean();

        // =========================

        // PRODUCT NOT FOUND

        // =========================

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // =========================

        // SUCCESS

        // =========================

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

        // =========================

        // VALIDATE PRODUCT ID

        // =========================

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        // =========================

        // FIND PRODUCT

        // =========================

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // =========================

        // VALIDATE NAME

        // =========================

        if (req.body.name !== undefined && !req.body.name?.trim()) {
            return res.status(400).json({
                message: "Product name cannot be empty.",
            });
        }

        // =========================

        // VALIDATE DESCRIPTION

        // =========================

        if (req.body.description !== undefined && !req.body.description?.trim()) {
            return res.status(400).json({
                message: "Product description cannot be empty.",
            });
        }

        // =========================

        // VALIDATE CATEGORY

        // =========================

        if (req.body.category !== undefined && !req.body.category?.trim()) {
            // Tillåt tom category endast när en giltig

            // categoryPath skickas med.

            if (req.body.categoryPath === undefined) {
                return res.status(400).json({
                    message: "Product category cannot be empty.",
                });
            }
        }

        // =========================

        // VALIDATE CATEGORY PATH

        // =========================

        let normalizedCategoryPath = null;

        if (req.body.categoryPath !== undefined) {
            normalizedCategoryPath = normalizeCategoryPath(req.body.categoryPath);

            if (!normalizedCategoryPath) {
                return res.status(400).json({
                    message: "Category path must contain 1–20 valid category levels.",
                });
            }
        }

        // =========================

        // VALIDATE PRICE

        // =========================

        if (req.body.price !== undefined) {
            const parsedPrice = Number(req.body.price);

            if (
                req.body.price === "" ||
                !Number.isFinite(parsedPrice) ||
                parsedPrice < 0
            ) {
                return res.status(400).json({
                    message: "Price must be a valid number greater than or equal to 0.",
                });
            }
        }

        // =========================

        // VALIDATE STOCK

        // =========================

        if (req.body.stock !== undefined) {
            const parsedStock = Number(req.body.stock);

            if (
                req.body.stock === "" ||
                !Number.isFinite(parsedStock) ||
                parsedStock < 0 ||
                !Number.isInteger(parsedStock)
            ) {
                return res.status(400).json({
                    message: "Stock must be a whole number greater than or equal to 0.",
                });
            }
        }

        // =========================

        // BASIC INFORMATION

        // =========================

        product.name = req.body.name?.trim() ?? product.name;

        product.description = req.body.description?.trim() ?? product.description;

        product.price =
            req.body.price !== undefined ? Number(req.body.price) : product.price;

        product.stock =
            req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

        // =========================

        // CATEGORY INFORMATION

        // =========================

        if (normalizedCategoryPath) {
            // Nya formuläret skickar hela sökvägen.

            Object.assign(
                product,

                getCategoryFields(normalizedCategoryPath),
            );
        } else if (req.body.category !== undefined) {
            // Bakåtkompatibilitet när ett gammalt formulär

            // bara skickar en huvudkategori.

            const mainCategory = req.body.category.trim();

            product.category = mainCategory;

            product.categoryPath = [mainCategory];

            product.subCategory = mainCategory;
        }

        // =========================

        // MAKE SURE IMAGES EXISTS

        // =========================

        let currentImages = Array.isArray(product.images)
            ? [...product.images]
            : [];

        // =========================

        // SUPPORT OLD PRODUCTS

        // =========================

        if (currentImages.length === 0 && product.image) {
            currentImages = [product.image];
        }

        // =========================

        // REMOVE IMAGES

        // =========================

        if (req.body.removedImages) {
            let removedImages = req.body.removedImages;

            if (typeof removedImages === "string") {
                try {
                    removedImages = JSON.parse(removedImages);
                } catch {
                    removedImages = [];
                }
            }

            if (Array.isArray(removedImages)) {
                currentImages = currentImages.filter(
                    (img) => !removedImages.includes(img),
                );
            }
        }

        // =========================

        // ADD NEW IMAGES

        // =========================

        if (req.files?.length > 0) {
            const newImages = req.files

                .slice(0, 4)

                .map((file) => `/uploads/${file.filename}`);

            currentImages = [...currentImages, ...newImages].slice(0, 4);
        }

        // =========================

        // SAVE IMAGES

        // =========================

        product.images = currentImages;

        // =========================

        // MAIN IMAGE

        // =========================

        product.image = currentImages[0] || "";

        // =========================

        // SAVE PRODUCT

        // =========================

        await product.save();

        return res.status(200).json(product);
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);

        // =========================

        // MONGOOSE VALIDATION ERROR

        // =========================

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: Object.values(error.errors)

                    .map((err) => err.message)

                    .join(", "),
            });
        }

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

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete product",
        });
    }
};
const parseJsonField = (value, fallback) => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const parseProductExtras = (body = {}) => {
    const numberOrNull = (value) =>
        value === undefined || value === null || value === ""
            ? null
            : Number(value);
    const dimensions = parseJsonField(body.dimensions, {});
    return {
        brand: body.brand ?? "",
        shortDescription: body.shortDescription ?? "",
        sku: body.sku ?? "",
        barcode: body.barcode ?? "",
        compareAtPrice: numberOrNull(body.compareAtPrice),
        costPrice: numberOrNull(body.costPrice),
        lowStockThreshold:
            body.lowStockThreshold === "" || body.lowStockThreshold === undefined
                ? 5
                : Number(body.lowStockThreshold),
        tags: parseJsonField(body.tags, []),
        sizes: parseJsonField(body.sizes, []),
        colors: parseJsonField(body.colors, []),
        material: body.material ?? "",
        fit: body.fit ?? "",
        targetGroup: body.targetGroup ?? "Unisex",
        weight: numberOrNull(body.weight),
        dimensions: {
            length: numberOrNull(dimensions.length),
            width: numberOrNull(dimensions.width),
            height: numberOrNull(dimensions.height),
        },
        shippingClass: body.shippingClass ?? "",
        status: body.status ?? (body.isActive === "false" ? "draft" : "published"),
        isActive:
            body.isActive === undefined
                ? true
                : body.isActive === true || body.isActive === "true",
        isFeatured: body.isFeatured === true || body.isFeatured === "true",
        allowBackorders:
            body.allowBackorders === true || body.allowBackorders === "true",
        seoTitle: body.seoTitle ?? "",
        metaDescription: body.metaDescription ?? "",
        slug: body.slug ?? "",
    };
};
