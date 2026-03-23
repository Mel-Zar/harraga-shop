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

        // 1. Required fields
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

        // 2. Password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // 3. Check duplicate email OR username
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create user
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
        });

        console.log("✅ USER CREATED:", user.username);

        // 6. Response
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

        // handle Mongo duplicate key error (extra safety)
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
        const { identifier, password } = req.body;

        // 1. Check fields
        if (!identifier || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Find user by email OR username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Success response
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
        res.status(500).json({ message: "Server error" });
    }
};

