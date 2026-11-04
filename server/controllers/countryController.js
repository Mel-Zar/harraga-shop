
import countryMap from "../config/countries.json" with { type: "json" };

// =========================
// NORMALIZE COUNTRY NAME
// =========================

const normalizeCountryName = (value) => {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
};

// =========================
// GET ALL COUNTRIES
// =========================

export const getCountries = (req, res) => {
    try {
        const countries = Object.keys(countryMap).sort(
            (a, b) => a.localeCompare(b)
        );

        return res.status(200).json(countries);
    } catch (error) {
        console.error("GET COUNTRIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch countries.",
            countries: []
        });
    }
};

// =========================
// VALIDATE COUNTRY + RETURN CODE
// =========================

export const getCountryCode = (country) => {
    if (
        typeof country !== "string" ||
        !country.trim()
    ) {
        return null;
    }

    const normalizedCountry = normalizeCountryName(country);

    for (const [countryName, countryData] of Object.entries(countryMap)) {
        if (
            !countryData ||
            typeof countryData.code !== "string"
        ) {
            continue;
        }

        const countryNames = [
            countryName,
            ...(Array.isArray(countryData.aliases)
                ? countryData.aliases
                : [])
        ];

        const isMatch = countryNames.some(
            (name) =>
                normalizeCountryName(name) === normalizedCountry
        );

        if (isMatch) {
            return countryData.code.toLowerCase();
        }
    }

    return null;
};
