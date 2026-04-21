const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, lowercase: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },

        address: { type: String, required: true },
        postalCode: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },

        isAdmin: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },

        emailVerificationToken: String,
        emailVerificationExpire: Date,

        resetPasswordToken: String,
        resetPasswordExpire: Date,

        passwordHistory: [
            {
                password: String,
                changedAt: { type: Date, default: Date.now },
            },
        ],

        // 🔥 REFRESH TOKENS
        refreshTokens: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
