const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// 🔥 middleware (MÅSTE vara före routes)
app.use(cors());
app.use(express.json());

// 🔥 koppla databasen
connectDB();

// 🔥 routes
app.use("/api/auth", require("./routes/authRoutes"));

// 🔐 protected route
const protect = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "Du är inloggad 🔐",
        user: req.user,
    });
});

// 🚀 start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server körs på port ${PORT}`);
    console.log("🔥 SERVER IS RUNNING");
});
