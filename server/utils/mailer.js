import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// =========================
// RESEND
// =========================
const apiKey =
    process.env.RESEND_API_KEY;

if (!apiKey) {
    console.error(
        "❌ RESEND_API_KEY is missing in your .env file"
    );
}

// =========================
// INIT RESEND SAFELY
// =========================
const resend =
    apiKey
        ? new Resend(apiKey)
        : null;

// =========================
// HTML ESCAPE
// =========================
const escapeHtml = (value) => {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// =========================
// CORE EMAIL FUNCTION
// =========================
export const sendEmail = async ({
    to,
    subject,
    html,
}) => {

    if (
        !to ||
        !subject ||
        !html
    ) {
        throw new Error(
            "Missing email parameters"
        );
    }

    if (!resend) {
        throw new Error(
            "Resend is not initialized (missing API key)"
        );
    }

    try {

        const result =
            await resend.emails.send({
                from:
                    "Harraga Shop <onboarding@resend.dev>",

                to,

                subject,

                html,
            });

        console.log(
            "✅ Email sent:",
            result?.data?.id || "success"
        );

        return result;

    } catch (error) {

        console.error(
            "❌ Email failed:",
            error?.message ||
            error
        );

        throw error;
    }
};

// =========================
// WELCOME EMAIL
// =========================
export const sendWelcomeEmail = async (
    to,
    firstName
) => {

    return sendEmail({

        to,

        subject:
            "Welcome to Harraga Shop 🎉",

        html: `
            <div style="
                font-family:Arial,sans-serif;
                max-width:600px;
                margin:0 auto;
                padding:30px;
                color:#222;
            ">

                <h2>
                    Welcome ${escapeHtml(firstName)} 👋
                </h2>

                <p>
                    Your account is now active.
                </p>

                <p>
                    Thank you for joining Harraga Shop.
                </p>

            </div>
        `,
    });
};

// =========================
// VERIFICATION EMAIL
// =========================
export const sendVerificationEmail = async (
    to,
    verifyUrl
) => {

    return sendEmail({

        to,

        subject:
            "Verify your email - Harraga Shop",

        html: `
            <div style="
                font-family:Arial,sans-serif;
                max-width:600px;
                margin:0 auto;
                padding:30px;
                color:#222;
            ">

                <h2>
                    Verify your email
                </h2>

                <p>
                    Click the button below to activate your account:
                </p>

                <a
                    href="${escapeHtml(verifyUrl)}"
                    style="
                        padding:12px 20px;
                        display:inline-block;
                        background:#000;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                    "
                >
                    Verify Email
                </a>

                <p style="
                    margin-top:25px;
                    color:#666;
                ">
                    This link expires in 24 hours.
                </p>

            </div>
        `,
    });
};

// =========================
// RESET PASSWORD EMAIL
// =========================
export const sendResetPasswordEmail = async (
    to,
    resetUrl
) => {

    return sendEmail({

        to,

        subject:
            "Reset your password",

        html: `
            <div style="
                font-family:Arial,sans-serif;
                max-width:600px;
                margin:0 auto;
                padding:30px;
                color:#222;
            ">

                <h2>
                    Reset Password
                </h2>

                <p>
                    Click the button below to reset your password:
                </p>

                <a
                    href="${escapeHtml(resetUrl)}"
                    style="
                        padding:12px 20px;
                        display:inline-block;
                        background:#000;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                    "
                >
                    Reset Password
                </a>

                <p style="
                    margin-top:25px;
                    color:#666;
                ">
                    If you didn't request this, you can safely ignore this email.
                </p>

            </div>
        `,
    });
};

// =========================
// ORDER ITEMS HTML
// =========================
const buildOrderItemRows = (
    items
) => {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `
            <tr>
                <td
                    colspan="4"
                    style="
                        padding:15px;
                        color:#666;
                    "
                >
                    No items found.
                </td>
            </tr>
        `;
    }

    return items.map(
        (item) => {

            const name =
                escapeHtml(
                    item.name
                );

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            const lineTotal =
                (
                    price *
                    quantity
                ).toFixed(2);

            return `
                <tr>

                    <td style="
                        padding:12px 8px;
                        border-bottom:1px solid #eee;
                    ">
                        ${name}
                    </td>

                    <td style="
                        padding:12px 8px;
                        border-bottom:1px solid #eee;
                        text-align:center;
                    ">
                        ${quantity}
                    </td>

                    <td style="
                        padding:12px 8px;
                        border-bottom:1px solid #eee;
                        text-align:right;
                    ">
                        ${price.toFixed(2)}
                    </td>

                    <td style="
                        padding:12px 8px;
                        border-bottom:1px solid #eee;
                        text-align:right;
                        font-weight:bold;
                    ">
                        ${lineTotal}
                    </td>

                </tr>
            `;
        }
    ).join("");
};

// =========================
// ORDER SUMMARY HTML
// =========================
const buildOrderSummary = (
    order
) => {

    const items =
        Array.isArray(order?.items)
            ? order.items
            : [];

    const subtotal =
        Number(
            order.pricing?.subtotal || 0
        ).toFixed(2);

    const tax =
        Number(
            order.pricing?.tax || 0
        ).toFixed(2);

    const shipping =
        Number(
            order.pricing?.shipping || 0
        ).toFixed(2);

    const total =
        Number(
            order.pricing?.total || 0
        ).toFixed(2);

    return `
        <h3>
            Order summary
        </h3>

        <table style="
            width:100%;
            border-collapse:collapse;
            margin-top:15px;
        ">

            <thead>
                <tr>

                    <th style="
                        text-align:left;
                        padding:10px 8px;
                        border-bottom:2px solid #222;
                    ">
                        Product
                    </th>

                    <th style="
                        text-align:center;
                        padding:10px 8px;
                        border-bottom:2px solid #222;
                    ">
                        Qty
                    </th>

                    <th style="
                        text-align:right;
                        padding:10px 8px;
                        border-bottom:2px solid #222;
                    ">
                        Price
                    </th>

                    <th style="
                        text-align:right;
                        padding:10px 8px;
                        border-bottom:2px solid #222;
                    ">
                        Total
                    </th>

                </tr>
            </thead>

            <tbody>
                ${buildOrderItemRows(items)}
            </tbody>

        </table>

        <div style="
            margin-top:25px;
            margin-left:auto;
            max-width:320px;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                padding:6px 0;
            ">
                <span>Subtotal</span>
                <strong>${subtotal} kr</strong>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                padding:6px 0;
            ">
                <span>Tax</span>
                <strong>${tax} kr</strong>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                padding:6px 0;
            ">
                <span>Shipping</span>
                <strong>${shipping} kr</strong>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                padding:12px 0;
                margin-top:8px;
                border-top:2px solid #222;
                font-size:18px;
            ">
                <strong>Total</strong>
                <strong>${total} kr</strong>
            </div>

        </div>
    `;
};

// =========================
// ORDER EMAIL LAYOUT
// =========================
const buildOrderEmailLayout = ({
    title,
    subtitle,
    customerName,
    orderNumber,
    status,
    message,
    order,
}) => {

    return `
        <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:0 auto;
            padding:30px;
            color:#222;
            background:#ffffff;
        ">

            <div style="
                border-bottom:1px solid #eee;
                padding-bottom:20px;
                margin-bottom:25px;
            ">

                <h1 style="
                    margin:0;
                    font-size:28px;
                ">
                    Harraga Shop
                </h1>

                <p style="
                    color:#666;
                    margin:8px 0 0;
                ">
                    ${subtitle}
                </p>

            </div>

            <h2>
                ${title}
            </h2>

            <p>
                Hi ${customerName},
            </p>

            <p>
                ${message}
            </p>

            <div style="
                background:#f7f7f7;
                padding:20px;
                border-radius:8px;
                margin:25px 0;
            ">

                <p style="margin:0 0 10px;">
                    <strong>Order number:</strong>
                    ${orderNumber}
                </p>

                <p style="margin:0;">
                    <strong>Status:</strong>
                    ${status}
                </p>

            </div>

            ${buildOrderSummary(order)}

            <div style="
                margin-top:35px;
                padding-top:20px;
                border-top:1px solid #eee;
                color:#666;
                font-size:14px;
            ">

                <p>
                    Thank you for shopping with Harraga Shop.
                </p>

            </div>

        </div>
    `;
};

// =========================
// ORDER CONFIRMATION EMAIL
// =========================
export const sendOrderConfirmationEmail = async (
    to,
    order
) => {

    if (!to) {
        throw new Error(
            "Customer email is required for order confirmation"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required for order confirmation"
        );
    }

    const customerName =
        escapeHtml(
            order.customer?.name ||
            "Customer"
        );

    const orderNumber =
        escapeHtml(
            order.orderNumber
        );

    const paymentMethod =
        escapeHtml(
            order.payment?.method === "cod"
                ? "Cash on Delivery"
                : order.payment?.method || "N/A"
        );

    return sendEmail({

        to,

        subject:
            `Order Confirmation #${orderNumber} - Harraga Shop`,

        html: `
            ${buildOrderEmailLayout({
            title:
                `Thank you for your order, ${customerName}! 🎉`,

            subtitle:
                "Order confirmation",

            customerName,

            orderNumber,

            status:
                escapeHtml(
                    order.status ||
                    "pending"
                ),

            message:
                `Your order has been successfully received. Payment method: ${paymentMethod}.`,

            order,
        })}
        `,
    });
};

// =========================
// ORDER PROCESSING EMAIL
// =========================
export const sendOrderProcessingEmail = async (
    to,
    order
) => {

    if (!to) {
        throw new Error(
            "Customer email is required for processing notification"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required for processing notification"
        );
    }

    const orderNumber =
        escapeHtml(
            order.orderNumber
        );

    return sendEmail({

        to,

        subject:
            `Your order is being processed #${orderNumber}`,

        html:
            buildOrderEmailLayout({
                title:
                    "Your order is being processed ⚙️",

                subtitle:
                    "Order update",

                customerName:
                    escapeHtml(
                        order.customer?.name ||
                        "Customer"
                    ),

                orderNumber,

                status:
                    "Processing",

                message:
                    "Great news! We have started processing your order. We will notify you when it has been shipped.",

                order,
            }),
    });
};

// =========================
// ORDER SHIPPED EMAIL
// =========================
export const sendOrderShippedEmail = async (
    to,
    order
) => {

    if (!to) {
        throw new Error(
            "Customer email is required for shipped notification"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required for shipped notification"
        );
    }

    const orderNumber =
        escapeHtml(
            order.orderNumber
        );

    return sendEmail({

        to,

        subject:
            `Your order has been shipped #${orderNumber}`,

        html:
            buildOrderEmailLayout({
                title:
                    "Your order is on its way! 📦",

                subtitle:
                    "Shipping notification",

                customerName:
                    escapeHtml(
                        order.customer?.name ||
                        "Customer"
                    ),

                orderNumber,

                status:
                    "Shipped",

                message:
                    "Great news! Your order has been shipped and is now on its way to you.",

                order,
            }),
    });
};

// =========================
// ORDER DELIVERED EMAIL
// =========================
export const sendOrderDeliveredEmail = async (
    to,
    order
) => {

    if (!to) {
        throw new Error(
            "Customer email is required for delivered notification"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required for delivered notification"
        );
    }

    const orderNumber =
        escapeHtml(
            order.orderNumber
        );

    return sendEmail({

        to,

        subject:
            `Your order has been delivered #${orderNumber}`,

        html:
            buildOrderEmailLayout({
                title:
                    "Your order has been delivered! 🎉",

                subtitle:
                    "Delivery confirmation",

                customerName:
                    escapeHtml(
                        order.customer?.name ||
                        "Customer"
                    ),

                orderNumber,

                status:
                    "Delivered",

                message:
                    "Your order has been marked as delivered. We hope you enjoy your purchase!",

                order,
            }),
    });
};

// =========================
// ORDER CANCELLED EMAIL
// =========================
export const sendOrderCancelledEmail = async (
    to,
    order
) => {

    if (!to) {
        throw new Error(
            "Customer email is required for cancelled notification"
        );
    }

    if (!order) {
        throw new Error(
            "Order is required for cancelled notification"
        );
    }

    const orderNumber =
        escapeHtml(
            order.orderNumber
        );

    return sendEmail({

        to,

        subject:
            `Your order has been cancelled #${orderNumber}`,

        html:
            buildOrderEmailLayout({
                title:
                    "Your order has been cancelled",

                subtitle:
                    "Order update",

                customerName:
                    escapeHtml(
                        order.customer?.name ||
                        "Customer"
                    ),

                orderNumber,

                status:
                    "Cancelled",

                message:
                    "Your order has been cancelled. If you believe this was done by mistake, please contact Harraga Shop.",

                order,
            }),
    });
};