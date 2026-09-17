import Order from "../models/Order.js";

import {
    constructStripeWebhookEvent,
} from "../services/paymentService.js";

// =====================================================
// STRIPE WEBHOOK
// =====================================================

const handleStripeWebhook = async (
    req,
    res
) => {
    try {
        const signature =
            req.headers["stripe-signature"];

        if (!signature) {
            return res.status(400).json({
                message:
                    "Missing Stripe signature.",
            });
        }

        // =================================================
        // VERIFY STRIPE WEBHOOK
        // =================================================

        const event =
            constructStripeWebhookEvent(
                req.body,
                signature
            );

        console.log(
            "💳 Stripe webhook:",
            event.type
        );

        // =================================================
        // CHECKOUT COMPLETED
        // =================================================

        if (
            event.type ===
            "checkout.session.completed"
        ) {
            const session =
                event.data.object;

            const orderId =
                session.metadata?.orderId;

            if (!orderId) {
                console.error(
                    "❌ Stripe session has no orderId metadata."
                );

                return res.status(400).json({
                    message:
                        "Order ID missing from Stripe session.",
                });
            }

            const order =
                await Order.findById(
                    orderId
                );

            if (!order) {
                console.error(
                    "❌ Order not found:",
                    orderId
                );

                return res.status(404).json({
                    message:
                        "Order not found.",
                });
            }

            // =================================================
            // IDEMPOTENCY
            // Undvik att behandla samma webhook flera gånger.
            // =================================================

            if (
                order.payment?.status ===
                "paid"
            ) {
                console.log(
                    "ℹ️ Order already marked as paid:",
                    order.orderNumber
                );

                return res.status(200).json({
                    received: true,
                });
            }

            // =================================================
            // VERIFY PAYMENT
            // =================================================

            if (
                session.payment_status !==
                "paid"
            ) {
                console.log(
                    "⚠️ Stripe checkout completed but payment is not paid:",
                    order.orderNumber
                );

                if (!order.payment) {
                    order.payment = {};
                }

                order.payment.provider =
                    "stripe";

                order.payment.providerStatus =
                    session.payment_status ||
                    "unpaid";

                order.payment.stripeSessionId =
                    session.id;

                order.payment.lastUpdatedAt =
                    new Date();

                await order.save();

                return res.status(200).json({
                    received: true,
                });
            }

            // =================================================
            // UPDATE PAYMENT
            // =================================================

            if (!order.payment) {
                order.payment = {};
            }

            order.payment.method =
                order.payment.method ||
                "stripe";

            order.payment.provider =
                "stripe";

            order.payment.status =
                "paid";

            order.payment.providerStatus =
                session.payment_status;

            order.payment.stripeSessionId =
                session.id;

            if (
                session.payment_intent
            ) {
                order.payment.stripePaymentIntentId =
                    session.payment_intent;
            }

            order.payment.paidAt =
                new Date();

            order.payment.lastUpdatedAt =
                new Date();

            // =================================================
            // UPDATE ORDER STATUS
            // =================================================

            if (
                order.status ===
                "pending"
            ) {
                order.status =
                    "processing";

                if (
                    !Array.isArray(
                        order.statusHistory
                    )
                ) {
                    order.statusHistory = [];
                }

                order.statusHistory.push({
                    status:
                        "processing",

                    changedAt:
                        new Date(),

                    changedBy:
                        null,
                });
            }

            await order.save();

            console.log(
                "✅ Stripe payment confirmed:",
                order.orderNumber
            );
        }

        // =================================================
        // PAYMENT FAILED
        // =================================================

        if (
            event.type ===
            "checkout.session.async_payment_failed"
        ) {
            const session =
                event.data.object;

            const orderId =
                session.metadata?.orderId;

            if (orderId) {
                const order =
                    await Order.findById(
                        orderId
                    );

                if (order) {
                    if (!order.payment) {
                        order.payment = {};
                    }

                    order.payment.method =
                        order.payment.method ||
                        "stripe";

                    order.payment.provider =
                        "stripe";

                    order.payment.status =
                        "failed";

                    order.payment.providerStatus =
                        "failed";

                    order.payment.stripeSessionId =
                        session.id;

                    order.payment.failureReason =
                        "Stripe payment failed.";

                    order.payment.lastUpdatedAt =
                        new Date();

                    await order.save();

                    console.log(
                        "❌ Stripe payment failed:",
                        order.orderNumber
                    );
                }
            }
        }

        // =================================================
        // PAYMENT EXPIRED
        // =================================================

        if (
            event.type ===
            "checkout.session.expired"
        ) {
            const session =
                event.data.object;

            const orderId =
                session.metadata?.orderId;

            if (orderId) {
                const order =
                    await Order.findById(
                        orderId
                    );

                if (order) {
                    if (!order.payment) {
                        order.payment = {};
                    }

                    order.payment.method =
                        order.payment.method ||
                        "stripe";

                    order.payment.provider =
                        "stripe";

                    order.payment.status =
                        "failed";

                    order.payment.providerStatus =
                        "expired";

                    order.payment.stripeSessionId =
                        session.id;

                    order.payment.failureReason =
                        "Stripe checkout session expired.";

                    order.payment.lastUpdatedAt =
                        new Date();

                    await order.save();

                    console.log(
                        "⚠️ Stripe checkout expired:",
                        order.orderNumber
                    );
                }
            }
        }

        // =================================================
        // PAYMENT REFUNDED
        // =================================================

        if (
            event.type ===
            "charge.refunded"
        ) {
            const charge =
                event.data.object;

            const paymentIntentId =
                charge.payment_intent;

            if (paymentIntentId) {
                const order =
                    await Order.findOne({
                        "payment.stripePaymentIntentId":
                            paymentIntentId,
                    });

                if (order) {
                    if (!order.payment) {
                        order.payment = {};
                    }

                    order.payment.status =
                        "refunded";

                    order.payment.provider =
                        "stripe";

                    order.payment.providerStatus =
                        "refunded";

                    order.payment.lastUpdatedAt =
                        new Date();

                    await order.save();

                    console.log(
                        "💰 Stripe payment refunded:",
                        order.orderNumber
                    );
                }
            }
        }

        // =================================================
        // ALWAYS ACKNOWLEDGE RECEIVED EVENT
        // =================================================

        return res.status(200).json({
            received: true,
        });
    } catch (error) {
        console.error(
            "❌ Stripe webhook error:",
            error.message
        );

        return res.status(400).json({
            message:
                "Stripe webhook verification failed.",
        });
    }
};

// =====================================================
// EXPORTS
// =====================================================

export {
    handleStripeWebhook,
};