import express from "express";
import countryMap from "../config/countries.json" assert { type: "json" };

const router = express.Router();

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

export default router;