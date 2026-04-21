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
        res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// LOGIN (JWT + REFRESH COOKIE)
// =====================================================
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

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

        res.clearCookie("refreshToken");

        return res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
