const allowedCountries = [
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Germany",
    "France",
    "Netherlands",
    "Belgium",
    "Spain",
    "Italy",
    "Portugal",
    "Austria",
    "Switzerland",
    "United Kingdom",
    "USA",
    "Canada",
    "Australia"
];

const countryMap = {
    Sweden: "se",
    Norway: "no",
    Denmark: "dk",
    Finland: "fi",
    Germany: "de",
    France: "fr",
    Netherlands: "nl",
    Belgium: "be",
    Spain: "es",
    Italy: "it",
    Portugal: "pt",
    Austria: "at",
    Switzerland: "ch",
    "United Kingdom": "gb",
    USA: "us",
    Canada: "ca",
    Australia: "au"
};

exports.searchAddress = async (req, res) => {
    try {
        const { q, country } = req.query;

        if (!q || !country) {
            return res.json([]);
        }

        if (!allowedCountries.includes(country)) {
            return res.json([]);
        }

        const countryCode = countryMap[country];

        if (!countryCode) {
            return res.json([]);
        }

        // 🔥 SMART QUERY BOOST (IMPORTANT)
        const smartQuery = `${q}, ${country}`;

        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&dedupe=1&q=${encodeURIComponent(
            smartQuery
        )}&countrycodes=${countryCode}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "workhub-app/1.0 (contact: dev)",
                "Accept": "application/json",
                "Accept-Language": "en"
            }
        });

        if (!response.ok) {
            return res.json([]);
        }

        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.log("❌ Nominatim returned invalid JSON:", text.slice(0, 200));
            return res.json([]);
        }

        if (!Array.isArray(data)) {
            return res.json([]);
        }

        // 🔥 FILTER + CLEAN RESPONSE
        const cleaned = data
            .filter((item) => item?.address)
            .map((item) => ({
                display_name: item.display_name,
                address: item.address
            }));

        return res.json(cleaned);

    } catch (err) {
        console.error("Address API error:", err);
        return res.json([]);
    }
};
