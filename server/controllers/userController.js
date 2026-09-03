import User from "../models/User.js";
import bcrypt from "bcryptjs";

// =====================================================
// 🔒 SAFE USER SELECT
// =====================================================

const SAFE_USER_FIELDS =
    "-password " +
    "-refreshTokens " +
    "-passwordHistory " +
    "-emailVerificationToken " +
    "-emailVerificationExpire " +
    "-resetPasswordToken " +
    "-resetPasswordExpire";

// =====================================================
// 🧹 CLEAN STRING
// =====================================================

const cleanString = (
    value
) => {

    if (
        typeof value !== "string"
    ) {
        return value;
    }

    return value.trim();
};

// =====================================================
// 📧 EMAIL VALIDATION
// =====================================================

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =====================================================
// 👑 GET ALL USERS
// =====================================================

export const getUsers = async (
    req,
    res
) => {

    try {

        const users =
            await User.find()
                .select(
                    SAFE_USER_FIELDS
                )
                .sort({
                    createdAt: -1,
                })
                .lean();

        return res.status(200).json(
            users
        );

    } catch (error) {

        console.error(
            "GET USERS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch users",
        });
    }
};

// =====================================================
// 👑 GET SINGLE USER
// =====================================================

export const getUserById = async (
    req,
    res
) => {

    try {

        const { id } =
            req.params;

        const user =
            await User.findById(id)
                .select(
                    SAFE_USER_FIELDS
                )
                .lean();

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        return res.status(200).json(
            user
        );

    } catch (error) {

        console.error(
            "GET USER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch user",
        });
    }
};

// =====================================================
// 👑 UPDATE USER
// =====================================================

export const updateUser = async (
    req,
    res
) => {

    try {

        const { id } =
            req.params;

        const {
            firstName,
            lastName,
            username,
            email,
            address,
            postalCode,
            city,
            country,
            isAdmin,
            isVerified,
        } = req.body;

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        // =================================================
        // 👑 PREVENT ADMIN FROM REMOVING OWN ADMIN STATUS
        // =================================================

        if (
            req.user?.id?.toString() ===
            user._id.toString() &&
            isAdmin !== undefined &&
            Boolean(isAdmin) === false
        ) {
            return res.status(400).json({
                message:
                    "You cannot remove your own admin access.",
            });
        }

        // =================================================
        // 🧹 CLEAN EMAIL
        // =================================================

        const cleanEmail =
            email !== undefined
                ? String(email)
                    .toLowerCase()
                    .trim()
                : undefined;

        // =================================================
        // 🧹 CLEAN USERNAME
        // =================================================

        const cleanUsername =
            username !== undefined
                ? String(username)
                    .toLowerCase()
                    .trim()
                : undefined;

        // =================================================
        // 📧 EMAIL VALIDATION
        // =================================================

        if (
            cleanEmail !== undefined
        ) {

            if (
                !emailRegex.test(
                    cleanEmail
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid email format",
                });
            }

            if (
                cleanEmail !==
                user.email
            ) {

                const exists =
                    await User.findOne({
                        email:
                            cleanEmail,

                        _id: {
                            $ne:
                                user._id,
                        },
                    });

                if (exists) {
                    return res.status(400).json({
                        message:
                            "Email already exists",
                    });
                }

                user.email =
                    cleanEmail;
            }
        }

        // =================================================
        // 👤 USERNAME VALIDATION
        // =================================================

        if (
            cleanUsername !==
            undefined
        ) {

            if (
                cleanUsername.length <
                3
            ) {
                return res.status(400).json({
                    message:
                        "Username must be at least 3 characters.",
                });
            }

            if (
                cleanUsername !==
                user.username
            ) {

                const exists =
                    await User.findOne({
                        username:
                            cleanUsername,

                        _id: {
                            $ne:
                                user._id,
                        },
                    });

                if (exists) {
                    return res.status(400).json({
                        message:
                            "Username already exists",
                    });
                }

                user.username =
                    cleanUsername;
            }
        }

        // =================================================
        // 👤 BASIC INFO
        // =================================================

        if (
            firstName !==
            undefined
        ) {
            user.firstName =
                cleanString(
                    firstName
                );
        }

        if (
            lastName !==
            undefined
        ) {
            user.lastName =
                cleanString(
                    lastName
                );
        }

        // =================================================
        // 📍 ADDRESS
        // =================================================

        if (
            address !==
            undefined
        ) {
            user.address =
                cleanString(
                    address
                );
        }

        if (
            postalCode !==
            undefined
        ) {
            user.postalCode =
                cleanString(
                    postalCode
                );
        }

        if (
            city !==
            undefined
        ) {
            user.city =
                cleanString(
                    city
                );
        }

        if (
            country !==
            undefined
        ) {
            user.country =
                cleanString(
                    country
                );
        }

        // =================================================
        // 👑 ADMIN STATUS
        // =================================================

        if (
            isAdmin !==
            undefined
        ) {
            user.isAdmin =
                Boolean(
                    isAdmin
                );
        }

        // =================================================
        // ✉️ VERIFIED STATUS
        // =================================================

        if (
            isVerified !==
            undefined
        ) {
            user.isVerified =
                Boolean(
                    isVerified
                );
        }

        await user.save();

        // =================================================
        // SAFE RESPONSE USER
        // =================================================

        const safeUser =
            await User.findById(
                user._id
            )
                .select(
                    SAFE_USER_FIELDS
                )
                .lean();

        return res.status(200).json({
            message:
                "User updated successfully",

            user:
                safeUser,
        });

    } catch (error) {

        console.error(
            "UPDATE USER ERROR:",
            error
        );

        // =================================================
        // MONGOOSE DUPLICATE KEY
        // =================================================

        if (
            error?.code === 11000
        ) {

            const field =
                Object.keys(
                    error.keyPattern ||
                    {}
                )[0];

            return res.status(400).json({
                message:
                    `${field || "Value"} already exists`,
            });
        }

        return res.status(500).json({
            message:
                "Failed to update user",
        });
    }
};

// =====================================================
// 👑 DELETE USER
// =====================================================

export const deleteUser = async (
    req,
    res
) => {

    try {

        const { id } =
            req.params;

        // =================================================
        // 🔒 PREVENT SELF DELETE
        // =================================================

        if (
            id.toString() ===
            req.user.id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot delete your own account.",
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        await User.findByIdAndDelete(
            id
        );

        return res.status(200).json({
            message:
                "User deleted successfully",
        });

    } catch (error) {

        console.error(
            "DELETE USER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete user",
        });
    }
};

// =====================================================
// 👤 GET PROFILE
// =====================================================

export const getProfile = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.user.id
            ).select(
                SAFE_USER_FIELDS
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        return res.status(200).json(
            user
        );

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// 👤 UPDATE PROFILE
// =====================================================

export const updateProfile = async (
    req,
    res
) => {

    try {

        const {
            firstName,
            lastName,
            username,
            email,
            address,
            postalCode,
            city,
            country,
        } = req.body;

        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        // =================================================
        // 🧹 CLEAN VALUES
        // =================================================

        const cleanEmail =
            email !== undefined
                ? String(email)
                    .toLowerCase()
                    .trim()
                : undefined;

        const cleanUsername =
            username !== undefined
                ? String(username)
                    .toLowerCase()
                    .trim()
                : undefined;

        // =================================================
        // 📧 EMAIL VALIDATION
        // =================================================

        if (
            cleanEmail !==
            undefined
        ) {

            if (
                !emailRegex.test(
                    cleanEmail
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid email format",
                });
            }

            if (
                cleanEmail !==
                user.email
            ) {

                const exists =
                    await User.findOne({
                        email:
                            cleanEmail,

                        _id: {
                            $ne:
                                user._id,
                        },
                    });

                if (exists) {
                    return res.status(400).json({
                        message:
                            "Email already exists",
                    });
                }

                user.email =
                    cleanEmail;
            }
        }

        // =================================================
        // 👤 USERNAME VALIDATION
        // =================================================

        if (
            cleanUsername !==
            undefined
        ) {

            if (
                cleanUsername.length <
                3
            ) {
                return res.status(400).json({
                    message:
                        "Username must be at least 3 characters.",
                });
            }

            if (
                cleanUsername !==
                user.username
            ) {

                const exists =
                    await User.findOne({
                        username:
                            cleanUsername,

                        _id: {
                            $ne:
                                user._id,
                        },
                    });

                if (exists) {
                    return res.status(400).json({
                        message:
                            "Username already exists",
                    });
                }

                user.username =
                    cleanUsername;
            }
        }

        // =================================================
        // 👤 BASIC INFO
        // =================================================

        if (
            firstName !==
            undefined
        ) {
            user.firstName =
                cleanString(
                    firstName
                );
        }

        if (
            lastName !==
            undefined
        ) {
            user.lastName =
                cleanString(
                    lastName
                );
        }

        // =================================================
        // 📍 ADDRESS
        // =================================================

        if (
            address !==
            undefined
        ) {
            user.address =
                cleanString(
                    address
                );
        }

        if (
            postalCode !==
            undefined
        ) {
            user.postalCode =
                cleanString(
                    postalCode
                );
        }

        if (
            city !==
            undefined
        ) {
            user.city =
                cleanString(
                    city
                );
        }

        if (
            country !==
            undefined
        ) {
            user.country =
                cleanString(
                    country
                );
        }

        await user.save();

        // =================================================
        // SAFE USER RESPONSE
        // =================================================

        const safeUser = {
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

            address:
                user.address,

            postalCode:
                user.postalCode,

            city:
                user.city,

            country:
                user.country,

            isAdmin:
                user.isAdmin,

            isVerified:
                user.isVerified,
        };

        return res.status(200).json({
            message:
                "Profile updated",

            user:
                safeUser,
        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        // =================================================
        // MONGOOSE DUPLICATE KEY
        // =================================================

        if (
            error?.code === 11000
        ) {

            const field =
                Object.keys(
                    error.keyPattern ||
                    {}
                )[0];

            return res.status(400).json({
                message:
                    `${field || "Value"} already exists`,
            });
        }

        return res.status(500).json({
            message:
                "Server error",
        });
    }
};

// =====================================================
// 🔐 CHANGE PASSWORD
// =====================================================

export const changePassword = async (
    req,
    res
) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        // =================================================
        // 🔐 VALIDATION
        // =================================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message:
                    "All fields are required.",
            });
        }

        // =================================================
        // 🔐 CONFIRM PASSWORD
        // =================================================

        if (
            newPassword !==
            confirmPassword
        ) {
            return res.status(400).json({
                message:
                    "Passwords do not match.",
            });
        }

        // =================================================
        // 🔐 PASSWORD LENGTH
        // =================================================

        if (
            newPassword.length < 6
        ) {
            return res.status(400).json({
                message:
                    "New password must be at least 6 characters.",
            });
        }

        // =================================================
        // 👤 FIND CURRENT USER
        // =================================================

        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }

        // =================================================
        // 🔐 CHECK CURRENT PASSWORD
        // =================================================

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!passwordMatches) {
            return res.status(400).json({
                message:
                    "Current password is incorrect.",
            });
        }

        // =================================================
        // 🔐 PREVENT SAME PASSWORD
        // =================================================

        const samePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password must be different from your current password.",
            });
        }

        // =================================================
        // 🔐 UPDATE PASSWORD
        // =================================================

        user.password =
            newPassword;

        await user.save();

        return res.status(200).json({
            message:
                "Password updated successfully!",
        });

    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to change password.",
        });
    }
};