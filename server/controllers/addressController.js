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
            return res.status(400).json({ message: "Missing query" });
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}&countrycodes=${country}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "workhub-app",
                "Accept-Language": "en"
            }
        });

        const data = await response.json();

        res.json(data);

    } catch (err) {
        console.error("Address API error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

