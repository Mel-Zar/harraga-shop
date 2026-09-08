import mongoose from "mongoose";

const productSchema =
    new mongoose.Schema(
        {
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


            description: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                minlength:
                    1,

                maxlength:
                    5000,
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


            // Första bilden (thumbnail)
            image: {
                type:
                    String,

                default:
                    "",

                trim:
                    true,
            },


            // Alla bilder
            images: {
                type:
                    [String],

                validate: {
                    validator:
                        function (
                            arr
                        ) {

                            return (
                                Array.isArray(
                                    arr
                                ) &&
                                arr.length <=
                                4
                            );

                        },

                    message:
                        "Max 4 images allowed",
                },

                default:
                    [],
            },


            category: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                minlength:
                    1,

                maxlength:
                    100,
            },


            stock: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,

                validate: {
                    validator:
                        Number.isInteger,

                    message:
                        "Stock must be a whole number.",
                },
            },


            isActive: {
                type:
                    Boolean,

                default:
                    true,
            },

        },

        {
            timestamps:
                true,
        }
    );


export default mongoose.model(
    "Product",
    productSchema
);