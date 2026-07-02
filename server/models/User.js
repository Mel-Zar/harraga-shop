import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },
        fullName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        street: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        postalCode: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        // MAIN ADDRESS (profil)
        address: {
            type: String,
            required: true,
            trim: true,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
        },

        // MULTIPLE ADDRESSES (AddressBook)
        addresses: [addressSchema],

        isAdmin: {
            type: Boolean,
            default: false,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationToken: {
            type: String,
            default: undefined,
        },

        emailVerificationExpire: {
            type: Date,
            default: undefined,
        },

        resetPasswordToken: {
            type: String,
            default: undefined,
        },

        resetPasswordExpire: {
            type: Date,
            default: undefined,
        },

        passwordHistory: [
            {
                password: {
                    type: String,
                    required: true,
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        refreshTokens: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);