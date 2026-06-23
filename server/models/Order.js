import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        // 🔥 FIX: allow guest checkout
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,   // CHANGED
            default: null
        },

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

        customer: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            // 🔥 FIX: guest-safe checkout
            email: {
                type: String,
                required: false,   // CHANGED (was true)
                trim: true,
                default: ""
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

        payment: {
            method: {
                type: String,
                enum: ["cod", "stripe", "klarna", "swish"],
                default: "cod",
            },
            status: {
                type: String,
                enum: ["pending", "paid", "failed", "refunded"],
                default: "pending",
            },
        },

        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);