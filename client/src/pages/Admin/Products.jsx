import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required."],
            trim: true,
            minlength: 1,
            maxlength: 200,
        },
        brand: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: [true, "Product description is required."],
            trim: true,
            minlength: 1,
            maxlength: 5000,
        },
        price: {
            type: Number,
            required: [true, "Product price is required."],
            min: [0, "Price cannot be negative."],
            validate: {
                validator: Number.isFinite,
                message: "Price must be a valid number.",
            },
        },
        color: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        sku: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        sizes: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.every((size) => typeof size === "string" && size.trim().length > 0),
                message: "Sizes must contain valid text values.",
            },
        },
        // Första bilden används som thumbnail.
        image: {
            type: String,
            default: "",
            trim: true,
        },
        // Alla produktbilder, max 4.
        images: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length <= 4 && arr.every((item) => typeof item === "string" && item.trim().length > 0),
                message: "Maximum 4 valid images are allowed.",
            },
        },
        // Huvudkategori; behåller kompatibilitet med befintliga produkter.
        category: {
            type: String,
            required: [true, "Product category is required."],
            trim: true,
            minlength: 1,
            maxlength: 100,
        },
        // Hela kategorisökvägen från huvudkategori till sista nivån.
        categoryPath: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length <= 20 && arr.every((item) => typeof item === "string" && item.trim().length > 0 && item.trim().length <= 100),
                message: "Category path must contain no more than 20 valid category levels.",
            },
        },
        // Sista nivån i categoryPath.
        subCategory: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative."],
            validate: {
                validator: Number.isInteger,
                message: "Stock must be a whole number.",
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ categoryPath: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ sku: 1 });

// Synkronisera kategorifälten före Mongoose-validering.
productSchema.pre("validate", function () {
    if (Array.isArray(this.categoryPath)) {
        this.categoryPath = this.categoryPath
            .map((item) => typeof item === "string" ? item.trim() : item)
            .filter((item) => typeof item === "string" && item.length > 0);
    }

    if (this.categoryPath.length > 0) {
        this.category = this.categoryPath[0];
        this.subCategory = this.categoryPath[this.categoryPath.length - 1];
    } else if (typeof this.category === "string" && this.category.trim()) {
        this.category = this.category.trim();
        this.categoryPath = [this.category];
        this.subCategory = this.category;
    } else {
        this.categoryPath = [];
        this.subCategory = "";
    }
});

export default mongoose.model("Product", productSchema);
