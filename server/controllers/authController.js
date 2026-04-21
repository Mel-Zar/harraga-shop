const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const countryMap = require("../../shared/countries.json");
const { sendEmail, sendResetPasswordEmail } = require("../utils/mailer");

// =========================
// TOKEN
// =========================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =========================
// REGISTER
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

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

        if (!hasNumber || !hasSpecial) {
            return res.status(400).json({
                message: "Password must contain at least 1 number and 1 special character"
            });
        }

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanCountry = country.trim();

        if (!Object.keys(countryMap).includes(cleanCountry)) {
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
            country: cleanCountry,
            isVerified: false
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
            subject: "Verify your email - Harraga Shop",
            html: `
                <div style="font-family:Arial, sans-serif; padding:20px; background:#f9f9f9;">
                    <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px;">
                        <h2 style="color:#111;">Verify your account</h2>
                        <p>Click the button below to verify your email:</p>

                        <a href="${verifyUrl}"
                           style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
                           Verify Email
                        </a>

                        <p style="margin-top:20px;font-size:12px;color:gray;">
                            This link expires in 24 hours.
                        </p>
                    </div>
                </div>
            `
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            username: user.username,
            token: generateToken(user._id),
            isVerified: user.isVerified
        });

    } catch (err) {
        console.error("🔥 REGISTER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// VERIFY EMAIL
// =========================
exports.verifyEmail = async (req, res) => {
    try {
        const { userId, token } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: "Email already verified" });
        }

        const hashed = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        if (user.emailVerificationToken !== hashed) {
            return res.status(400).json({ message: "Invalid token" });
        }

        if (user.emailVerificationExpire < Date.now()) {
            return res.status(400).json({ message: "Token expired" });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        console.error("🔥 VERIFY ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// 🔁 RESEND VERIFY EMAIL
// =========================
exports.resendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: "Email already verified" });
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
            subject: "Verify your email - Harraga Shop",
            html: `
                <div style="font-family:Arial, sans-serif; padding:20px; background:#f9f9f9;">
                    <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px;">
                        <h2 style="color:#111;">Verify your account</h2>
                        <p>Click the button below to verify your email:</p>

                        <a href="${verifyUrl}"
                           style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
                           Verify Email
                        </a>

                        <p style="margin-top:20px;font-size:12px;color:gray;">
                            This link expires in 24 hours.
                        </p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({ message: "Verification email sent again" });

    } catch (error) {
        console.error("🔥 RESEND VERIFY ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
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
                message: "Please verify your email before logging in"
            });
        }

        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            token: generateToken(user._id)
        });

    } catch (err) {
        console.error("🔥 LOGIN ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// FORGOT PASSWORD
// =========================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // 🔥 NU gör vi exakt som du vill
        if (!user) {
            return res.status(404).json({
                message: "No account registered with this email"
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

        return res.status(200).json({
            message: "Reset link sent to your email"
        });

    } catch (err) {
        console.error("🔥 FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

        if (!hasNumber || !hasSpecial) {
            return res.status(400).json({
                message: "Password must contain at least 1 number and 1 special character"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
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

        res.json({ message: "Password reset successful" });

    } catch (err) {
        console.error("🔥 RESET PASSWORD ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
