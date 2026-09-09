import mongoose from "mongoose";

const orderSchema =
    new mongoose.Schema(
        {
            // =========================
            // ORDER NUMBER
            // =========================
            orderNumber: {
                type:
                    String,

                required:
                    true,

                unique:
                    true,

                trim:
                    true,

                maxlength:
                    50,
            },


            // =========================
            // USER (OPTIONAL)
            // =========================
            user: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    false,

                default:
                    null,
            },


            // =========================
            // ORDER ITEMS
            // =========================
            items: [

                {

                    productId: {
                        type:
                            mongoose.Schema.Types.ObjectId,

                        ref:
                            "Product",

                        required:
                            true,
                    },


                    name: {
                        type:
                            String,

                        required:
                            true,

                        trim:
                            true,

                        minlength:
                            1,

                        maxlength:
                            200,
                    },


                    image: {
                        type:
                            String,

                        default:
                            "",

                        trim:
                            true,

                        maxlength:
                            2000,
                    },


                    price: {
                        type:
                            Number,

                        required:
                            true,

                        min:
                            0,

                        validate: {
                            validator:
                                Number.isFinite,

                            message:
                                "Price must be a valid number.",
                        },
                    },


                    quantity: {
                        type:
                            Number,

                        required:
                            true,

                        min:
                            1,

                        validate: {
                            validator:
                                Number.isInteger,

                            message:
                                "Quantity must be a whole number.",
                        },
                    },

                },

            ],


            // =========================
            // CUSTOMER
            // =========================
            customer: {

                name: {
                    type:
                        String,

                    required:
                        true,

                    trim:
                        true,

                    minlength:
                        1,

                    maxlength:
                        200,
                },


                email: {
                    type:
                        String,

                    trim:
                        true,

                    lowercase:
                        true,

                    default:
                        "",

                    maxlength:
                        320,
                },


                phone: {
                    type:
                        String,

                    required:
                        true,

                    trim:
                        true,

                    minlength:
                        3,

                    maxlength:
                        50,
                },


                address: {
                    type:
                        String,

                    required:
                        true,

                    trim:
                        true,

                    minlength:
                        1,

                    maxlength:
                        500,
                },


                city: {
                    type:
                        String,

                    default:
                        "",

                    trim:
                        true,

                    maxlength:
                        100,
                },


                postalCode: {
                    type:
                        String,

                    default:
                        "",

                    trim:
                        true,

                    maxlength:
                        20,
                },

            },


            // =========================
            // PRICING
            // =========================
            pricing: {

                subtotal: {
                    type:
                        Number,

                    required:
                        true,

                    min:
                        0,

                    validate: {
                        validator:
                            Number.isFinite,

                        message:
                            "Subtotal must be a valid number.",
                    },
                },


                tax: {
                    type:
                        Number,

                    default:
                        0,

                    min:
                        0,

                    validate: {
                        validator:
                            Number.isFinite,

                        message:
                            "Tax must be a valid number.",
                    },
                },


                shipping: {
                    type:
                        Number,

                    default:
                        0,

                    min:
                        0,

                    validate: {
                        validator:
                            Number.isFinite,

                        message:
                            "Shipping must be a valid number.",
                    },
                },


                total: {
                    type:
                        Number,

                    required:
                        true,

                    min:
                        0,

                    validate: {
                        validator:
                            Number.isFinite,

                        message:
                            "Total must be a valid number.",
                    },
                },

            },


            // =========================
            // PAYMENT
            // =========================
            payment: {

                method: {
                    type:
                        String,

                    enum: [
                        "cod",
                        "stripe",
                        "klarna",
                        "swish",
                    ],

                    default:
                        "cod",
                },


                status: {
                    type:
                        String,

                    enum: [
                        "pending",
                        "paid",
                        "failed",
                        "refunded",
                    ],

                    default:
                        "pending",
                },

            },


            // =========================
            // ORDER STATUS
            // =========================
            status: {
                type:
                    String,

                enum: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                ],

                default:
                    "pending",
            },


            // =========================
            // STATUS HISTORY
            // =========================
            statusHistory: [

                {

                    status: {
                        type:
                            String,

                        enum: [
                            "pending",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                        ],

                        required:
                            true,
                    },


                    changedAt: {
                        type:
                            Date,

                        default:
                            Date.now,

                        required:
                            true,
                    },


                    changedBy: {
                        type:
                            mongoose.Schema.Types.ObjectId,

                        ref:
                            "User",

                        default:
                            null,
                    },

                },

            ],


            // =========================
            // STATUS EMAIL TRACKING
            // =========================
            statusEmailNotifications: [

                {

                    status: {
                        type:
                            String,

                        enum: [
                            "pending",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                        ],

                        required:
                            true,
                    },


                    type: {
                        type:
                            String,

                        enum: [
                            "confirmation",
                            "status",
                        ],

                        default:
                            "status",
                    },


                    sentAt: {
                        type:
                            Date,

                        default:
                            Date.now,

                        required:
                            true,
                    },

                },

            ],

        },

        {
            timestamps:
                true,
        }
    );


// =========================
// INDEXES
// =========================
orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    "customer.email": 1,
    createdAt: -1,
});

orderSchema.index({
    status: 1,
    createdAt: -1,
});


// =========================
// ORDER MODEL
// =========================
export default mongoose.model(
    "Order",
    orderSchema
);