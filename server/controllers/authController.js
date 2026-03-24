const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// REGISTER
exports.register = async (req, res) => {
    try {
        console.log("🔥 REGISTER ROUTE HIT");
        console.log("BODY:", req.body);

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

        // =========================
        // 1. CHECK REQUIRED FIELDS
        // =========================
        if (
            !username ||
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !address ||
            !postalCode ||
            !city
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // =========================
        // 2. CLEAN INPUT (trim spaces)
        // =========================
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // =========================
        // 3. USERNAME VALIDATION
        // =========================
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
            return res.status(400).json({
                message: "Username must be between 3 and 20 characters"
            });
        }

        // only letters + numbers
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(cleanUsername)) {
            return res.status(400).json({
                message: "Username can only contain letters and numbers"
            });
        }

        // =========================
        // 4. EMAIL VALIDATION
        // =========================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // =========================
        // 5. PASSWORD VALIDATION (IMPORTANT 🔐)
        // =========================
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // optional: strong password (recommended)
        const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!strongPassword.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 1 letter and 1 number"
            });
        }

        // =========================
        // 6. PASSWORD MATCH
        // =========================
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // =========================
        // 7. CHECK USERNAME EXISTS
        // =========================
        const usernameExists = await User.findOne({ username: cleanUsername });

        if (usernameExists) {
            return res.status(400).json({
                message: "Username already taken"
            });
        }

        // =========================
        // 8. CHECK EMAIL EXISTS
        // =========================
        const emailExists = await User.findOne({ email: cleanEmail });

        if (emailExists) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // =========================
        // 9. HASH PASSWORD
        // =========================
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // =========================
        // 10. CREATE USER
        // =========================
        const user = await User.create({
            username: cleanUsername,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: cleanEmail,
            password: hashedPassword,
            address: address.trim(),
            postalCode: postalCode.trim(),
            city: city.trim(),
            country: country || "Sweden",
        });

        console.log("✅ USER CREATED:", user.username);

        // =========================
        // 11. RESPONSE (NO PASSWORD)
        // =========================
        res.status(201).json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            address: user.address,
            city: user.city,
            postalCode: user.postalCode,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.log("🔥 REGISTER ERROR:", error);

        // Mongo duplicate fallback (safety)
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};



// LOGIN
exports.login = async (req, res) => {
    try {
        console.log("🔥 LOGIN ROUTE HIT");
        console.log("BODY:", req.body);

        const { identifier, password } = req.body;

        // =========================
        // 1. CHECK REQUIRED FIELDS
        // =========================
        if (!identifier || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // =========================
        // 2. CLEAN INPUT
        // =========================
        const cleanIdentifier = identifier.trim().toLowerCase();

        // =========================
        // 3. FIND USER (EMAIL OR USERNAME)
        // =========================
        const user = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { username: cleanIdentifier }
            ]
        });

        // =========================
        // 4. GENERIC ERROR (SECURITY)
        // =========================
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // =========================
        // 5. CHECK PASSWORD
        // =========================
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // =========================
        // 6. SUCCESS RESPONSE
        // =========================
        res.json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.log("🔥 LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


