const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// 🔥 koppla databasen här
connectDB();

app.get("/", (req, res) => {
    res.send("Server funkar 🚀");
});

app.listen(process.env.PORT, () => {
    console.log(`Server körs på port ${process.env.PORT}`);
});
