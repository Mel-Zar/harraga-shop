const countryMap = require("../config/countries.json");

exports.searchAddress = async (req, res) => {
    try {
        const qRaw = req.query?.q;
        const countryRaw = req.query?.country;

        // ✅ Validate required params
        if (typeof qRaw !== "string" || typeof countryRaw !== "string") {
            return res.status(200).json([]);
        }

        const q = qRaw.trim();
        const country = countryRaw.trim();

        if (!q || !country) {
            return res.status(200).json([]);
        }

        // ✅ Avoid abuse / extremely long queries
        if (q.length > 150 || country.length > 80) {
            return res.status(200).json([]);
        }

        // ✅ Normalize country input for lookup
        const normalizedCountry = country.toLowerCase();

        // ✅ country validation via backend config file
        const countryCodeRaw =
            countryMap[normalizedCountry] || countryMap[country];

        if (!countryCodeRaw || typeof countryCodeRaw !== "string") {
            return res.status(200).json([]);
        }

        const countryCode = countryCodeRaw.toLowerCase().trim();

        // 🔥 SMART QUERY BOOST (IMPORTANT)
        const smartQuery = `${q}, ${country}`;

        // ✅ Build URL safely
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "10");
        url.searchParams.set("dedupe", "1");
        url.searchParams.set("q", smartQuery);
        url.searchParams.set("countrycodes", countryCode);

        // ✅ Timeout (best practice, prevents hanging requests)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        let response;

        try {
            response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "User-Agent": "workhub-app/1.0 (contact: dev)",
                    "Accept": "application/json",
                    "Accept-Language": "en"
                },
                signal: controller.signal
            });
        } catch (fetchErr) {
            clearTimeout(timeout);
            console.error("❌ Fetch error (Nominatim):", fetchErr);
            return res.status(200).json([]);
        }

        clearTimeout(timeout);

        // ✅ Handle non-200
        if (!response.ok) {
            console.warn("⚠️ Nominatim response not OK:", response.status);
            return res.status(200).json([]);
        }

        // ✅ Safely parse JSON
        let data;

        try {
            data = await response.json();
        } catch (err) {
            console.log("❌ Nominatim returned invalid JSON");
            return res.status(200).json([]);
        }

        if (!Array.isArray(data)) {
            return res.status(200).json([]);
        }

        // 🔥 FILTER + CLEAN RESPONSE
        const cleaned = data
            .filter((item) => item && typeof item === "object" && item.address)
            .map((item) => ({
                display_name: item.display_name || "",
                address: item.address || {}
            }));

        // ✅ Cache headers
        res.set("Cache-Control", "public, max-age=60");

        return res.status(200).json(cleaned);

    } catch (err) {
        console.error("❌ Address API error:", err);
        return res.status(200).json([]);
    }
};