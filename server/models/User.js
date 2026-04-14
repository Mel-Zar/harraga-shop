const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: "",
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },

        // =========================
        // 📧 EMAIL VERIFICATION (FIXED STEP 4)
        // =========================
        isVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpire: {
            type: Date,
        },

        // =========================
        // 🔐 RESET PASSWORD
        // =========================
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpire: {
            type: Date,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
