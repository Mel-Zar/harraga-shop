import countryMap from "../config/countries.json" assert { type: "json" };

export const getCountryCode = (country) => {
    if (!country || typeof country !== "string") return null;

    const normalized = country.toLowerCase().trim();

    return countryMap[normalized] || null;
};