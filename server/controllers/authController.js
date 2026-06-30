import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, sendResetPasswordEmail } from "../utils/mailer.js";
import axios from "axios";

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
export const register = async (req, res) => {
    try {
        let {
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
            website,
            captchaToken
        } = req.body;

        email = email?.toLowerCase().trim();
        username = username?.toLowerCase().trim();

        if (website && website.trim() !== "") {
            return res.status(400).json({ message: "Bot detected" });
        }

        if (!captchaToken) {
            return res.status(400).json({ message: "Captcha required" });
        }

        const captchaRes = await axios.post(
            "https://hcaptcha.com/siteverify",
            new URLSearchParams({
                secret: process.env.HCAPTCHA_SECRET,
                response: captchaToken,
            })
        );

        if (!captchaRes.data.success) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

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

        password = (password || "").trim();

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);

        if (!hasNumber) {
            return res.status(400).json({
                message: "Password must contain at least 1 number"
            });
        }

        if (!hasSpecial) {
            return res.status(400).json({
                message: "Password must contain at least 1 special character"
            });
        }

        if (!hasUppercase) {
            return res.status(400).json({
                message: "Password must contain at least 1 uppercase letter"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or username exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            address,
            postalCode,
            city,
            country,
            isVerified: false,
            passwordHistory: [{
                password: hashedPassword,
                changedAt: new Date(),
            }],
        });

        const verificationToken = crypto.randomBytes(32).toString("hex");

        user.emailVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${user._id}/${verificationToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: `<a href="${verifyUrl}">Verify Email</a>`,
            });

            console.log("✅ Verification email sent");
        } catch (mailError) {
            // Registreringen ska fortfarande lyckas även om mejlet inte går att skicka
            console.error("❌ Failed to send verification email:", mailError);
        }

        return res.status(201).json({
            message: "User created",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// LOGIN
// =====================================================
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

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

        if (!user.isVerified) {
            return res.status(401).json({
                message: "Please verify your email before login",
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.json({
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
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
export const refreshToken = async (req, res) => {
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
export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (token) {
            const user = await User.findOne({ refreshTokens: token });

            if (user) {
                user.refreshTokens = user.refreshTokens.filter(t => t !== token);
                await user.save();
            }
        }

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
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

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

        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

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
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "Password and confirmPassword are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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
export const verifyEmail = async (req, res) => {
    try {
        const { userId, token } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "Invalid user" });
        }

        if (user.isVerified) {
            return res.json({ message: "Email already verified" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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
export const resendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

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