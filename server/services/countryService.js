const countryMap = require("../config/countries.json");

exports.getCountryCode = (country) => {
    if (!country || typeof country !== "string") return null;

    const normalized = country.toLowerCase().trim();

    return countryMap[normalized] || null;
};