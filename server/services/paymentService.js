import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import https from "https";
import fs from "fs";
import process from "node:process";
import { Buffer } from "node:buffer";

// =====================================================
// STRIPE
// =====================================================

const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

const stripe =
    stripeSecretKey
        ? new Stripe(stripeSecretKey)
        : null;

// =====================================================
// STRIPE CHECKOUT
// STRIPE + KLARNA
// =====================================================

export const createStripeCheckoutSession = async ({
    order,
    frontendUrl,
}) => {
    if (!stripe) {
        throw new Error(
            "STRIPE_SECRET_KEY is missing"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required"
        );
    }

    if (!frontendUrl) {
        throw new Error(
            "Frontend URL is required"
        );
    }

    if (!order.items || !Array.isArray(order.items)) {
        throw new Error(
            "Order items are required"
        );
    }

    if (order.items.length === 0) {
        throw new Error(
            "Order must contain at least one item"
        );
    }

    // =================================================
    // VALIDATE FRONTEND URL
    // =================================================

    let validFrontendUrl;

    try {
        validFrontendUrl =
            new URL(frontendUrl).toString();

        // Remove trailing slash so URLs below
        // do not become //payment/success
        validFrontendUrl =
            validFrontendUrl.replace(/\/$/, "");
    } catch {
        throw new Error(
            `Invalid FRONTEND_URL: ${frontendUrl}`
        );
    }

    const paymentMethod =
        order.payment?.method;

    const paymentMethodTypes =
        paymentMethod === "klarna"
            ? ["klarna"]
            : ["card"];

    const lineItems =
        order.items.map((item) => {
            const price =
                Number(item.price);

            const quantity =
                Number(item.quantity);

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {
                throw new Error(
                    "Invalid order item price"
                );
            }

            if (
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                throw new Error(
                    "Invalid order item quantity"
                );
            }

            const unitAmount =
                Math.round(price * 100);

            const productImage =
                item.image ||
                item.images?.[0] ||
                "";

            // Stripe requires product images to be
            // complete absolute URLs.
            // Local paths such as /uploads/image.jpg
            // must NOT be sent to Stripe.
            let validProductImage = "";

            if (productImage) {
                try {
                    const parsedImageUrl =
                        new URL(productImage);

                    if (
                        parsedImageUrl.protocol ===
                        "http:" ||
                        parsedImageUrl.protocol ===
                        "https:"
                    ) {
                        validProductImage =
                            parsedImageUrl.toString();
                    }
                } catch {
                    // Ignore invalid/local image URLs.
                    // The Stripe product will simply
                    // be created without an image.
                    validProductImage = "";
                }
            }

            return {
                price_data: {
                    currency: "sek",

                    product_data: {
                        name:
                            item.name ||
                            "Harraga Shop product",

                        ...(validProductImage
                            ? {
                                images: [
                                    validProductImage,
                                ],
                            }
                            : {}),
                    },

                    unit_amount:
                        unitAmount,
                },

                quantity,
            };
        });

    // =================================================
    // SHIPPING
    // =================================================

    const shipping =
        Number(
            order.pricing?.shipping
        );

    if (
        Number.isFinite(shipping) &&
        shipping > 0
    ) {
        lineItems.push({
            price_data: {
                currency: "sek",

                product_data: {
                    name: "Shipping",
                },

                unit_amount:
                    Math.round(
                        shipping * 100
                    ),
            },

            quantity: 1,
        });
    }

    // =================================================
    // STRIPE SESSION
    // =================================================

    const successUrl =
        `${validFrontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
        `${validFrontendUrl}/payment/cancel?order=${encodeURIComponent(
            order.orderNumber || order._id.toString()
        )}`;

    // Extra validation so Stripe never receives
    // an invalid success/cancel URL.
    try {
        new URL(successUrl);
        new URL(cancelUrl);
    } catch {
        throw new Error(
            "Invalid Stripe success or cancel URL."
        );
    }

    console.log(
        "STRIPE CHECKOUT URLS:",
        {
            successUrl,
            cancelUrl,
        }
    );

    // =================================================
    // STRIPE DIAGNOSTICS
    // =================================================

    console.log(
        "STRIPE CHECKOUT CONFIG:",
        {
            keyMode:
                stripeSecretKey?.startsWith("sk_test_")
                    ? "test"
                    : stripeSecretKey?.startsWith("sk_live_")
                        ? "live"
                        : "unknown",

            frontendUrl:
                validFrontendUrl,

            orderId:
                order._id.toString(),

            orderNumber:
                order.orderNumber,

            paymentMethod:
                paymentMethod,

            paymentMethodTypes:
                paymentMethodTypes,
        }
    );

    const session =
        await stripe.checkout.sessions.create({
            mode: "payment",

            // Disable Managed Payments for this
            // Checkout session.
            managed_payments: {
                enabled: false,
            },

            line_items:
                lineItems,

            customer_email:
                order.customer?.email ||
                undefined,

            client_reference_id:
                order._id.toString(),

            metadata: {
                orderId:
                    order._id.toString(),

                orderNumber:
                    order.orderNumber,

                paymentMethod:
                    paymentMethod || "",
            },

            success_url:
                successUrl,

            cancel_url:
                cancelUrl,
        });

    console.log(
        "STRIPE SESSION CREATED:",
        {
            sessionId:
                session.id,

            paymentStatus:
                session.payment_status,

            status:
                session.status,

            url:
                session.url,
        }
    );

    return {
        ...session,
        checkoutUrl:
            session.url,
    };
};

// =====================================================
// STRIPE WEBHOOK
// =====================================================

export const constructStripeWebhookEvent = (
    payload,
    signature
) => {
    if (!stripe) {
        throw new Error(
            "STRIPE_SECRET_KEY is missing"
        );
    }

    if (
        !process.env.STRIPE_WEBHOOK_SECRET
    ) {
        throw new Error(
            "STRIPE_WEBHOOK_SECRET is missing"
        );
    }

    if (!signature) {
        throw new Error(
            "Stripe signature is missing"
        );
    }

    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
    );
};

// =====================================================
// STRIPE GET SESSION
// =====================================================

export const getStripeCheckoutSession =
    async (sessionId) => {
        if (!stripe) {
            throw new Error(
                "STRIPE_SECRET_KEY is missing"
            );
        }

        if (!sessionId) {
            throw new Error(
                "Stripe session ID is required"
            );
        }

        return stripe.checkout.sessions.retrieve(
            sessionId
        );
    };

// =====================================================
// SWISH HTTPS AGENT
// =====================================================

const createSwishAgent = () => {
    const certPath =
        process.env.SWISH_CERT_PATH;

    const keyPath =
        process.env.SWISH_KEY_PATH;

    if (!certPath || !keyPath) {
        throw new Error(
            "SWISH_CERT_PATH and SWISH_KEY_PATH are required"
        );
    }

    if (
        !fs.existsSync(certPath) ||
        !fs.existsSync(keyPath)
    ) {
        throw new Error(
            "Swish certificate or key file does not exist"
        );
    }

    return new https.Agent({
        cert:
            fs.readFileSync(
                certPath
            ),

        key:
            fs.readFileSync(
                keyPath
            ),

        rejectUnauthorized: true,
    });
};

// =====================================================
// SWISH REQUEST
// =====================================================

const swishRequest = ({
    method,
    path,
    body,
}) => {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            let agent;

            try {
                agent =
                    createSwishAgent();
            } catch (error) {
                reject(error);
                return;
            }

            const hostname =
                process.env.SWISH_API_HOST ||
                "mss.cpc.getswish.net";

            const requestBody =
                body
                    ? JSON.stringify(body)
                    : null;

            const requestOptions = {
                hostname,

                port: 443,

                path,

                method,

                agent,

                headers: {
                    "Content-Type":
                        "application/json",

                    Accept:
                        "application/json",

                    ...(requestBody
                        ? {
                            "Content-Length":
                                Buffer.byteLength(
                                    requestBody
                                ),
                        }
                        : {}),
                },
            };

            const request =
                https.request(
                    requestOptions,
                    (response) => {
                        let data = "";

                        response.on(
                            "data",
                            (chunk) => {
                                data +=
                                    chunk.toString();
                            }
                        );

                        response.on(
                            "end",
                            () => {
                                let parsed =
                                    null;

                                try {
                                    parsed =
                                        data
                                            ? JSON.parse(
                                                data
                                            )
                                            : null;
                                } catch {
                                    parsed =
                                        data;
                                }

                                if (
                                    response.statusCode >=
                                    200 &&
                                    response.statusCode <
                                    300
                                ) {
                                    return resolve({
                                        statusCode:
                                            response.statusCode,

                                        headers:
                                            response.headers,

                                        data:
                                            parsed,
                                    });
                                }

                                const error =
                                    new Error(
                                        `Swish API error ${response.statusCode}`
                                    );

                                error.statusCode =
                                    response.statusCode;

                                error.data =
                                    parsed;

                                reject(error);
                            }
                        );
                    }
                );

            request.on(
                "error",
                reject
            );

            if (requestBody) {
                request.write(
                    requestBody
                );
            }

            request.end();
        }
    );
};

// =====================================================
// CREATE SWISH PAYMENT
// =====================================================

export const createSwishPayment = async ({
    order,
}) => {
    if (!order) {
        throw new Error(
            "Order is required"
        );
    }

    if (
        !process.env.SWISH_PAYEE_ALIAS
    ) {
        throw new Error(
            "SWISH_PAYEE_ALIAS is missing"
        );
    }

    const paymentId =
        order._id.toString();

    const callbackUrl =
        process.env.SWISH_CALLBACK_URL;

    if (!callbackUrl) {
        throw new Error(
            "SWISH_CALLBACK_URL is missing"
        );
    }

    const total =
        Number(
            order.pricing?.total
        );

    if (
        !Number.isFinite(total) ||
        total <= 0
    ) {
        throw new Error(
            "Order total must be a valid number greater than zero"
        );
    }

    const amount =
        total.toFixed(2);

    const response =
        await swishRequest({
            method: "PUT",

            path:
                `/api/v1/paymentrequests/${paymentId}`,

            body: {
                payeePaymentReference:
                    order.orderNumber,

                callbackUrl,

                payeeAlias:
                    process.env.SWISH_PAYEE_ALIAS,

                amount,

                currency: "SEK",

                message:
                    `Harraga Shop ${order.orderNumber}`,
            },
        });

    return {
        paymentId,
        response,
    };
};

// =====================================================
// GET SWISH PAYMENT
// =====================================================

export const getSwishPayment = async (
    paymentId
) => {
    if (!paymentId) {
        throw new Error(
            "Swish payment ID is required"
        );
    }

    return swishRequest({
        method: "GET",

        path:
            `/api/v1/paymentrequests/${paymentId}`,
    });
};