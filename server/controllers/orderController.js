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

import {
    createStripeCheckoutSession,
    constructStripeWebhookEvent,
    getStripeCheckoutSession,
    createSwishPayment,
    getSwishPayment,
} from "../services/paymentService.js";


// =========================
// EMAIL VALIDATION
// =========================

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// =========================
// PAYMENT METHODS
// =========================

const allowedPaymentMethods = [
    "cod",
    "stripe",
    "klarna",
    "swish",
];


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


// =====================================================
// GENERATE ORDER NUMBER
// =====================================================

const generateOrderNumber = async (
    session
) => {

    const lastOrder =
        await Order.findOne()
            .sort({
                createdAt: -1,
            })
            .session(
                session
            );


    let nextNumber =
        1;


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


    return `HARRAGA-${String(
        nextNumber
    ).padStart(
        6,
        "0"
    )}`;

};


// =====================================================
// DECREASE STOCK
// =====================================================

const decreaseStock = async (
    order,
    session
) => {

    if (
        !Array.isArray(
            order.items
        )
    ) {
        throw new Error(
            "Order items are missing"
        );
    }


    for (
        const item of order.items
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
                    new:
                        true,

                    session,
                }

            );


        if (
            !updatedProduct
        ) {

            throw new Error(
                `Not enough stock for ${item.name}`
            );

        }

    }

};


// =====================================================
// RESTORE STOCK
// =====================================================

const restoreStock = async (
    order
) => {

    if (
        !Array.isArray(
            order.items
        ) ||
        order.items.length === 0
    ) {

        throw new Error(
            "Order contains no items"
        );

    }


    for (
        const item of order.items
    ) {

        if (
            !item.productId ||
            !mongoose.Types.ObjectId.isValid(
                item.productId
            )
        ) {

            throw new Error(
                "Order contains an invalid product"
            );

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

            throw new Error(
                "Order contains an invalid quantity"
            );

        }


        const product =
            await Product.findById(
                item.productId
            );


        if (
            !product
        ) {

            throw new Error(
                `Product not found while restoring stock: ${item.name ||
                item.productId
                }`
            );

        }


        product.stock =
            Number(
                product.stock
            ) +
            quantity;


        await product.save();

    }

};


// =====================================================
// SEND STATUS EMAIL
// =====================================================

const sendStatusEmail = async (
    order,
    status
) => {

    if (
        !order?.customer?.email
    ) {

        console.log(
            `ℹ️ No customer email. ${status} notification skipped.`
        );

        return false;

    }


    const emailFunction =
        statusEmailMap[
        status
        ];


    if (
        !emailFunction
    ) {
        return false;
    }


    const alreadySent =
        Array.isArray(
            order.statusEmailNotifications
        ) &&
        order.statusEmailNotifications.some(
            (
                notification
            ) =>
                notification.status ===
                status
        );


    if (
        alreadySent
    ) {

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


        if (
            !Array.isArray(
                order.statusEmailNotifications
            )
        ) {

            order.statusEmailNotifications =
                [];

        }


        order.statusEmailNotifications.push({

            status,

            type:
                "status",

            sentAt:
                new Date(),

        });


        await order.save();


        console.log(
            `✅ ${status} notification email sent:`,
            order.orderNumber
        );


        return true;

    } catch (
    emailError
    ) {

        console.error(
            `❌ ${status} email failed:`,
            emailError?.message ||
            emailError
        );


        return false;

    }

};


// =====================================================
// FINALIZE PAID ORDER
// =====================================================

export const finalizePaidOrder = async (
    orderId,
    providerData = {}
) => {

    const session =
        await mongoose.startSession();


    try {

        session.startTransaction();


        const order =
            await Order.findById(
                orderId
            ).session(
                session
            );


        if (
            !order
        ) {

            throw new Error(
                "Order not found"
            );

        }


        // =========================
        // IDEMPOTENCY
        // =========================

        if (
            order.payment?.status ===
            "paid"
        ) {

            await session.commitTransaction();

            return order;

        }


        // =========================
        // CANCELLED ORDER
        // =========================

        if (
            order.status ===
            "cancelled"
        ) {

            throw new Error(
                "Cancelled order cannot be paid"
            );

        }


        // =========================
        // DECREASE STOCK ONLY NOW
        // =========================

        await decreaseStock(
            order,
            session
        );


        // =========================
        // PAYMENT
        // =========================

        order.payment.status =
            "paid";


        order.payment.paidAt =
            new Date();


        order.payment.lastUpdatedAt =
            new Date();


        if (
            providerData.provider
        ) {

            order.payment.provider =
                providerData.provider;

        }


        if (
            providerData.providerStatus
        ) {

            order.payment.providerStatus =
                providerData.providerStatus;

        }


        if (
            providerData.stripePaymentIntentId
        ) {

            order.payment.stripePaymentIntentId =
                providerData.stripePaymentIntentId;

        }


        if (
            providerData.stripeSessionId
        ) {

            order.payment.stripeSessionId =
                providerData.stripeSessionId;

        }


        if (
            providerData.swishPaymentId
        ) {

            order.payment.swishPaymentId =
                providerData.swishPaymentId;

        }


        // =========================
        // ORDER STATUS
        // =========================

        order.status =
            "processing";


        if (
            !Array.isArray(
                order.statusHistory
            )
        ) {

            order.statusHistory =
                [];

        }


        order.statusHistory.push({

            status:
                "processing",

            changedAt:
                new Date(),

            changedBy:
                null,

        });


        await order.save({
            session,
        });


        await session.commitTransaction();


        // =========================
        // SEND EMAILS AFTER COMMIT
        // =========================

        if (
            order.customer?.email
        ) {

            try {

                await sendOrderConfirmationEmail(
                    order.customer.email,
                    order
                );

            } catch (
            error
            ) {

                console.error(
                    "Confirmation email failed:",
                    error?.message ||
                    error
                );

            }

        }


        await sendStatusEmail(
            order,
            "processing"
        );


        return order;

    } catch (
    error
    ) {

        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();

        }


        throw error;

    } finally {

        await session.endSession();

    }

};


// =====================================================
// CREATE ORDER
// =====================================================

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
            paymentMethod,
        } =
            req.body;


        // =========================
        // VALIDATE CART
        // =========================

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Cart is empty",

            });

        }


        if (
            items.length > 50
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Too many different products in one order",

            });

        }


        // =========================
        // PAYMENT METHOD
        // =========================

        const selectedPaymentMethod =
            String(
                paymentMethod ||
                "cod"
            )
                .trim()
                .toLowerCase();


        if (
            !allowedPaymentMethods.includes(
                selectedPaymentMethod
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid payment method",

            });

        }


        // =========================
        // CUSTOMER
        // =========================

        if (
            !customer?.name ||
            !customer?.address ||
            !customer?.phone
        ) {

            return res.status(400).json({

                success:
                    false,

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
                    Number(
                        item.quantity
                    )
                ) ||
                Number(
                    item.quantity
                ) < 1
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid order item",

                });

            }


            if (
                Number(
                    item.quantity
                ) > 100
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Maximum quantity per product is 100",

                });

            }

        }


        // =========================
        // DUPLICATES
        // =========================

        const productIds =
            items.map(
                (
                    item
                ) =>
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

                success:
                    false,

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
                    customer.email ||
                    ""
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
                    customer.city ||
                    ""
                ).trim(),

            postalCode:
                String(
                    customer.postalCode ||
                    ""
                ).trim(),

        };


        if (
            !safeCustomer.name ||
            !safeCustomer.address ||
            !safeCustomer.phone
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Missing customer info",

            });

        }


        if (
            safeCustomer.email &&
            !emailRegex.test(
                safeCustomer.email
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid email format",

            });

        }


        // =========================
        // START TRANSACTION
        // =========================

        session.startTransaction();


        // =========================
        // PRODUCTS
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


            if (
                !product
            ) {

                await session.abortTransaction();

                return res.status(404).json({

                    success:
                        false,

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

                    success:
                        false,

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

                    success:
                        false,

                    message:
                        `Not enough stock for ${product.name}. Available: ${product.stock}`,

                });

            }


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
        // PRICING
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


        const tax =
            Math.round(
                subtotal *
                0.25 *
                100
            ) / 100;


        const shipping =
            safeItems.length > 0
                ? 49
                : 0;


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
        // ORDER NUMBER
        // =========================

        const orderNumber =
            await generateOrderNumber(
                session
            );


        // =========================
        // PAYMENT
        // =========================

        const paymentProvider =
            selectedPaymentMethod ===
                "klarna"
                ? "stripe"
                : selectedPaymentMethod;


        const safePayment = {

            method:
                selectedPaymentMethod,

            status:
                "pending",

            provider:
                paymentProvider,

            providerStatus:
                "pending",

            stripeSessionId:
                null,

            stripePaymentIntentId:
                null,

            swishPaymentId:
                null,

            paidAt:
                null,

            lastUpdatedAt:
                new Date(),

        };


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
        // COD
        // =========================

        if (
            selectedPaymentMethod ===
            "cod"
        ) {

            await decreaseStock(
                savedOrder,
                session
            );

        }


        // =========================
        // COMMIT
        // =========================

        await session.commitTransaction();


        // =========================
        // COD EMAIL
        // =========================

        if (
            selectedPaymentMethod ===
            "cod" &&
            safeCustomer.email
        ) {

            try {

                await sendOrderConfirmationEmail(
                    safeCustomer.email,
                    savedOrder
                );


                savedOrder.statusEmailNotifications.push({

                    status:
                        "pending",

                    type:
                        "confirmation",

                    sentAt:
                        new Date(),

                });


                await savedOrder.save();

            } catch (
            emailError
            ) {

                console.error(
                    "Confirmation email failed:",
                    emailError?.message ||
                    emailError
                );

            }

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

            paymentRequired:
                selectedPaymentMethod !==
                "cod",

        });


    } catch (
    error
    ) {

        if (
            session.inTransaction()
        ) {

            await session.abortTransaction();

        }


        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        if (
            error?.code ===
            11000
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


// =====================================================
// CREATE PAYMENT
// =====================================================

export const createPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;

        console.log("CREATE PAYMENT:", {
            orderId: id,
            paymentMethod,
            userId: req.user?.id || null,
        });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // Guest checkout is allowed.
        // If a user is logged in, make sure they own the order
        // unless they are an admin.
        if (req.user) {
            const isAdmin =
                req.user.isAdmin === true ||
                req.user.isAdmin === "true" ||
                req.user.isAdmin === 1;

            if (!isAdmin) {
                const orderUserId =
                    order.user?.toString?.() ||
                    order.userId?.toString?.();

                if (
                    orderUserId &&
                    orderUserId !== req.user.id.toString()
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "You are not allowed to pay for this order.",
                    });
                }
            }
        }

        if (order.payment?.status === "paid") {
            return res.status(200).json({
                success: true,
                paid: true,
                paymentRequired: false,
                message: "Order is already paid.",
                order,
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be paid.",
            });
        }

        const method =
            paymentMethod ||
            order.payment?.method ||
            "cod";

        console.log("PAYMENT METHOD:", method);

        // Make sure the selected payment method is stored.
        order.payment.method = method;

        /*
         * STRIPE / KLARNA
         *
         * Klarna is handled through Stripe Checkout.
         */
        if (
            method === "stripe" ||
            method === "klarna"
        ) {
            const frontendUrl =
                process.env.FRONTEND_URL;

            if (!frontendUrl) {
                return res.status(500).json({
                    success: false,
                    message:
                        "FRONTEND_URL is not configured.",
                });
            }

            console.log(
                "CREATING STRIPE CHECKOUT SESSION..."
            );

            const session =
                await createStripeCheckoutSession({
                    order,
                    frontendUrl,
                });

            console.log(
                "STRIPE SESSION RESULT:",
                {
                    id: session?.id,
                    url: session?.url,
                    checkoutUrl:
                        session?.checkoutUrl,
                    dataUrl:
                        session?.data?.url,
                }
            );

            const checkoutUrl =
                session?.url ||
                session?.checkoutUrl ||
                session?.data?.url;

            if (!checkoutUrl) {
                console.error(
                    "STRIPE SESSION HAS NO URL:",
                    session
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Stripe Checkout session was created, but no checkout URL was returned.",
                });
            }

            order.payment.provider = "stripe";
            order.payment.stripeSessionId =
                session.id;
            order.payment.providerStatus =
                "created";
            order.payment.lastUpdatedAt =
                new Date();

            await order.save();

            return res.status(200).json({
                success: true,
                paymentRequired: true,
                paymentMethod: method,
                checkoutUrl,
                sessionId: session.id,
                order,
            });
        }

        /*
         * SWISH
         */
        if (method === "swish") {
            console.log(
                "CREATING SWISH PAYMENT..."
            );

            const payment =
                await createSwishPayment({
                    order,
                });

            console.log(
                "SWISH PAYMENT RESULT:",
                payment
            );

            const paymentId =
                payment?.paymentId ||
                payment?.id ||
                payment?.data?.paymentId;

            if (!paymentId) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Swish payment was created, but no payment ID was returned.",
                });
            }

            order.payment.provider = "swish";
            order.payment.swishPaymentId =
                paymentId;
            order.payment.providerStatus =
                "created";
            order.payment.lastUpdatedAt =
                new Date();

            await order.save();

            return res.status(200).json({
                success: true,
                paymentRequired: true,
                paymentMethod: method,
                paymentId,
                order,
            });
        }

        /*
         * CASH ON DELIVERY
         */
        if (method === "cod") {
            order.payment.provider = "cod";
            order.payment.status = "pending";
            order.payment.providerStatus =
                "pending";
            order.payment.lastUpdatedAt =
                new Date();

            await order.save();

            return res.status(200).json({
                success: true,
                paymentRequired: false,
                paymentMethod: "cod",
                order,
            });
        }

        return res.status(400).json({
            success: false,
            message:
                `Unsupported payment method: ${method}`,
        });
    } catch (error) {
        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Failed to create payment.",
        });
    }
};


// =====================================================
// STRIPE WEBHOOK
// =====================================================

export const stripeWebhook = async (
    req,
    res
) => {

    try {

        const signature =
            req.headers[
            "stripe-signature"
            ];


        if (
            !signature
        ) {

            return res.status(400).send(
                "Missing Stripe signature"
            );

        }


        const event =
            constructStripeWebhookEvent(
                req.body,
                signature
            );


        console.log(
            "STRIPE EVENT:",
            event.type
        );


        if (
            event.type ===
            "checkout.session.completed"
        ) {

            const session =
                event.data.object;


            const orderId =
                session.metadata?.orderId;


            if (
                !orderId
            ) {

                console.error(
                    "Stripe session missing orderId metadata"
                );

                return res.json({
                    received:
                        true,
                });

            }


            const stripePaymentIntentId =
                typeof session.payment_intent ===
                    "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ||
                    null;


            await finalizePaidOrder(

                orderId,

                {

                    provider:
                        "stripe",

                    providerStatus:
                        "paid",

                    stripeSessionId:
                        session.id,

                    stripePaymentIntentId,

                }

            );

        }


        if (
            event.type ===
            "checkout.session.async_payment_succeeded"
        ) {

            const session =
                event.data.object;


            const orderId =
                session.metadata?.orderId;


            if (
                orderId
            ) {

                const stripePaymentIntentId =
                    typeof session.payment_intent ===
                        "string"
                        ? session.payment_intent
                        : session.payment_intent?.id ||
                        null;


                await finalizePaidOrder(

                    orderId,

                    {

                        provider:
                            "stripe",

                        providerStatus:
                            "paid",

                        stripeSessionId:
                            session.id,

                        stripePaymentIntentId,

                    }

                );

            }

        }


        if (
            event.type ===
            "checkout.session.async_payment_failed"
        ) {

            const session =
                event.data.object;


            const orderId =
                session.metadata?.orderId;


            if (
                orderId
            ) {

                await Order.findByIdAndUpdate(

                    orderId,

                    {

                        $set: {

                            "payment.status":
                                "failed",

                            "payment.providerStatus":
                                "failed",

                            "payment.lastUpdatedAt":
                                new Date(),

                        },

                    }

                );

            }

        }


        return res.json({

            received:
                true,

        });


    } catch (
    error
    ) {

        console.error(
            "STRIPE WEBHOOK ERROR:",
            error
        );


        return res.status(400).send(
            `Webhook Error: ${error.message
            }`
        );

    }

};


// =====================================================
// SWISH CALLBACK
// =====================================================

export const swishCallback = async (
    req,
    res
) => {

    try {

        const callbackData =
            req.body || {};


        console.log(
            "SWISH CALLBACK:",
            callbackData
        );


        const paymentReference =
            callbackData.paymentReference ||
            callbackData.payeePaymentReference ||
            callbackData.reference;


        if (
            !paymentReference
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Missing Swish payment reference",

            });

        }


        // =========================
        // FIND ORDER
        // =========================

        const order =
            await Order.findOne({

                $or: [

                    {
                        "payment.swishPaymentId":
                            paymentReference,
                    },

                    {
                        orderNumber:
                            paymentReference,
                    },

                ],

            });


        if (
            !order
        ) {

            console.error(
                "Swish callback order not found:",
                paymentReference
            );


            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found",

            });

        }


        // =========================
        // VERIFY WITH SWISH
        // =========================

        let swishStatus;


        if (
            order.payment?.swishPaymentId
        ) {

            try {

                swishStatus =
                    await getSwishPayment(
                        order.payment.swishPaymentId
                    );

            } catch (
            error
            ) {

                console.error(
                    "Failed to verify Swish payment:",
                    error
                );

            }

        }


        const status =
            String(
                swishStatus?.data?.status ||
                callbackData.status ||
                ""
            ).toUpperCase();


        // =========================
        // PAID
        // =========================

        if (
            status ===
            "PAID" ||
            status ===
            "COMPLETED"
        ) {

            await finalizePaidOrder(

                order._id,

                {

                    provider:
                        "swish",

                    providerStatus:
                        status,

                    swishPaymentId:
                        order.payment.swishPaymentId,

                }

            );

        }


        // =========================
        // DECLINED / ERROR
        // =========================

        if (
            [
                "DECLINED",
                "ERROR",
                "CANCELLED",
            ].includes(
                status
            )
        ) {

            order.payment.status =
                "failed";


            order.payment.providerStatus =
                status;


            order.payment.lastUpdatedAt =
                new Date();


            await order.save();

        }


        return res.status(200).json({

            success:
                true,

        });


    } catch (
    error
    ) {

        console.error(
            "SWISH CALLBACK ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Swish callback failed",

        });

    }

};


// =====================================================
// GET PAYMENT STATUS
// =====================================================

export const getPaymentStatus = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


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
        // AUTH
        // =========================

        if (
            req.user
        ) {

            const isAdmin =
                req.user.isAdmin ===
                true;


            const isOwner =
                order.user &&
                order.user.toString() ===
                req.user._id.toString();


            if (
                !isAdmin &&
                !isOwner
            ) {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "Not authorized",

                });

            }

        }


        // =========================
        // STRIPE
        // =========================

        if (
            order.payment?.stripeSessionId
        ) {

            try {

                const session =
                    await getStripeCheckoutSession(
                        order.payment.stripeSessionId
                    );


                if (
                    session.payment_status ===
                    "paid" &&
                    order.payment.status !==
                    "paid"
                ) {

                    const stripePaymentIntentId =
                        typeof session.payment_intent ===
                            "string"
                            ? session.payment_intent
                            : session.payment_intent?.id ||
                            null;


                    await finalizePaidOrder(

                        order._id,

                        {

                            provider:
                                "stripe",

                            providerStatus:
                                "paid",

                            stripeSessionId:
                                session.id,

                            stripePaymentIntentId,

                        }

                    );


                    const updatedOrder =
                        await Order.findById(
                            id
                        );


                    return res.json({

                        success:
                            true,

                        paymentStatus:
                            "paid",

                        order:
                            updatedOrder,

                    });

                }

            } catch (
            error
            ) {

                console.error(
                    "Stripe status check failed:",
                    error
                );

            }

        }


        // =========================
        // SWISH
        // =========================

        if (
            order.payment?.swishPaymentId
        ) {

            try {

                const swish =
                    await getSwishPayment(
                        order.payment.swishPaymentId
                    );


                const swishStatus =
                    String(
                        swish?.data?.status ||
                        ""
                    ).toUpperCase();


                if (
                    [
                        "PAID",
                        "COMPLETED",
                    ].includes(
                        swishStatus
                    ) &&
                    order.payment.status !==
                    "paid"
                ) {

                    await finalizePaidOrder(

                        order._id,

                        {

                            provider:
                                "swish",

                            providerStatus:
                                swishStatus,

                            swishPaymentId:
                                order.payment.swishPaymentId,

                        }

                    );

                }

            } catch (
            error
            ) {

                console.error(
                    "Swish status check failed:",
                    error
                );

            }

        }


        const updatedOrder =
            await Order.findById(
                id
            );


        return res.json({

            success:
                true,

            paymentStatus:
                updatedOrder.payment.status,

            paymentMethod:
                updatedOrder.payment.method,

            order:
                updatedOrder,

        });


    } catch (
    error
    ) {

        console.error(
            "GET PAYMENT STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to get payment status",

        });

    }

};


// =====================================================
// GET ALL ORDERS
// =====================================================

export const getAllOrders = async (
    req,
    res
) => {

    try {

        const orders =
            await Order.find()
                .sort({
                    createdAt:
                        -1,
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


// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders = async (
    req,
    res
) => {

    try {

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


        const orders =
            await Order.find({

                user:
                    req.user._id,

            })
                .sort({
                    createdAt:
                        -1,
                });


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


// =====================================================
// GET MY SINGLE ORDER
// =====================================================

export const getMyOrderById = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


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


        const order =
            await Order.findOne({

                _id:
                    id,

                user:
                    req.user._id,

            });


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


// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getOrderById = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


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


        if (
            req.user?.isAdmin ===
            true
        ) {

            return res.json({

                success:
                    true,

                order,

            });

        }


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
            !order.user ||
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


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

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


        const previousStatus =
            order.status ||
            "pending";


        const statusChanged =
            previousStatus !==
            status;


        if (
            !statusChanged
        ) {

            return res.status(200).json({

                success:
                    true,

                message:
                    "Order status is already set to this status",

                order,

            });

        }


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
        // DO NOT SHIP UNPAID ORDER
        // =========================

        if (
            [
                "processing",
                "shipped",
                "delivered",
            ].includes(
                status
            ) &&
            order.payment?.method !==
            "cod" &&
            order.payment?.status !==
            "paid"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Order must be paid before it can be processed",

            });

        }


        // =========================
        // CANCEL
        // =========================

        if (
            status ===
            "cancelled"
        ) {

            if (
                order.payment?.status ===
                "paid"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Paid orders require a refund flow before cancellation",

                });

            }


            await restoreStock(
                order
            );

        }


        order.status =
            status;


        if (
            !Array.isArray(
                order.statusHistory
            )
        ) {

            order.statusHistory =
                [];

        }


        order.statusHistory.push({

            status,

            changedAt:
                new Date(),

            changedBy:
                req.user?._id ||
                null,

        });


        await order.save();


        await sendStatusEmail(
            order,
            status
        );


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


// =====================================================
// CANCEL MY ORDER
// =====================================================

export const cancelMyOrder = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


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


        const order =
            await Order.findOne({

                _id:
                    id,

                user:
                    req.user._id,

            });


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


        if (
            order.status ===
            "cancelled"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Order is already cancelled",

            });

        }


        if (
            order.status !==
            "pending"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `Order cannot be cancelled because its current status is ${order.status}`,

            });

        }


        if (
            order.payment?.status ===
            "paid"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Paid orders require a refund flow",

            });

        }


        await restoreStock(
            order
        );


        order.status =
            "cancelled";


        if (
            !Array.isArray(
                order.statusHistory
            )
        ) {

            order.statusHistory =
                [];

        }


        order.statusHistory.push({

            status:
                "cancelled",

            changedAt:
                new Date(),

            changedBy:
                req.user._id,

        });


        await order.save();


        await sendStatusEmail(
            order,
            "cancelled"
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Order cancelled successfully",

            order,

        });

    } catch (
    error
    ) {

        console.error(
            "CANCEL MY ORDER ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to cancel order",

        });

    }

};