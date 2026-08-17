import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// =========================
// CREATE ORDER
// =========================
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            customer,
            pricing,
            payment,
        } = req.body;

        console.log(
            "ORDER BODY:",
            req.body
        );

        // =========================
        // VALIDATE CART
        // =========================
        if (!items?.length) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        // =========================
        // VALIDATE CUSTOMER
        // =========================
        if (
            !customer?.name ||
            !customer?.address ||
            !customer?.phone
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing customer info",
            });
        }

        // =========================
        // VALIDATE ITEMS
        // =========================
        for (const item of items) {
            if (
                !item.productId ||
                !mongoose.Types.ObjectId.isValid(
                    item.productId
                ) ||
                !item.quantity ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order item",
                });
            }
        }

        // =========================
        // GET PRODUCTS + VALIDATE STOCK
        // =========================
        const safeItems = [];

        for (const item of items) {
            const product =
                await Product.findById(
                    item.productId
                );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message:
                        `Product not found: ${item.name || item.productId}`,
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message:
                        `${product.name} is unavailable`,
                });
            }

            if (
                product.stock <
                item.quantity
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Not enough stock for ${product.name}. Available: ${product.stock}`,
                });
            }

            // =========================
            // USE DATABASE PRODUCT DATA
            // =========================
            safeItems.push({
                productId:
                    product._id,

                name:
                    product.name,

                image:
                    item.image ||
                    product.image ||
                    "",

                price:
                    product.price,

                quantity:
                    item.quantity,
            });
        }

        // =========================
        // GENERATE ORDER NUMBER
        // =========================
        const lastOrder =
            await Order.findOne().sort({
                createdAt: -1,
            });

        let nextNumber = 1;

        if (lastOrder?.orderNumber) {
            const currentNumber =
                parseInt(
                    lastOrder.orderNumber.replace(
                        "HARRAGA-",
                        ""
                    ),
                    10
                );

            if (!isNaN(currentNumber)) {
                nextNumber =
                    currentNumber + 1;
            }
        }

        const orderNumber =
            `HARRAGA-${String(
                nextNumber
            ).padStart(6, "0")}`;

        // =========================
        // SAFE CUSTOMER
        // =========================
        const safeCustomer = {
            name:
                customer.name,

            email:
                customer.email || "",

            address:
                customer.address,

            phone:
                customer.phone,

            city:
                customer.city || "",

            postalCode:
                customer.postalCode || "",
        };

        // =========================
        // CALCULATE PRICING
        // =========================
        const subtotal =
            safeItems.reduce(
                (total, item) =>
                    total +
                    Number(item.price) *
                    Number(item.quantity),
                0
            );

        const frontendTax =
            Number(pricing?.tax) || 0;

        const frontendShipping =
            Number(pricing?.shipping) || 0;

        const calculatedTotal =
            subtotal +
            frontendTax +
            frontendShipping;

        const safePricing = {
            subtotal,
            tax: frontendTax,
            shipping: frontendShipping,
            total: calculatedTotal,
        };

        // =========================
        // DECREASE STOCK
        // =========================
        for (const item of safeItems) {
            const updatedProduct =
                await Product.findOneAndUpdate(
                    {
                        _id:
                            item.productId,

                        stock: {
                            $gte:
                                item.quantity,
                        },
                    },
                    {
                        $inc: {
                            stock:
                                -item.quantity,
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!updatedProduct) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Not enough stock for ${item.name}`,
                });
            }
        }

        // =========================
        // SAFE PAYMENT
        // =========================
        const safePayment =
            payment ?? {
                method: "cod",
                status: "pending",
            };

        // =========================
        // CREATE ORDER
        // =========================
        const order = new Order({
            orderNumber,

            user:
                req.user?._id || null,

            items:
                safeItems,

            customer:
                safeCustomer,

            pricing:
                safePricing,

            payment:
                safePayment,

            status:
                "pending",
        });

        const savedOrder =
            await order.save();

        // =========================
        // SUCCESS
        // =========================
        return res.status(201).json({
            success: true,

            message:
                "Order created successfully",

            order:
                savedOrder,
        });

    } catch (error) {
        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Server error while creating order",
        });
    }
};


// =========================
// GET ALL ORDERS
// ADMIN ONLY
// =========================
export const getAllOrders = async (
    req,
    res
) => {
    try {
        const orders =
            await Order.find()
                .sort({
                    createdAt: -1,
                });

        return res.json({
            success: true,

            count:
                orders.length,

            orders,
        });

    } catch (error) {
        console.error(
            "GET ORDERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch orders",
        });
    }
};


// =========================
// GET MY ORDERS
// CUSTOMER ONLY
// =========================
export const getMyOrders = async (
    req,
    res
) => {
    try {
        // =========================
        // CHECK AUTHENTICATION
        // =========================
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // =========================
        // FIND CUSTOMER ORDERS
        // =========================
        const orders =
            await Order.find({
                user: req.user._id,
            })
                .sort({
                    createdAt: -1,
                });

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({
            success: true,

            count:
                orders.length,

            orders,
        });

    } catch (error) {
        console.error(
            "GET MY ORDERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch your orders",
        });
    }
};


// =========================
// GET MY SINGLE ORDER
// CUSTOMER ONLY
// =========================
export const getMyOrderById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // =========================
        // CHECK AUTHENTICATION
        // =========================
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // =========================
        // VALIDATE ID
        // =========================
        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid order ID",
            });
        }

        // =========================
        // FIND CUSTOMER ORDER
        // =========================
        const order =
            await Order.findOne({
                _id: id,
                user: req.user._id,
            });

        // =========================
        // ORDER NOT FOUND
        // =========================
        if (!order) {
            return res.status(404).json({
                success: false,

                message:
                    "Order not found",
            });
        }

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({
            success: true,

            order,
        });

    } catch (error) {
        console.error(
            "GET MY ORDER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch your order",
        });
    }
};


// =========================
// GET SINGLE ORDER
// CUSTOMER OR ADMIN
// =========================
export const getOrderById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        // =========================
        // VALIDATE ID
        // =========================
        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid order ID",
            });
        }

        // =========================
        // FIND ORDER
        // =========================
        const order =
            await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,

                message:
                    "Order not found",
            });
        }

        // =========================
        // ADMIN
        // =========================
        if (req.user?.isAdmin) {
            return res.json({
                success: true,

                order,
            });
        }

        // =========================
        // CUSTOMER
        // ONLY THEIR OWN ORDER
        // =========================
        if (!req.user) {
            return res.status(401).json({
                success: false,

                message:
                    "Authentication required",
            });
        }

        if (!order.user) {
            return res.status(403).json({
                success: false,

                message:
                    "You are not authorized to view this order",
            });
        }

        if (
            order.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,

                message:
                    "You are not authorized to view this order",
            });
        }

        // =========================
        // CUSTOMER SUCCESS
        // =========================
        return res.json({
            success: true,

            order,
        });

    } catch (error) {
        console.error(
            "GET ORDER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Error fetching order",
        });
    }
};


// =========================
// UPDATE ORDER STATUS
// ADMIN ONLY
// =========================
export const updateOrderStatus = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const { status } =
            req.body;

        // =========================
        // VALIDATE ID
        // =========================
        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid order ID",
            });
        }

        // =========================
        // ALLOWED STATUSES
        // =========================
        const allowedStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        // =========================
        // VALIDATE STATUS
        // =========================
        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid order status",
            });
        }

        // =========================
        // FIND ORDER
        // =========================
        const order =
            await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,

                message:
                    "Order not found",
            });
        }

        // =========================
        // UPDATE STATUS
        // =========================
        order.status =
            status;

        await order.save();

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({
            success: true,

            message:
                "Order status updated successfully",

            order,
        });

    } catch (error) {
        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to update order status",
        });
    }
};