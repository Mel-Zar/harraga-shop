const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ IMPORT SHARED JSON (OBJECT)
const countryMap = require("../../shared/countries.json");

// ✅ EMAIL UTILS
const { sendWelcomeEmail, sendResetPasswordEmail } = require("../utils/mailer");

// =========================
// 🔐 TOKEN
// =========================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// =========================
// 🟢 REGISTER
// =========================
exports.register = async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            address,
            postalCode,
            city,
            country
        } = req.body;

        if (
            !username ||
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !address ||
            !postalCode ||
            !city ||
            !country
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanCountry = country.trim();

        // ✅ FIX: validate country properly
        const allowedCountries = Object.keys(countryMap);

        if (!allowedCountries.includes(cleanCountry)) {
            return res.status(400).json({ message: "Invalid country selected" });
        }

        const usernameExists = await User.findOne({ username: cleanUsername });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const emailExists = await User.findOne({ email: cleanEmail });
        if (emailExists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: cleanUsername,
            firstName,
            lastName,
            email: cleanEmail,
            password: hashedPassword,
            address,
            postalCode,
            city,
            country: cleanCountry
        });

        console.log("✅ User registered:", user.email);

        // =========================
        // 📧 SEND WELCOME EMAIL
        // =========================
        try {
            await sendWelcomeEmail(user.email, user.firstName);
            console.log("✅ Welcome email sent to:", user.email);
        } catch (mailErr) {
            console.error("❌ Welcome email failed:", mailErr.message || mailErr);
            // best practice: do NOT block registration if email fails
        }

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("🔥 REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// 🔵 LOGIN
// =========================
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const cleanIdentifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { username: cleanIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("🔥 LOGIN ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// 🟠 FORGOT PASSWORD
// =========================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        // 🔥 security: always return success even if user not found
        if (!user) {
            return res.json({ message: "If email exists, reset link will be sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

        await user.save();

        // =========================
        // 📧 SEND RESET EMAIL
        // =========================
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendResetPasswordEmail(user.email, resetUrl);
            console.log("✅ Reset password email sent to:", user.email);
        } catch (mailErr) {
            console.error("❌ Reset password email failed:", mailErr.message || mailErr);
            // best practice: still return success response for security
        }

        return res.json({
            message: "If email exists, reset link will be sent"
        });

    } catch (error) {
        console.error("🔥 FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// 🔴 RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.json({ message: "Password reset successful" });

    } catch (error) {
        console.error("🔥 RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
