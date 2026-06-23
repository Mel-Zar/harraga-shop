import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        // =========================
        // ORDER NUMBER
        // =========================
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        // =========================
        // USER (OPTIONAL)
        // =========================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },

        // =========================
        // ORDER ITEMS
        // =========================
        items: [
            {
                productId: {
                    type: String,
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                },

                image: String,

                price: {
                    type: Number,
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],

        // =========================
        // CUSTOMER
        // =========================
        customer: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: false,
                trim: true,
                default: "",
            },

            phone: {
                type: String,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },

            city: String,

            postalCode: String,
        },

        // =========================
        // PRICING
        // =========================
        pricing: {
            subtotal: {
                type: Number,
                required: true,
            },

            tax: {
                type: Number,
                default: 0,
            },

            shipping: {
                type: Number,
                default: 0,
            },

            total: {
                type: Number,
                required: true,
            },
        },

        // =========================
        // PAYMENT
        // =========================
        payment: {
            method: {
                type: String,
                enum: ["cod", "stripe", "klarna", "swish"],
                default: "cod",
            },

            status: {
                type: String,
                enum: [
                    "pending",
                    "paid",
                    "failed",
                    "refunded",
                ],
                default: "pending",
            },
        },

        // =========================
        // ORDER STATUS
        // =========================
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Order", orderSchema);