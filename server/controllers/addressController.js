import { getCountryCode } from "./countryController.js";

// =========================
// ADDRESS SEARCH
// =========================
export const searchAddress = async (req, res) => {
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

        // ✅ Abuse protection
        if (q.length > 150 || country.length > 80) {
            return res.status(200).json([]);
        }

        // 🔥 COUNTRY VALIDATION MOVED TO CONTROLLER
        const countryCodeRaw = getCountryCode(country);

        if (!countryCodeRaw || typeof countryCodeRaw !== "string") {
            return res.status(200).json([]);
        }

        const countryCode = countryCodeRaw.toLowerCase().trim();

        // 🔥 SMART QUERY BOOST
        const smartQuery = `${q}, ${country}`;

        // =========================
        // Nominatim request
        // =========================
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "10");
        url.searchParams.set("dedupe", "1");
        url.searchParams.set("q", smartQuery);
        url.searchParams.set("countrycodes", countryCode);

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
        } catch (err) {
            clearTimeout(timeout);
            console.error("❌ Fetch error:", err);
            return res.status(200).json([]);
        }

        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(200).json([]);
        }

        let data;

        try {
            data = await response.json();
        } catch {
            return res.status(200).json([]);
        }

        if (!Array.isArray(data)) {
            return res.status(200).json([]);
        }

        const cleaned = data
            .filter((item) => item && typeof item === "object" && item.address)
            .map((item) => ({
                display_name: item.display_name || "",
                address: item.address || {}
            }));

        res.set("Cache-Control", "public, max-age=60");

        return res.status(200).json(cleaned);

    } catch (err) {
        console.error("❌ Address API error:", err);
        return res.status(200).json([]);
    }
};