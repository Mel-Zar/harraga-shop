const mongoose = require("mongoose");

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

        image: {
            type: String,
            default: "",
        },


        images: {
            type: [String],
            validate: {
                validator: function (arr) {
                    return arr.length <= 4;
                },
                message: "Max 4 extra images allowed",
            },
            default: [],
        },

        category: {
            type: String,
            required: true,
        },

        stock: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);