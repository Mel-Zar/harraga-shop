const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const countryMap = require("../../shared/countries.json");
const { sendEmail, sendResetPasswordEmail } = require("../utils/mailer");

// =====================================================
// TOKEN HELPERS
// =====================================================
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

// =====================================================
// REGISTER
// =====================================================
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
            country,
        } = req.body;

        // =============================
        // BASIC VALIDATION (oförändrat)
        // =============================
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

        // =============================
        // EMAIL FORMAT CHECK
        // =============================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        // =============================
        // USERNAME VALIDATION
        // =============================
        const usernameHasLetter = /[a-zA-Z]/.test(username);
        if (!usernameHasLetter) {
            return res.status(400).json({
                message: "Username must contain at least one letter",
            });
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: "Username can only contain letters, numbers and underscore",
            });
        }

        // =============================
        // ❗ FIX: CHECK EMAIL & USERNAME SEPARATELY (VIKTIG DEL)
        // =============================
        const emailExists = await User.findOne({
            email: email.toLowerCase(),
        });

        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const usernameExists = await User.findOne({
            username: username.toLowerCase(),
        });

        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists",
            });
        }

        // =============================
        // CREATE USER (oförändrat)
        // =============================
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username.toLowerCase(),
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            address,
            postalCode,
            city,
            country,
            isVerified: false,
            passwordHistory: [
                {
                    password: hashedPassword,
                    changedAt: new Date(),
                },
            ],
        });

        const verificationToken = crypto.randomBytes(32).toString("hex");

        user.emailVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${user._id}/${verificationToken}`;

        await sendEmail({
            to: user.email,
            subject: "Verify your email",
            html: `<a href="${verifyUrl}">Verify Email</a>`,
        });

        return res.status(201).json({
            message: "User created",
        });
    } catch (err) {
        console.error(err);

        // =============================
        // FALLBACK SAFETY (om Mongo ändå triggar duplicate)
        // =============================
        if (err.code === 11000) {
            if (err.keyPattern?.email) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }

            if (err.keyPattern?.username) {
                return res.status(400).json({
                    message: "Username already exists",
                });
            }

            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                message: `${field} already exists`,
            });
        }

        return res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// LOGIN (JWT + REFRESH COOKIE)
// =====================================================
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // ✅ extra validation
        if (!identifier || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() },
            ],
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ VERIFY CHECK (frontend expects this)
        if (!user.isVerified) {
            return res.status(401).json({
                message: "Please verify your email before login",
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // save refresh token in DB
        user.refreshTokens.push(refreshToken);
        await user.save();

        // httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // true i production (https)
            sameSite: "lax",
            path: "/",
        });

        return res.json({
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// REFRESH TOKEN
// =====================================================
exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "No refresh token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(token)) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user._id);

        return res.json({
            accessToken: newAccessToken,
        });
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

// =====================================================
// LOGOUT
// =====================================================
exports.logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (token) {
            const user = await User.findOne({
                refreshTokens: token,
            });

            if (user) {
                user.refreshTokens = user.refreshTokens.filter(
                    (t) => t !== token
                );
                await user.save();
            }
        }

        // ✅ clear cookie safely
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Viktigt: avslöja inte om användare finns eller inte
        if (!user) {
            return res.json({
                message: "If the email exists, a reset link has been sent",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minuter

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendResetPasswordEmail(user.email, resetUrl);

        return res.json({
            message: "If the email exists, a reset link has been sent",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// RESET PASSWORD
// =====================================================
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res
                .status(400)
                .json({ message: "Password and confirmPassword are required" });
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
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        if (!user.passwordHistory) user.passwordHistory = [];
        user.passwordHistory.push({
            password: hashedPassword,
            changedAt: new Date(),
        });

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// VERIFY EMAIL
// =====================================================
exports.verifyEmail = async (req, res) => {
    try {
        const { userId, token } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "Invalid user" });
        }

        // ✅ IMPORTANT: frontend expects this exact message
        if (user.isVerified) {
            return res.json({ message: "Email already verified" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        if (
            user.emailVerificationToken !== hashedToken ||
            user.emailVerificationExpire < Date.now()
        ) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        return res.json({ message: "Email verified successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// RESEND VERIFY EMAIL
// =====================================================
exports.resendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Viktigt: avslöja inte om användare finns eller inte
        if (!user) {
            return res.json({
                message: "If the email exists, a verification link was sent",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        user.emailVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${user._id}/${verificationToken}`;

        await sendEmail({
            to: user.email,
            subject: "Verify your email",
            html: `<a href="${verifyUrl}">Verify Email</a>`,
        });

        return res.json({
            message: "If the email exists, a verification link was sent",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
