const countryMap = require("../config/countries.json");

// =========================
// GET ALL COUNTRIES
// =========================
exports.getCountries = (req, res) => {
    try {
        const countries = Object.keys(countryMap);

        return res.status(200).json(countries);
    } catch (err) {
        console.error("❌ Country controller error:", err);
        return res.status(200).json([]);
    }
};

// =========================
// VALIDATE COUNTRY + RETURN CODE
// =========================
exports.getCountryCode = (country) => {
    if (!country || typeof country !== "string") return null;

    const normalized = country.toLowerCase().trim();

    return countryMap[normalized] || null;
};