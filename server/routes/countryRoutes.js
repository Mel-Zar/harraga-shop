const express = require("express");
const router = express.Router();

const countryMap = require("../config/countries.json");

// =========================
// GET COUNTRIES
// =========================
router.get("/", (req, res) => {
    try {
        const countries = Object.keys(countryMap);

        return res.status(200).json(countries);
    } catch (err) {
        console.error("Country route error:", err);
        return res.status(200).json([]);
    }
});

module.exports = router;