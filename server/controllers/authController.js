import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
    sendEmail,
    sendResetPasswordEmail,
} from "../utils/mailer.js";
import axios from "axios";

// =====================================================
// TOKEN HELPERS
// =====================================================

const generateAccessToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

const generateRefreshToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const validatePassword = (
    password
) => {

    if (
        typeof password !== "string"
    ) {
        return "Password is required";
    }

    if (
        password.length < 8
    ) {
        return "Password must be at least 8 characters";
    }

    const hasNumber =
        /\d/.test(password);

    const hasSpecial =
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
            password
        );

    const hasUppercase =
        /[A-Z]/.test(password);

    if (!hasNumber) {
        return "Password must contain at least 1 number";
    }

    if (!hasSpecial) {
        return "Password must contain at least 1 special character";
    }

    if (!hasUppercase) {
        return "Password must contain at least 1 uppercase letter";
    }

    return null;
};

// =====================================================
// EMAIL VALIDATION
// =====================================================

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =====================================================
// USERNAME VALIDATION
// =====================================================

const usernameRegex = /^[a-z0-9_]{3,20}$/;

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
            captchaToken,
        } = req.body;

        // =================================================
        // VALIDATE INPUT TYPES
        // =================================================

        const stringFields = {
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
        };

        for (const [field, value] of Object.entries(stringFields)) {
            if (typeof value !== "string") {
                return res.status(400).json({
                    message: `Invalid or missing field: ${field}`,
                });
            }
        }

        // =================================================
        // NORMALIZE VALUES
        // =================================================

        username = username.trim().toLowerCase();
        email = email.trim().toLowerCase();

        firstName = firstName.trim();
        lastName = lastName.trim();
        address = address.trim();
        postalCode = postalCode.trim();
        city = city.trim();
        country = country.trim();

        // =================================================
        // HONEYPOT
        // =================================================

        if (
            typeof website === "string" &&
            website.trim() !== ""
        ) {
            return res.status(400).json({
                message: "Bot detected",
            });
        }

        // =================================================
        // CAPTCHA
        // =================================================

        if (
            typeof captchaToken !== "string" ||
            !captchaToken.trim()
        ) {
            return res.status(400).json({
                message: "Captcha required",
            });
        }

        if (!process.env.HCAPTCHA_SECRET) {
            console.error("HCAPTCHA_SECRET is missing.");

            return res.status(500).json({
                message: "CAPTCHA service is not configured.",
            });
        }

        const captchaRes = await axios.post(
            "https://api.hcaptcha.com/siteverify",
            new URLSearchParams({
                secret: process.env.HCAPTCHA_SECRET,
                response: captchaToken,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 10000,
            }
        );

        if (!captchaRes.data?.success) {
            return res.status(400).json({
                message: "Captcha verification failed",
            });
        }

        // =================================================
        // REQUIRED FIELDS
        // =================================================

        const requiredFields = {
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
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([, value]) => !value.trim())
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "All fields are required",
                fields: missingFields,
            });
        }

        // =================================================
        // USERNAME VALIDATION
        // =================================================

        const usernameRegex = /^[a-z0-9_]{3,20}$/;

        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message:
                    "Användarnamnet måste innehålla 3–20 tecken och endast bokstäver, siffror eller understreck.",
                field: "username",
            });
        }

        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(email) ||
            email.length > 320
        ) {
            return res.status(400).json({
                message: "Ange en giltig e-postadress.",
                field: "email",
            });
        }


        // =================================================
        // CONFIRM PASSWORD
        // =================================================

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Lösenorden matchar inte.",
                field: "confirmPassword",
            });
        }

        // =================================================
        // CLEAN PASSWORD
        // =================================================

        password = password.trim();

        if (!password) {
            return res.status(400).json({
                message: "Lösenordet får inte vara tomt.",
                field: "password",
            });
        }

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        const passwordError = validatePassword(password);

        if (passwordError) {
            return res.status(400).json({
                message: passwordError,
                field: "password",
            });
        }

        // =================================================
        // CHECK DUPLICATE USERNAME
        // =================================================

        const existingUsername = await User.findOne({
            username,
        }).select("_id");

        if (existingUsername) {
            return res.status(409).json({
                message: "Användarnamnet är redan upptaget.",
                field: "username",
                code: "USERNAME_EXISTS",
            });
        }

        // =================================================
        // CHECK DUPLICATE EMAIL
        // =================================================

        const existingEmail = await User.findOne({
            email,
        }).select("_id");

        if (existingEmail) {
            return res.status(409).json({
                message: "E-postadressen är redan registrerad.",
                field: "email",
                code: "EMAIL_EXISTS",
            });
        }

        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // =================================================
        // CREATE USER
        // =================================================

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

            passwordHistory: [
                {
                    password: hashedPassword,
                    changedAt: new Date(),
                },
            ],
        });

        // =================================================
        // EMAIL VERIFICATION TOKEN
        // =================================================

        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        user.emailVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationExpire =
            Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        // =================================================
        // VERIFICATION URL
        // =================================================

        const verifyUrl =
            `${process.env.FRONTEND_URL}/verify-email/${user._id}/${verificationToken}`;

        // =================================================
        // SEND VERIFICATION EMAIL
        // =================================================

        try {
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: `<a href="${verifyUrl}">Verify Email</a>`,
            });

            console.log("Verification email sent");
        } catch (mailError) {
            // Registration remains successful if email delivery fails.
            console.error(
                "Failed to send verification email:",
                mailError
            );
        }

        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({
            message: "User created",
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);

        // =================================================
        // DUPLICATE KEY PROTECTION
        // This also handles simultaneous registration attempts.
        // =================================================

        if (err?.code === 11000) {
            const duplicateField =
                Object.keys(err.keyPattern || {})[0] ||
                Object.keys(err.keyValue || {})[0];

            if (duplicateField === "username") {
                return res.status(409).json({
                    message: "Användarnamnet är redan upptaget.",
                    field: "username",
                    code: "USERNAME_EXISTS",
                });
            }

            if (duplicateField === "email") {
                return res.status(409).json({
                    message: "E-postadressen är redan registrerad.",
                    field: "email",
                    code: "EMAIL_EXISTS",
                });
            }

            return res.status(409).json({
                message: "Uppgiften finns redan registrerad.",
                code: "DUPLICATE_VALUE",
            });
        }

        if (err?.code === "ECONNABORTED") {
            return res.status(503).json({
                message: "CAPTCHA-tjänsten svarar inte. Försök igen.",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};


// =====================================================
// LOGIN
// =====================================================

export const login = async (
    req,
    res
) => {

    try {

        const {
            identifier,
            password,
        } = req.body;

        if (
            !identifier ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "All fields are required",
            });
        }

        const cleanIdentifier =
            identifier
                .toLowerCase()
                .trim();

        const user =
            await User.findOne({
                $or: [
                    {
                        email:
                            cleanIdentifier,
                    },
                    {
                        username:
                            cleanIdentifier,
                    },
                ],
            });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid credentials",
            });
        }

        // =================================================
        // CHECK PASSWORD
        // =================================================

        const match =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!match) {
            return res.status(401).json({
                message:
                    "Invalid credentials",
            });
        }

        // =================================================
        // EMAIL VERIFICATION
        // =================================================

        if (
            !user.isVerified
        ) {
            return res.status(401).json({
                message:
                    "Please verify your email before login",
            });
        }

        // =================================================
        // TOKENS
        // =================================================

        const accessToken =
            generateAccessToken(
                user._id
            );

        const refreshToken =
            generateRefreshToken(
                user._id
            );

        // =================================================
        // STORE REFRESH TOKEN
        // =================================================

        if (
            !Array.isArray(
                user.refreshTokens
            )
        ) {
            user.refreshTokens =
                [];
        }

        user.refreshTokens.push(
            refreshToken
        );

        await user.save();

        // =================================================
        // REFRESH TOKEN COOKIE
        // =================================================

        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            }
        );

        // =================================================
        // RESPONSE
        // =================================================

        return res.json({
            accessToken,

            user: {
                id:
                    user._id,
                username:
                    user.username,
                firstName:
                    user.firstName,
                lastName:
                    user.lastName,
                email:
                    user.email,
                isAdmin:
                    user.isAdmin,
                isVerified:
                    user.isVerified,
            },
        });

    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// REFRESH TOKEN
// =====================================================

export const refreshToken = async (
    req,
    res
) => {

    try {

        const token =
            req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message:
                    "No refresh token",
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET
            );

        const user =
            await User.findById(
                decoded.id
            );

        if (
            !user ||
            !Array.isArray(
                user.refreshTokens
            ) ||
            !user.refreshTokens.includes(
                token
            )
        ) {
            return res.status(403).json({
                message:
                    "Invalid refresh token",
            });
        }

        const newAccessToken =
            generateAccessToken(
                user._id
            );

        return res.json({
            accessToken:
                newAccessToken,
        });

    } catch (err) {

        console.error(
            "REFRESH TOKEN ERROR:",
            err
        );

        return res.status(403).json({
            message:
                "Invalid refresh token",
        });
    }
};

// =====================================================
// LOGOUT
// =====================================================

export const logout = async (
    req,
    res
) => {

    try {

        const token =
            req.cookies.refreshToken;

        if (token) {

            const user =
                await User.findOne({
                    refreshTokens:
                        token,
                });

            if (user) {

                user.refreshTokens =
                    user.refreshTokens.filter(
                        (t) =>
                            t !== token
                    );

                await user.save();
            }
        }

        // =================================================
        // CLEAR COOKIE
        // =================================================

        res.clearCookie(
            "refreshToken",
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            }
        );

        return res.json({
            message:
                "Logged out",
        });

    } catch (err) {

        console.error(
            "LOGOUT ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (
    req,
    res
) => {

    try {

        const {
            email,
        } = req.body;

        if (!email) {
            return res.status(400).json({
                message:
                    "Email is required",
            });
        }

        const cleanEmail =
            email
                .toLowerCase()
                .trim();

        const user =
            await User.findOne({
                email:
                    cleanEmail,
            });

        // =================================================
        // DO NOT REVEAL WHETHER EMAIL EXISTS
        // =================================================

        if (!user) {
            return res.json({
                message:
                    "If the email exists, a reset link has been sent",
            });
        }

        // =================================================
        // GENERATE RESET TOKEN
        // =================================================

        const resetToken =
            crypto
                .randomBytes(32)
                .toString("hex");

        user.resetPasswordToken =
            crypto
                .createHash("sha256")
                .update(
                    resetToken
                )
                .digest("hex");

        user.resetPasswordExpire =
            Date.now() +
            15 *
            60 *
            1000;

        await user.save();

        // =================================================
        // RESET URL
        // =================================================

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // =================================================
        // SEND EMAIL
        // =================================================

        await sendResetPasswordEmail(
            user.email,
            resetUrl
        );

        return res.json({
            message:
                "If the email exists, a reset link has been sent",
        });

    } catch (err) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (
    req,
    res
) => {

    try {

        const {
            token,
        } = req.params;

        const {
            password,
            confirmPassword,
        } = req.body;

        if (
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message:
                    "Password and confirmPassword are required",
            });
        }


        // =================================================
        // CONFIRM PASSWORD
        // =================================================

        if (
            password !==
            confirmPassword
        ) {
            return res.status(400).json({
                message:
                    "Passwords do not match",
            });
        }

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        const cleanPassword =
            password.trim();

        const passwordError =
            validatePassword(
                cleanPassword
            );

        if (passwordError) {
            return res.status(400).json({
                message:
                    passwordError,
            });
        }

        // =================================================
        // HASH RESET TOKEN
        // =================================================

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        // =================================================
        // FIND USER
        // =================================================

        const user =
            await User.findOne({
                resetPasswordToken:
                    hashedToken,

                resetPasswordExpire: {
                    $gt:
                        Date.now(),
                },
            });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid or expired token",
            });
        }

        // =================================================
        // PREVENT SAME PASSWORD
        // =================================================

        const samePassword =
            await bcrypt.compare(
                cleanPassword,
                user.password
            );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password must be different from your current password",
            });
        }

        // =================================================
        // HASH NEW PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                cleanPassword,
                12
            );

        // =================================================
        // UPDATE PASSWORD
        // =================================================

        user.password =
            hashedPassword;

        // =================================================
        // PASSWORD HISTORY
        // =================================================

        if (
            !Array.isArray(
                user.passwordHistory
            )
        ) {
            user.passwordHistory =
                [];
        }

        user.passwordHistory.push({
            password:
                hashedPassword,

            changedAt:
                new Date(),
        });

        // =================================================
        // KEEP PASSWORD HISTORY LIMITED
        // =================================================

        if (
            user.passwordHistory.length >
            5
        ) {
            user.passwordHistory =
                user.passwordHistory.slice(
                    -5
                );
        }

        // =================================================
        // CLEAR RESET TOKEN
        // =================================================

        user.resetPasswordToken =
            undefined;

        user.resetPasswordExpire =
            undefined;

        // =================================================
        // SAVE
        // =================================================

        await user.save();

        return res.json({
            message:
                "Password reset successful",
        });

    } catch (err) {

        console.error(
            "RESET PASSWORD ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// VERIFY EMAIL
// =====================================================

export const verifyEmail = async (
    req,
    res
) => {

    try {

        const {
            userId,
            token,
        } = req.params;

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid user",
            });
        }

        if (
            user.isVerified
        ) {
            return res.json({
                message:
                    "Email already verified",
            });
        }

        // =================================================
        // HASH VERIFICATION TOKEN
        // =================================================

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        // =================================================
        // VALIDATE TOKEN
        // =================================================

        if (
            user.emailVerificationToken !==
            hashedToken ||
            !user.emailVerificationExpire ||
            user.emailVerificationExpire <
            Date.now()
        ) {
            return res.status(400).json({
                message:
                    "Invalid or expired token",
            });
        }

        // =================================================
        // VERIFY USER
        // =================================================

        user.isVerified =
            true;

        user.emailVerificationToken =
            undefined;

        user.emailVerificationExpire =
            undefined;

        await user.save();

        return res.json({
            message:
                "Email verified successfully",
        });

    } catch (err) {

        console.error(
            "VERIFY EMAIL ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// RESEND VERIFY EMAIL
// =====================================================

export const resendVerifyEmail = async (
    req,
    res
) => {

    try {

        const {
            email,
        } = req.body;

        if (!email) {
            return res.status(400).json({
                message:
                    "Email is required",
            });
        }

        const cleanEmail =
            email
                .toLowerCase()
                .trim();

        const user =
            await User.findOne({
                email:
                    cleanEmail,
            });

        // =================================================
        // DO NOT REVEAL WHETHER EMAIL EXISTS
        // =================================================

        if (!user) {
            return res.json({
                message:
                    "If the email exists, a verification link was sent",
            });
        }

        if (
            user.isVerified
        ) {
            return res.status(400).json({
                message:
                    "Email already verified",
            });
        }

        // =================================================
        // GENERATE VERIFICATION TOKEN
        // =================================================

        const verificationToken =
            crypto
                .randomBytes(32)
                .toString("hex");

        user.emailVerificationToken =
            crypto
                .createHash("sha256")
                .update(
                    verificationToken
                )
                .digest("hex");

        user.emailVerificationExpire =
            Date.now() +
            24 *
            60 *
            60 *
            1000;

        await user.save();

        // =================================================
        // VERIFICATION URL
        // =================================================

        const verifyUrl =
            `${process.env.FRONTEND_URL}/verify-email/${user._id}/${verificationToken}`;

        // =================================================
        // SEND EMAIL
        // =================================================

        await sendEmail({
            to: user.email,

            subject:
                "Verify your email",

            html:
                `<a href="${verifyUrl}">Verify Email</a>`,
        });

        return res.json({
            message:
                "If the email exists, a verification link was sent",
        });

    } catch (err) {

        console.error(
            "RESEND VERIFY EMAIL ERROR:",
            err
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

export const checkRegistrationAvailability = async (req, res) => {
    try {
        let { username, email } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                available: false,
                message: "Användarnamn och e-postadress krävs.",
            });
        }

        username = username.trim().toLowerCase();
        email = email.trim().toLowerCase();

        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                available: false,
                field: "username",
                message: "Ogiltigt användarnamn.",
            });
        }

        if (!emailRegex.test(email) || email.length > 320) {
            return res.status(400).json({
                available: false,
                field: "email",
                message: "Ange en giltig e-postadress.",
            });
        }

        const [existingUsername, existingEmail] = await Promise.all([
            User.findOne({ username }).select("_id"),
            User.findOne({ email }).select("_id"),
        ]);

        if (existingUsername) {
            return res.status(409).json({
                available: false,
                field: "username",
                code: "USERNAME_EXISTS",
                message: "Användarnamnet är redan upptaget.",
            });
        }

        if (existingEmail) {
            return res.status(409).json({
                available: false,
                field: "email",
                code: "EMAIL_EXISTS",
                message: "E-postadressen är redan registrerad.",
            });
        }

        return res.status(200).json({
            available: true,
            message: "Användarnamn och e-postadress är lediga.",
        });

    } catch (err) {
        console.error(
            "CHECK REGISTRATION AVAILABILITY ERROR:",
            err
        );

        return res.status(500).json({
            available: false,
            message: "Kunde inte kontrollera uppgifterna. Försök igen.",
        });
    }
};