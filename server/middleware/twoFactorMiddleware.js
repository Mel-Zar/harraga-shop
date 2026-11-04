import jwt from "jsonwebtoken";

export const verifyTwoFactorToken = (requiredPurpose) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Two-factor token is required",
                });
            }

            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.TWO_FACTOR_TEMP_SECRET
            );

            if (decoded.purpose !== requiredPurpose) {
                return res.status(403).json({
                    message: "Invalid token purpose",
                });
            }

            req.twoFactorUserId = decoded.id;

            next();
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired two-factor token",
            });
        }
    };
};