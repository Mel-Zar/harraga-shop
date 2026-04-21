const jwt = require("jsonwebtoken");

// ACCESS TOKEN (kort liv)
exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

// REFRESH TOKEN (lång liv)
exports.generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
