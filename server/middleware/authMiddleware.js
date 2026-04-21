const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================
// PROTECT ROUTES
// =========================
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.id || decoded._id;

        req.user = await User.findById(userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized" });
    }
};

// =========================
// ADMIN ONLY
// =========================
const admin = (req, res, next) => {
    if (req.user?.isAdmin) return next();
    return res.status(403).json({ message: "Admin only" });
};

module.exports = { protect, admin };
