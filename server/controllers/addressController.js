const countryMap = require("../../shared/countries.json");

exports.searchAddress = async (req, res) => {
    try {
        const { q, country } = req.query;

        if (!q || !country) {
            return res.json([]);
        }

        // ✅ country validation via shared file
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
