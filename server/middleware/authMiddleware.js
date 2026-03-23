const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log("DECODED TOKEN:", decoded); // 🔥 DEBUG

            const userId = decoded.id || decoded.userId || decoded._id;

            req.user = await User.findById(userId).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    return res.status(401).json({ message: "No token" });
};

module.exports = protect;
