const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ IMPORT FROM SHARED JSON (FIXED)
const countries = require("../../shared/countries.json");

// =========================
// 🔐 TOKEN
// =========================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// =========================
// 🟢 REGISTER
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

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanCountry = country.trim();

        // ✅ VALIDATE COUNTRY FROM JSON
        if (!countries.includes(cleanCountry)) {
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
            country: cleanCountry
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("🔥 REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =========================
// 🔵 LOGIN
// =========================
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const cleanIdentifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { username: cleanIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("🔥 LOGIN ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
