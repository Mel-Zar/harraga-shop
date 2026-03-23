const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// 🔥 koppla databasen
connectDB();

// 🔥 middleware
app.use(cors());
app.use(express.json());

// 🔥 routes
app.use("/api/auth", require("./routes/authRoutes"));

// test route
app.get("/", (req, res) => {
    res.send("Server funkar 🚀");
});

// 🔥 protected test route (för att testa auth)
const protect = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "Du är inloggad 🔐",
        user: req.user,
    });
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server körs på port ${PORT}`);
});
