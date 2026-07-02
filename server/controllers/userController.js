import User from "../models/User.js";

// =====================================================
// GET PROFILE
// =====================================================
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password -refreshTokens -passwordHistory -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);

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

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // =========================
        // CLEAN VALUES
        // =========================
        const cleanEmail = email?.toLowerCase().trim();
        const cleanUsername = username?.toLowerCase().trim();

        // =========================
        // EMAIL FORMAT VALIDATION
        // =========================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (cleanEmail && !emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        // =========================
        // USERNAME CHECK
        // =========================
        if (cleanUsername && cleanUsername !== user.username) {
            const exists = await User.findOne({
                username: cleanUsername,
                _id: { $ne: user._id },
            });

            if (exists) {
                return res.status(400).json({
                    message: "Username already exists",
                });
            }

            user.username = cleanUsername;
        }

        // =========================
        // EMAIL CHECK
        // =========================
        if (cleanEmail && cleanEmail !== user.email) {
            const exists = await User.findOne({
                email: cleanEmail,
                _id: { $ne: user._id },
            });

            if (exists) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }

            user.email = cleanEmail;
        }

        // =========================
        // UPDATE OTHER FIELDS
        // =========================
        user.firstName = firstName?.trim() ?? user.firstName;
        user.lastName = lastName?.trim() ?? user.lastName;
        user.address = address ?? user.address;
        user.postalCode = postalCode ?? user.postalCode;
        user.city = city ?? user.city;
        user.country = country ?? user.country;

        await user.save();

        return res.status(200).json({
            message: "Profile updated",
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                address: user.address,
                postalCode: user.postalCode,
                city: user.city,
                country: user.country,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
            },
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};