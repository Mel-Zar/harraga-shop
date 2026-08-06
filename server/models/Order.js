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
            trim: true,
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
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                image: {
                    type: String,
                    default: "",
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
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
                trim: true,
                default: "",
            },

            phone: {
                type: String,
                required: true,
                trim: true,
            },

            address: {
                type: String,
                required: true,
                trim: true,
            },

            city: {
                type: String,
                default: "",
                trim: true,
            },

            postalCode: {
                type: String,
                default: "",
                trim: true,
            },
        },

        // =========================
        // PRICING
        // =========================
        pricing: {
            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },

            tax: {
                type: Number,
                default: 0,
                min: 0,
            },

            shipping: {
                type: Number,
                default: 0,
                min: 0,
            },

            total: {
                type: Number,
                required: true,
                min: 0,
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