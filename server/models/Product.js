import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // Första bilden (thumbnail)
        image: {
            type: String,
            default: "",
        },

        // Alla bilder
        images: {
            type: [String],
            validate: {
                validator: function (arr) {
                    return arr.length <= 4;
                },
                message:
                    "Max 4 images allowed",
            },
            default: [],
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Product", productSchema);