import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
            minlength: 3,
            maxlength: 50,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 320,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        // MAIN ADDRESS (profil)
        address: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 500,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        country: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
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


// =====================================================
// 🔐 HASH PASSWORD BEFORE SAVE
// =====================================================

userSchema.pre(
    "save",
    async function () {

        // Password has not changed
        // so there is nothing to hash.
        if (
            !this.isModified(
                "password"
            )
        ) {
            return;
        }

        try {

            // =============================================
            // PREVENT DOUBLE HASHING
            // =============================================

            const isAlreadyHashed =
                /^\$2[aby]\$\d{2}\$/.test(
                    this.password
                );

            if (
                isAlreadyHashed
            ) {
                return;
            }

            // =============================================
            // HASH PASSWORD
            // =============================================

            const salt =
                await bcrypt.genSalt(
                    12
                );

            this.password =
                await bcrypt.hash(
                    this.password,
                    salt
                );

        } catch (error) {

            throw error;

        }
    }
);


// =====================================================
// 🔐 PASSWORD VALIDATION HELPER
// =====================================================

userSchema.methods.comparePassword =
    async function (
        candidatePassword
    ) {

        return bcrypt.compare(
            candidatePassword,
            this.password
        );

    };


export default mongoose.model(
    "User",
    userSchema
);