import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

import {
    sendOrderConfirmationEmail,
    sendOrderProcessingEmail,
    sendOrderShippedEmail,
    sendOrderDeliveredEmail,
    sendOrderCancelledEmail,
} from "../utils/mailer.js";

// =========================
// EMAIL VALIDATION
// =========================
const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =========================
// ORDER STATUS FLOW
// =========================
const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

// =========================
// VALID STATUS TRANSITIONS
// =========================
const allowedTransitions = {
    pending: [
        "processing",
        "cancelled",
    ],

    processing: [
        "shipped",
        "cancelled",
    ],

    shipped: [
        "delivered",
    ],

    delivered: [],

    cancelled: [],
};

// =========================
// ORDER STATUS EMAIL MAP
// =========================
const statusEmailMap = {
    processing:
        sendOrderProcessingEmail,

    shipped:
        sendOrderShippedEmail,

    delivered:
        sendOrderDeliveredEmail,

    cancelled:
        sendOrderCancelledEmail,
};

// =========================
// SEND STATUS EMAIL
// =========================
const sendStatusEmail = async (
    order,
    status
) => {

    if (
        !order?.customer?.email
    ) {

        console.log(
            `ℹ️ No customer email. ${status} notification skipped for ${order?.orderNumber || "order"}.`
        );

        return false;
    }

    const emailFunction =
        statusEmailMap[status];

    if (!emailFunction) {
        return false;
    }

    // =========================
    // PREVENT DUPLICATE EMAILS
    // =========================
    const alreadySent =
        Array.isArray(
            order.statusEmailNotifications
        ) &&
        order.statusEmailNotifications.some(
            (notification) =>
                notification.status ===
                status
        );

    if (alreadySent) {

        console.log(
            `ℹ️ ${status} email already sent for ${order.orderNumber}.`
        );

        return false;
    }

    try {

        await emailFunction(
            order.customer.email,
            order
        );

        // =========================
        // MAKE SURE ARRAY EXISTS
        // =========================
        if (
            !Array.isArray(
                order.statusEmailNotifications
            )
        ) {
            order.statusEmailNotifications = [];
        }

        // =========================
        // ONLY MARK AS SENT AFTER
        // SUCCESSFUL EMAIL
        // =========================
        order.statusEmailNotifications.push({
            status,
            sentAt:
                new Date(),
        });

        await order.save();

        console.log(
            `✅ ${status} notification email sent:`,
            order.orderNumber
        );

        return true;

    } catch (emailError) {

        console.error(
            `❌ ${status} notification email failed:`,
            emailError?.message ||
            emailError
        );

        // =========================
        // EMAIL FAILURE MUST NOT
        // BREAK ORDER
        // =========================
        return false;
    }
};

// =========================
// CREATE ORDER
// =========================
export const createOrder = async (
    req,
    res
) => {

    const session =
        await mongoose.startSession();

    try {

        const {
            items,
            customer,
        } = req.body;

        console.log(
            "CREATE ORDER:",
            {
                itemCount:
                    Array.isArray(items)
                        ? items.length
                        : 0,

                customerEmail:
                    customer?.email || "none",

                authenticated:
                    Boolean(req.user),
            }
        );

        // =========================
        // VALIDATE CART
        // =========================
        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });

        }

        // =========================
        // PROTECTION AGAINST HUGE ORDERS
        // =========================
        if (items.length > 50) {

            return res.status(400).json({
                success: false,
                message:
                    "Too many different products in one order",
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
        for (
            const item of items
        ) {

            if (
                !item.productId ||
                !mongoose.Types.ObjectId.isValid(
                    item.productId
                ) ||
                !item.quantity ||
                !Number.isInteger(
                    Number(item.quantity)
                ) ||
                Number(item.quantity) < 1
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order item",
                });

            }

            // =========================
            // MAX QUANTITY PER PRODUCT
            // =========================
            if (
                Number(item.quantity) > 100
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Maximum quantity per product is 100",
                });

            }

        }

        // =========================
        // CHECK DUPLICATE PRODUCTS
        // =========================
        const productIds =
            items.map(
                (item) =>
                    String(
                        item.productId
                    )
            );

        const uniqueProductIds =
            new Set(
                productIds
            );

        if (
            uniqueProductIds.size !==
            productIds.length
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Duplicate products are not allowed in the order",
            });

        }

        // =========================
        // SAFE CUSTOMER
        // =========================
        const safeCustomer = {

            name:
                String(
                    customer.name
                ).trim(),

            email:
                String(
                    customer.email || ""
                )
                    .trim()
                    .toLowerCase(),

            address:
                String(
                    customer.address
                ).trim(),

            phone:
                String(
                    customer.phone
                ).trim(),

            city:
                String(
                    customer.city || ""
                ).trim(),

            postalCode:
                String(
                    customer.postalCode || ""
                ).trim(),

        };

        // =========================
        // VALIDATE CUSTOMER AFTER TRIM
        // =========================
        if (
            !safeCustomer.name ||
            !safeCustomer.address ||
            !safeCustomer.phone
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Missing customer info",
            });

        }

        // =========================
        // VALIDATE EMAIL IF PROVIDED
        // =========================
        if (
            safeCustomer.email &&
            !emailRegex.test(
                safeCustomer.email
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid email format",
            });

        }

        // =========================
        // START TRANSACTION
        // =========================
        session.startTransaction();

        // =========================
        // GET PRODUCTS + VALIDATE STOCK
        // =========================
        const safeItems = [];

        for (
            const item of items
        ) {

            const product =
                await Product.findById(
                    item.productId
                ).session(
                    session
                );

            if (!product) {

                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message:
                        `Product not found: ${item.name ||
                        item.productId
                        }`,
                });

            }

            if (
                !product.isActive
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        `${product.name} is unavailable`,
                });

            }

            if (
                product.stock <
                Number(
                    item.quantity
                )
            ) {

                await session.abortTransaction();

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
                    product.images?.[0] ||
                    product.image ||
                    "",

                price:
                    Number(
                        product.price
                    ),

                quantity:
                    Number(
                        item.quantity
                    ),

            });

        }

        // =========================
        // CALCULATE PRICING
        // BACKEND IS SOURCE OF TRUTH
        // =========================
        const subtotal =
            Math.round(
                safeItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.price
                        ) *
                        Number(
                            item.quantity
                        ),
                    0
                ) * 100
            ) / 100;

        // =========================
        // TAX
        // =========================
        const tax =
            Math.round(
                subtotal *
                0.25 *
                100
            ) / 100;

        // =========================
        // SHIPPING
        // =========================
        const shipping =
            safeItems.length > 0
                ? 49
                : 0;

        // =========================
        // TOTAL
        // =========================
        const calculatedTotal =
            Math.round(
                (
                    subtotal +
                    tax +
                    shipping
                ) * 100
            ) / 100;

        const safePricing = {

            subtotal,

            tax,

            shipping,

            total:
                calculatedTotal,

        };

        // =========================
        // SAFE PAYMENT
        // =========================
        const safePayment = {

            method:
                "cod",

            status:
                "pending",

        };

        // =========================
        // DECREASE STOCK
        // =========================
        for (
            const item of safeItems
        ) {

            const updatedProduct =
                await Product.findOneAndUpdate(
                    {
                        _id:
                            item.productId,

                        isActive:
                            true,

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
                        session,
                    }
                );

            if (
                !updatedProduct
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        `Not enough stock for ${item.name}`,
                });

            }

        }

        // =========================
        // GENERATE ORDER NUMBER
        // =========================
        const lastOrder =
            await Order.findOne()
                .sort({
                    createdAt: -1,
                })
                .session(
                    session
                );

        let nextNumber = 1;

        if (
            lastOrder?.orderNumber
        ) {

            const currentNumber =
                parseInt(
                    lastOrder.orderNumber.replace(
                        "HARRAGA-",
                        ""
                    ),
                    10
                );

            if (
                !isNaN(
                    currentNumber
                )
            ) {

                nextNumber =
                    currentNumber + 1;

            }

        }

        const orderNumber =
            `HARRAGA-${String(
                nextNumber
            ).padStart(
                6,
                "0"
            )}`;

        // =========================
        // INITIAL STATUS HISTORY
        // =========================
        const initialStatusHistory = [
            {
                status:
                    "pending",

                changedAt:
                    new Date(),

                changedBy:
                    req.user?._id ||
                    null,
            },
        ];

        // =========================
        // CREATE ORDER
        // =========================
        const order =
            new Order({

                orderNumber,

                user:
                    req.user?._id ||
                    null,

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

                statusHistory:
                    initialStatusHistory,

                statusEmailNotifications:
                    [],

            });

        const savedOrder =
            await order.save({
                session,
            });

        // =========================
        // COMMIT TRANSACTION
        // =========================
        await session.commitTransaction();

        // =========================
        // SEND ORDER CONFIRMATION
        // EMAIL FAILURE MUST NOT
        // CANCEL THE ORDER
        // =========================
        if (
            safeCustomer.email
        ) {

            try {

                await sendOrderConfirmationEmail(
                    safeCustomer.email,
                    savedOrder
                );

                // =========================
                // TRACK CONFIRMATION EMAIL
                // =========================
                if (
                    !Array.isArray(
                        savedOrder.statusEmailNotifications
                    )
                ) {
                    savedOrder.statusEmailNotifications = [];
                }

                savedOrder.statusEmailNotifications.push({
                    status:
                        "pending",

                    type:
                        "confirmation",

                    sentAt:
                        new Date(),
                });

                await savedOrder.save();

                console.log(
                    "✅ Order confirmation email sent:",
                    savedOrder.orderNumber
                );

            } catch (emailError) {

                console.error(
                    "❌ Order confirmation email failed:",
                    emailError?.message ||
                    emailError
                );

                // =========================
                // DO NOT FAIL THE ORDER
                // =========================
            }

        } else {

            console.log(
                "ℹ️ No customer email provided. Order confirmation email skipped."
            );

        }

        // =========================
        // SUCCESS
        // =========================
        return res.status(201).json({

            success:
                true,

            message:
                "Order created successfully",

            order:
                savedOrder,

        });

    } catch (
    error
    ) {

        // =========================
        // ROLLBACK TRANSACTION
        // =========================
        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();

        }

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        // =========================
        // DUPLICATE ORDER NUMBER
        // =========================
        if (
            error?.code === 11000
        ) {

            return res.status(409).json({

                success:
                    false,

                message:
                    "Order number conflict. Please try again.",

            });

        }

        return res.status(500).json({

            success:
                false,

            message:
                "Server error while creating order",

        });

    } finally {

        await session.endSession();

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

            success:
                true,

            count:
                orders.length,

            orders,

        });

    } catch (
    error
    ) {

        console.error(
            "GET ORDERS ERROR:",
            error
        );

        return res.status(500).json({

            success:
                false,

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
        if (
            !req.user?._id
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Authentication required",

            });

        }

        // =========================
        // FIND CUSTOMER ORDERS
        // =========================
        const orders =
            await Order.find({

                user:
                    req.user._id,

            })
                .sort({
                    createdAt: -1,
                });

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({

            success:
                true,

            count:
                orders.length,

            orders,

        });

    } catch (
    error
    ) {

        console.error(
            "GET MY ORDERS ERROR:",
            error
        );

        return res.status(500).json({

            success:
                false,

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

        const {
            id
        } = req.params;

        // =========================
        // CHECK AUTHENTICATION
        // =========================
        if (
            !req.user?._id
        ) {

            return res.status(401).json({

                success:
                    false,

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

                success:
                    false,

                message:
                    "Invalid order ID",

            });

        }

        // =========================
        // FIND CUSTOMER ORDER
        // =========================
        const order =
            await Order.findOne({

                _id:
                    id,

                user:
                    req.user._id,

            });

        // =========================
        // ORDER NOT FOUND
        // =========================
        if (
            !order
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found",

            });

        }

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({

            success:
                true,

            order,

        });

    } catch (
    error
    ) {

        console.error(
            "GET MY ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success:
                false,

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

        const {
            id
        } = req.params;

        // =========================
        // VALIDATE ID
        // =========================
        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order ID",

            });

        }

        // =========================
        // FIND ORDER
        // =========================
        const order =
            await Order.findById(
                id
            );

        if (
            !order
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found",

            });

        }

        // =========================
        // ADMIN
        // =========================
        if (
            req.user?.isAdmin === true
        ) {

            return res.json({

                success:
                    true,

                order,

            });

        }

        // =========================
        // CUSTOMER
        // ONLY THEIR OWN ORDER
        // =========================
        if (
            !req.user
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Authentication required",

            });

        }

        if (
            !order.user
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not authorized to view this order",

            });

        }

        if (
            order.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not authorized to view this order",

            });

        }

        // =========================
        // CUSTOMER SUCCESS
        // =========================
        return res.json({

            success:
                true,

            order,

        });

    } catch (
    error
    ) {

        console.error(
            "GET ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success:
                false,

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

        const {
            id
        } = req.params;

        const {
            status
        } = req.body;

        // =========================
        // VALIDATE ID
        // =========================
        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order ID",

            });

        }

        // =========================
        // VALIDATE STATUS
        // =========================
        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order status",

            });

        }

        // =========================
        // FIND ORDER
        // =========================
        const order =
            await Order.findById(
                id
            );

        if (
            !order
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found",

            });

        }

        // =========================
        // CHECK WHETHER STATUS CHANGED
        // =========================
        const previousStatus =
            order.status ||
            "pending";

        const statusChanged =
            previousStatus !==
            status;

        // =========================
        // SAME STATUS
        // DO NOTHING
        // =========================
        if (!statusChanged) {

            return res.status(200).json({

                success:
                    true,

                message:
                    "Order status is already set to this status",

                order,

            });

        }

        // =========================
        // CHECK STATUS TRANSITION
        // =========================
        const possibleTransitions =
            allowedTransitions[
            previousStatus
            ] || [];

        if (
            !possibleTransitions.includes(
                status
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `Invalid status transition from ${previousStatus} to ${status}`,

            });

        }

        // =========================
        // RESTORE STOCK ON CANCEL
        // =========================
        if (
            status === "cancelled"
        ) {

            // =========================
            // MAKE SURE ORDER ITEMS EXIST
            // =========================
            if (
                !Array.isArray(
                    order.items
                ) ||
                order.items.length === 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Cannot cancel an order without items",

                });

            }

            // =========================
            // RESTORE EACH PRODUCT
            // =========================
            for (
                const item of order.items
            ) {

                if (
                    !item.productId ||
                    !mongoose.Types.ObjectId.isValid(
                        item.productId
                    )
                ) {

                    console.error(
                        "INVALID PRODUCT ID IN ORDER:",
                        item.productId
                    );

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Order contains an invalid product",

                    });

                }

                const quantity =
                    Number(
                        item.quantity
                    );

                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity < 1
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Order contains an invalid quantity",

                    });

                }

                const product =
                    await Product.findById(
                        item.productId
                    );

                if (
                    !product
                ) {

                    console.error(
                        "PRODUCT NOT FOUND WHEN RESTORING STOCK:",
                        item.productId
                    );

                    return res.status(404).json({

                        success:
                            false,

                        message:
                            `Product not found while restoring stock: ${item.name || item.productId}`,

                    });

                }

                // =========================
                // INCREASE STOCK
                // =========================
                product.stock =
                    Number(
                        product.stock
                    ) +
                    quantity;

                await product.save();

                console.log(
                    `✅ Stock restored: ${product.name} +${quantity}`
                );

            }

        }

        // =========================
        // UPDATE STATUS
        // =========================
        order.status =
            status;

        // =========================
        // MAKE SURE STATUS HISTORY EXISTS
        // =========================
        if (
            !Array.isArray(
                order.statusHistory
            )
        ) {

            order.statusHistory = [
                {
                    status:
                        previousStatus,

                    changedAt:
                        order.createdAt ||
                        new Date(),

                    changedBy:
                        null,
                },
            ];

        }

        // =========================
        // ADD STATUS HISTORY
        // =========================
        order.statusHistory.push({

            status,

            changedAt:
                new Date(),

            changedBy:
                req.user?._id ||
                null,

        });

        await order.save();

        // =========================
        // SEND STATUS EMAIL
        // =========================
        await sendStatusEmail(
            order,
            status
        );

        // =========================
        // SUCCESS
        // =========================
        return res.status(200).json({

            success:
                true,

            message:
                `Order status changed from ${previousStatus} to ${status}`,

            order,

        });

    } catch (
    error
    ) {

        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                "Failed to update order status",

        });

    }

};