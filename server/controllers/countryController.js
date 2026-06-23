import countryMap from "../config/countries.json" assert { type: "json" };

// =========================
// GET ALL COUNTRIES
// =========================
export const getCountries = (req, res) => {
    try {
        const countries = Object.keys(countryMap);

        return res.status(200).json(countries);
    } catch (err) {
        console.error("GET COUNTRIES ERROR:", err);

        return res.status(500).json({
            message: "Failed to fetch countries",
            countries: [],
        });
    }
};

// =========================
// VALIDATE COUNTRY + RETURN CODE
// =========================
export const getCountryCode = (country) => {
    if (typeof country !== "string" || !country.trim()) {
        return null;
    }

    const normalized = country.toLowerCase().trim();

    return countryMap[normalized] || null;
};