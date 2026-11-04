
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import {
    generateSecret,
    generateURI,
    verify,
} from "otplib";

// =====================================================
// CONFIGURATION
// =====================================================

const ISSUER = "Harraga Shop";

const RECOVERY_CODE_COUNT = 10;

// =====================================================
// HELPERS
// =====================================================

const generateRecoveryCodes = () => {
    return Array.from(
        { length: RECOVERY_CODE_COUNT },
        () => crypto.randomBytes(5).toString("hex").toUpperCase()
    );
};

const verifyTotp = async (secret, token) => {
    const result = await verify({
        secret,
        token: String(token),
    });

    return result.valid === true;
};

// =====================================================
// SETUP 2FA
// =====================================================

export const setupTwoFactor = async (req, res) => {
    try {
        const userId = req.twoFactorUserId || req.user?.id;

        const user = await User.findById(userId)
            .select("+twoFactorSecret");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                message: "Two-factor authentication is already enabled",
            });
        }

        const secret = generateSecret();

        const uri = generateURI({
            issuer: ISSUER,
            label: user.email,
            secret,
        });

        const qrCode = await QRCode.toDataURL(uri);

        user.twoFactorSecret = secret;
        user.twoFactorEnabled = false;

        await user.save();

        return res.json({
            message: "Scan the QR code with your authenticator app",
            qrCode,
            manualSecret: secret,
        });

    } catch (error) {
        console.error("2FA SETUP ERROR:", error);

        return res.status(500).json({
            message: "Could not set up two-factor authentication",
        });
    }
};

// =====================================================
// ENABLE 2FA
// =====================================================

export const enableTwoFactor = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Authentication code is required",
            });
        }

        const userId = req.twoFactorUserId || req.user?.id;

        const user = await User.findById(userId)
            .select("+twoFactorSecret");

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({
                message: "Please set up two-factor authentication first",
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                message: "Two-factor authentication is already enabled",
            });
        }

        const valid = await verifyTotp(
            user.twoFactorSecret,
            token
        );

        if (!valid) {
            return res.status(400).json({
                message: "Invalid authentication code",
            });
        }

        const recoveryCodes = generateRecoveryCodes();

        user.twoFactorRecoveryCodes = await Promise.all(
            recoveryCodes.map(async (code) => {
                return bcrypt.hash(code, 12);
            })
        );

        user.twoFactorEnabled = true;
        user.twoFactorVerifiedAt = new Date();

        await user.save();

        return res.json({
            message: "Two-factor authentication enabled",
            recoveryCodes,
        });

    } catch (error) {
        console.error("2FA ENABLE ERROR:", error);

        return res.status(500).json({
            message: "Could not enable two-factor authentication",
        });
    }
};

// =====================================================
// DISABLE 2FA
// =====================================================

export const disableTwoFactor = async (req, res) => {
    try {
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({
                message: "Password and authentication code are required",
            });
        }

        const user = await User.findById(req.user.id)
            .select("+twoFactorSecret +password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.isAdmin) {
            return res.status(403).json({
                message: "Administrators cannot disable two-factor authentication",
            });
        }

        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({
                message: "Two-factor authentication is not enabled",
            });
        }

        const passwordValid = await user.comparePassword(password);

        if (!passwordValid) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const tokenValid = await verifyTotp(
            user.twoFactorSecret,
            token
        );

        if (!tokenValid) {
            return res.status(400).json({
                message: "Invalid authentication code",
            });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorRecoveryCodes = [];
        user.twoFactorVerifiedAt = undefined;

        await user.save();

        return res.json({
            message: "Two-factor authentication disabled",
        });

    } catch (error) {
        console.error("2FA DISABLE ERROR:", error);

        return res.status(500).json({
            message: "Could not disable two-factor authentication",
        });
    }
};

// =====================================================
// TWO-FACTOR LOGIN VERIFICATION
// =====================================================

export const verifyTwoFactorLogin = async (req, res) => {
    try {
        const { token, recoveryCode } = req.body;

        if (!token && !recoveryCode) {
            return res.status(400).json({
                message: "Authentication code or recovery code is required",
            });
        }

        let user = await User.findById(req.twoFactorUserId)
            .select("+twoFactorSecret +twoFactorRecoveryCodes");

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(401).json({
                message: "Two-factor authentication is not enabled",
            });
        }

        let valid = false;

        // =============================================
        // VERIFY AUTHENTICATOR CODE
        // =============================================

        if (token) {
            valid = await verifyTotp(
                user.twoFactorSecret,
                token
            );
        }

        // =============================================
        // VERIFY AND CONSUME RECOVERY CODE
        // =============================================

        if (!valid && recoveryCode) {
            const cleanCode = String(recoveryCode)
                .trim()
                .toUpperCase();

            for (const hashedCode of user.twoFactorRecoveryCodes || []) {
                const matches = await bcrypt.compare(
                    cleanCode,
                    hashedCode
                );

                if (matches) {
                    // Atomically remove the recovery code.
                    // A code that has already been consumed
                    // cannot be used by another request.

                    const updatedUser = await User.findOneAndUpdate(
                        {
                            _id: user._id,
                            twoFactorRecoveryCodes: hashedCode,
                        },
                        {
                            $pull: {
                                twoFactorRecoveryCodes: hashedCode,
                            },
                        },
                        {
                            new: true,
                        }
                    ).select(
                        "+twoFactorSecret +twoFactorRecoveryCodes"
                    );

                    if (updatedUser) {
                        // Use the updated document so that
                        // saving refresh tokens cannot restore
                        // an already consumed recovery code.

                        user = updatedUser;
                        valid = true;
                    } else {
                        valid = false;
                    }

                    break;
                }
            }
        }

        // =============================================
        // REJECT INVALID CODE
        // =============================================

        if (!valid) {
            return res.status(401).json({
                message: "Invalid authentication or recovery code",
            });
        }

        // =============================================
        // GENERATE LOGIN TOKENS
        // =============================================

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        if (!Array.isArray(user.refreshTokens)) {
            user.refreshTokens = [];
        }

        user.refreshTokens.push(refreshToken);

        await user.save();

        // =============================================
        // SET REFRESH TOKEN COOKIE
        // =============================================

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        // =============================================
        // LOGIN RESPONSE
        // =============================================

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

    } catch (error) {
        console.error("2FA LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Could not verify two-factor authentication",
        });
    }
};
