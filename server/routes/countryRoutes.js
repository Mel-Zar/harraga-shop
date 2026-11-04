import express from "express";
import countryMap from "../config/countries.json" with { type: "json" };

const router = express.Router();

// =========================
// GET COUNTRIES
// =========================
router.get("/", (req, res) => {
    try {
        const countries = Object.keys(countryMap).sort(
            (a, b) => a.localeCompare(b)
        );

        return res.status(200).json(countries);
    } catch (error) {
        console.error("Country route error:", error);

        return res.status(500).json({
            message: "Failed to load countries."
        });
    }
});

export default router;