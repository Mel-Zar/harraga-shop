import User from "../models/User.js";

// =====================================================
// GET ALL USERS - ADMIN
// =====================================================
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select(
                "-password -refreshTokens -passwordHistory -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
            )
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.status(200).json(users);

    } catch (error) {
        console.error("GET USERS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch users",
        });
    }
};

// =====================================================
// GET SINGLE USER - ADMIN
// =====================================================
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select(
                "-password -refreshTokens -passwordHistory -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
            )
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("GET USER ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

// =====================================================
// UPDATE USER - ADMIN
// =====================================================
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

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

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // =========================
        // CLEAN VALUES
        // =========================
        const cleanEmail =
            email !== undefined
                ? email.toLowerCase().trim()
                : undefined;

        const cleanUsername =
            username !== undefined
                ? username.toLowerCase().trim()
                : undefined;

        // =========================
        // EMAIL VALIDATION
        // =========================
        if (cleanEmail !== undefined) {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    message: "Invalid email format",
                });
            }

            if (cleanEmail !== user.email) {
                const exists = await User.findOne({
                    email: cleanEmail,
                    _id: {
                        $ne: user._id,
                    },
                });

                if (exists) {
                    return res.status(400).json({
                        message: "Email already exists",
                    });
                }

                user.email = cleanEmail;
            }
        }

        // =========================
        // USERNAME CHECK
        // =========================
        if (
            cleanUsername !== undefined &&
            cleanUsername !== user.username
        ) {
            const exists = await User.findOne({
                username: cleanUsername,
                _id: {
                    $ne: user._id,
                },
            });

            if (exists) {
                return res.status(400).json({
                    message: "Username already exists",
                });
            }

            user.username = cleanUsername;
        }

        // =========================
        // BASIC INFO
        // =========================
        if (firstName !== undefined) {
            user.firstName =
                firstName.trim();
        }

        if (lastName !== undefined) {
            user.lastName =
                lastName.trim();
        }

        // =========================
        // ADDRESS
        // =========================
        if (address !== undefined) {
            user.address = address;
        }

        if (postalCode !== undefined) {
            user.postalCode = postalCode;
        }

        if (city !== undefined) {
            user.city = city;
        }

        if (country !== undefined) {
            user.country = country;
        }

        // =========================
        // ADMIN STATUS
        // =========================
        if (isAdmin !== undefined) {
            user.isAdmin = Boolean(isAdmin);
        }

        // =========================
        // VERIFIED STATUS
        // =========================
        if (isVerified !== undefined) {
            user.isVerified =
                Boolean(isVerified);
        }

        await user.save();

        const safeUser =
            await User.findById(id)
                .select(
                    "-password -refreshTokens -passwordHistory -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
                )
                .lean();

        return res.status(200).json({
            message: "User updated successfully",
            user: safeUser,
        });

    } catch (error) {
        console.error(
            "UPDATE USER ERROR:",
            error
        );

        return res.status(500).json({
            message: "Failed to update user",
        });
    }
};

// =====================================================
// DELETE USER - ADMIN
// =====================================================
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // =========================
        // PREVENT ADMIN FROM
        // DELETING THEMSELVES
        // =========================
        if (id === req.user.id.toString()) {
            return res.status(400).json({
                message:
                    "You cannot delete your own account.",
            });
        }

        const user =
            await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

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
            message: "Failed to delete user",
        });
    }
};

// =====================================================
// GET PROFILE
// =====================================================
export const getProfile = async (req, res) => {
    try {
        const user =
            await User.findById(req.user.id)
                .select(
                    "-password -refreshTokens -passwordHistory -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
                );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// =====================================================
// UPDATE PROFILE
// =====================================================
export const updateProfile = async (req, res) => {
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
            await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // =========================
        // CLEAN VALUES
        // =========================
        const cleanEmail =
            email?.toLowerCase().trim();

        const cleanUsername =
            username?.toLowerCase().trim();

        // =========================
        // EMAIL FORMAT VALIDATION
        // =========================
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            cleanEmail &&
            !emailRegex.test(cleanEmail)
        ) {
            return res.status(400).json({
                message:
                    "Invalid email format",
            });
        }

        // =========================
        // USERNAME CHECK
        // =========================
        if (
            cleanUsername &&
            cleanUsername !== user.username
        ) {
            const exists =
                await User.findOne({
                    username: cleanUsername,
                    _id: {
                        $ne: user._id,
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

        // =========================
        // EMAIL CHECK
        // =========================
        if (
            cleanEmail &&
            cleanEmail !== user.email
        ) {
            const exists =
                await User.findOne({
                    email: cleanEmail,
                    _id: {
                        $ne: user._id,
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

        // =========================
        // UPDATE OTHER FIELDS
        // =========================
        user.firstName =
            firstName?.trim() ??
            user.firstName;

        user.lastName =
            lastName?.trim() ??
            user.lastName;

        user.address =
            address ?? user.address;

        user.postalCode =
            postalCode ??
            user.postalCode;

        user.city =
            city ?? user.city;

        user.country =
            country ?? user.country;

        await user.save();

        return res.status(200).json({
            message:
                "Profile updated",

            user: {
                id: user._id,
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
            },
        });

    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};