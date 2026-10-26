import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";

// =========================
// GOOGLE COUNTRY CODES
// =========================

const countryCodeMap = {
    sverige: "se",
    sweden: "se",

    norge: "no",
    norway: "no",

    danmark: "dk",
    denmark: "dk",

    finland: "fi",

    tyskland: "de",
    germany: "de",

    frankrike: "fr",
    france: "fr",

    nederländerna: "nl",
    netherlands: "nl",

    belgien: "be",
    belgium: "be",

    spanien: "es",
    spain: "es",

    italien: "it",
    italy: "it",

    portugal: "pt",

    österrike: "at",
    austria: "at",

    schweiz: "ch",
    switzerland: "ch",

    storbritannien: "gb",
    "united kingdom": "gb",
    uk: "gb",

    usa: "us",
    "united states": "us",

    kanada: "ca",
    canada: "ca",

    australien: "au",
    australia: "au",
};

// =========================
// ADDRESS SEARCH CACHE
// =========================

const addressSearchCache = new Map();

const ADDRESS_CACHE_TTL = 5 * 60 * 1000;

// =========================
// NORMALIZE TEXT
// =========================

const normalize = (value) => {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
};

// =========================
// NORMALIZE HOUSE NUMBER
// =========================

const normalizeHouseNumber = (value) => {
    return normalize(value).replace(/\s+/g, "");
};

// =========================
// DETECT HOUSE NUMBER
// =========================

const getHouseNumber = (value) => {
    const normalized = normalize(value);

    /*
     * Supports:
     *
     * 14
     * 14A
     * 14-16
     * 14A-16B
     * 14/16
     */

    const match = normalized.match(
        /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
    );

    return match ? match[1] : "";
};

// =========================
// EXTRACT HOUSE NUMBER
// FROM FORMATTED ADDRESS
// =========================

const getHouseNumberFromFormatted = (value) => {
    const text = String(value || "").trim();

    if (!text) {
        return "";
    }

    const normalized = normalize(text);

    const beforeComma = normalized.split(",")[0].trim();

    const match = beforeComma.match(
        /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
    );

    if (match) {
        return match[1];
    }

    const fallback = beforeComma.match(
        /\b(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\b/
    );

    return fallback ? fallback[1] : "";
};

// =========================
// GET RESULT HOUSE NUMBER
// =========================

const getResultHouseNumber = (place) => {
    const explicitHouseNumber =
        place?.housenumber ||
        place?.house_number ||
        place?.street_number ||
        place?.streetNumber ||
        place?.houseNumber ||
        place?.address?.housenumber ||
        place?.address?.house_number ||
        place?.address?.street_number ||
        place?.address?.streetNumber ||
        place?.address?.houseNumber ||
        "";

    if (explicitHouseNumber) {
        return String(explicitHouseNumber).trim();
    }

    return getHouseNumberFromFormatted(
        place?.formatted ||
        place?.formattedAddress ||
        place?.display_name ||
        place?.displayName?.text ||
        ""
    );
};

// =========================
// EXTRACT CITY FROM QUERY
// =========================

const getCityFromQuery = (value, houseNumber) => {
    let query = String(value || "").trim();

    if (!query) {
        return "";
    }

    if (houseNumber) {
        const normalizedQuery = query.toLowerCase();
        const normalizedHouse = houseNumber.toLowerCase();

        const houseIndex = normalizedQuery.lastIndexOf(
            normalizedHouse
        );

        if (houseIndex !== -1) {
            query = query.slice(
                houseIndex + houseNumber.length
            );
        }
    }

    query = query
        .replace(/^[,\s]+/, "")
        .trim();

    if (!query) {
        return "";
    }

    return query;
};

// =========================
// EXTRACT STREET FROM QUERY
// =========================

const getStreetFromQuery = (value, houseNumber) => {
    let query = String(value || "").trim();

    if (!query) {
        return "";
    }

    if (houseNumber) {
        const originalMatch = query.match(
            /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/i
        );

        if (originalMatch) {
            query = query
                .slice(0, originalMatch.index)
                .trim();
        }
    }

    return query
        .replace(/[,\s]+$/, "")
        .trim();
};

// =========================
// EXTRACT POSTAL CODE
// =========================

const getPostalCodeFromQuery = (value) => {
    const query = String(value || "").trim();

    if (!query) {
        return "";
    }

    const match = query.match(/\b\d{3}\s?\d{2}\b/);

    return match ? match[0] : "";
};

// =========================
// EXTRACT CITY AFTER POSTAL CODE
// =========================

const getCityAfterPostalCode = (value) => {
    const query = String(value || "").trim();

    if (!query) {
        return "";
    }

    const postalMatch = query.match(/\b\d{3}\s?\d{2}\b/);

    if (!postalMatch) {
        return "";
    }

    const afterPostal = query
        .slice(
            postalMatch.index + postalMatch[0].length
        )
        .replace(/^[,\s]+/, "")
        .trim();

    if (!afterPostal) {
        return "";
    }

    return afterPostal.split(",")[0].trim();
};

// =========================
// COUNTRY CODE
// =========================

const getCountryCode = (country) => {
    return countryCodeMap[normalize(country)] || "";
};

// =========================
// GOOGLE REQUEST
// =========================

const requestGoogle = async (
    url,
    options = {},
    timeoutMs = 7000
) => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        const text = await response.text();

        let data = null;

        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = null;
        }

        return {
            response,
            data,
        };
    } finally {
        clearTimeout(timeout);
    }
};

// =========================
// GET GOOGLE ADDRESS COMPONENT
// =========================

const getAddressComponent = (components, type) => {
    if (!Array.isArray(components)) {
        return "";
    }

    const component = components.find(
        (item) =>
            Array.isArray(item.types) &&
            item.types.includes(type)
    );

    return (
        component?.longText ||
        component?.shortText ||
        ""
    );
};

// =========================
// GET GOOGLE COUNTRY CODE
// =========================

const getGoogleCountryCode = (components) => {
    if (!Array.isArray(components)) {
        return "";
    }

    const countryComponent = components.find(
        (item) =>
            Array.isArray(item.types) &&
            item.types.includes("country")
    );

    return (
        countryComponent?.shortText ||
        countryComponent?.longText ||
        ""
    )
        .trim()
        .toLowerCase();
};

// =========================
// CLEAN GOOGLE PLACE
// =========================

const cleanGooglePlace = (place, fallbackCountry) => {
    if (!place) {
        return null;
    }

    const components = place.addressComponents || [];

    let street = getAddressComponent(
        components,
        "route"
    );

    let housenumber = getAddressComponent(
        components,
        "street_number"
    );

    const postcode = getAddressComponent(
        components,
        "postal_code"
    );

    const city =
        getAddressComponent(components, "postal_town") ||
        getAddressComponent(components, "locality") ||
        getAddressComponent(
            components,
            "administrative_area_level_2"
        ) ||
        getAddressComponent(
            components,
            "administrative_area_level_1"
        );

    const country =
        getAddressComponent(components, "country") ||
        fallbackCountry ||
        "";

    const countryCode = getGoogleCountryCode(components);

    const formatted =
        place.formattedAddress ||
        [
            street,
            housenumber,
            postcode,
            city,
            country,
        ]
            .filter(Boolean)
            .join(", ");

    if (!housenumber) {
        housenumber = getHouseNumberFromFormatted(
            formatted
        );
    }

    if (!street && formatted) {
        const firstPart = formatted
            .split(",")[0]
            .trim();

        if (housenumber) {
            const escapedHouse = String(
                housenumber
            ).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            street = firstPart
                .replace(
                    new RegExp(
                        `\\s*${escapedHouse}\\s*$`,
                        "i"
                    ),
                    ""
                )
                .trim();
        } else {
            street = firstPart;
        }
    }

    const placeId = place.id || "";

    return {
        id: String(placeId),
        place_id: String(placeId),
        display_name: formatted,
        formatted,

        address: {
            road: street,
            house_number: housenumber,
            street,
            housenumber,
            postcode,
            city,
            country,
            country_code: countryCode,
        },

        country,
        country_code: countryCode,
        postcode,
        city,
        street,
        housenumber,

        lat: place.location?.latitude ?? null,
        lon: place.location?.longitude ?? null,

        result_type: Array.isArray(place.types)
            ? place.types[0] || null
            : null,

        result_class: null,
        importance: 1,
        confidence: 1,
        confidence_city_level: city ? 1 : null,
        confidence_building_level: housenumber ? 1 : null,

        match_type: Array.isArray(place.types)
            ? place.types[0] || null
            : null,

        google_place_id: placeId,
        google_name: place.displayName?.text || "",
    };
};

// =========================
// GOOGLE PLACE DETAILS
// =========================

const getGooglePlaceDetails =
    async (
        placeId,
        apiKey
    ) => {
        if (!placeId || !apiKey) {
            return null;
        }

        const url =
            `https://places.googleapis.com/v1/places/${encodeURIComponent(
                placeId
            )}`;

        const {
            response,
            data,
        } = await requestGoogle(
            url,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": [
                        "id",
                        "displayName",
                        "formattedAddress",
                        "addressComponents",
                        "location",
                        "types",
                    ].join(","),
                },
            }
        );

        if (!response.ok) {
            console.error(
                "GOOGLE PLACE DETAILS FAILED:",
                response.status,
                data
            );

            return null;
        }

        return data;
    };

// =========================
// GOOGLE GEOCODING SEARCH
// =========================

const searchGoogleGeocoding =
    async (
        query,
        apiKey,
        countryCode
    ) => {
        if (!query || !apiKey) {
            return [];
        }

        const params = new URLSearchParams();

        params.set("address", query);
        params.set("language", "sv");
        params.set("key", apiKey);

        if (countryCode) {
            params.set(
                "components",
                `country:${countryCode}`
            );
        }

        const url =
            `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;

        const {
            response,
            data,
        } = await requestGoogle(
            url,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            console.error(
                "GOOGLE GEOCODING FAILED:",
                response.status,
                data
            );

            return [];
        }

        if (data?.status !== "OK") {
            console.log(
                "GOOGLE GEOCODING STATUS:",
                data?.status,
                data?.error_message || ""
            );

            return [];
        }

        return Array.isArray(data?.results)
            ? data.results.map((item) => {
                const components =
                    item.address_components || [];

                const getComponent = (type) => {
                    const component = components.find(
                        (currentComponent) =>
                            Array.isArray(currentComponent.types) &&
                            currentComponent.types.includes(type)
                    );

                    return (
                        component?.long_name ||
                        component?.short_name ||
                        ""
                    );
                };

                const street = getComponent("route");
                const housenumber = getComponent("street_number");
                const postcode = getComponent("postal_code");

                const city =
                    getComponent("postal_town") ||
                    getComponent("locality") ||
                    getComponent("administrative_area_level_2") ||
                    getComponent("administrative_area_level_1");

                const country = getComponent("country");

                const resultCountryCode =
                    components.find(
                        (component) =>
                            Array.isArray(component.types) &&
                            component.types.includes("country")
                    )?.short_name?.toLowerCase() || "";

                return {
                    id: item.place_id,
                    place_id: item.place_id,
                    google_place_id: item.place_id,
                    display_name: item.formatted_address,
                    formatted: item.formatted_address,

                    address: {
                        road: street,
                        street,
                        house_number: housenumber,
                        housenumber,
                        postcode,
                        city,
                        country,
                        country_code: resultCountryCode,
                    },

                    street,
                    housenumber,
                    postcode,
                    city,
                    country,
                    country_code: resultCountryCode,

                    lat: item.geometry?.location?.lat ?? null,
                    lon: item.geometry?.location?.lng ?? null,

                    result_type: Array.isArray(item.types)
                        ? item.types[0] || null
                        : null,

                    match_type: Array.isArray(item.types)
                        ? item.types[0] || null
                        : null,

                    confidence: 1,
                    confidence_city_level: city ? 1 : null,
                    confidence_building_level: housenumber ? 1 : null,
                };
            })
            : [];
    };

// =========================
// MERGE ADDRESS RESULTS
// =========================

const mergeAddressResults = (places) => {
    const unique = new Map();

    for (const place of places) {
        if (!place) {
            continue;
        }

        const street = normalize(
            place.street ||
            place.address?.street ||
            place.address?.road ||
            ""
        );

        const house = normalizeHouseNumber(
            getResultHouseNumber(place)
        );

        const city = normalize(
            place.city ||
            place.address?.city ||
            ""
        );

        const postalCode = normalize(
            place.postcode ||
            place.address?.postcode ||
            ""
        );

        const googleId = String(
            place.google_place_id ||
            place.place_id ||
            place.id ||
            ""
        );

        const key = [
            street,
            house,
            postalCode,
            city,
            googleId ? "" : "nogoogleid",
        ].join("|");

        const existing = unique.get(key);

        if (!existing) {
            unique.set(key, place);
            continue;
        }

        const existingScore = [
            existing.street,
            existing.housenumber,
            existing.postcode,
            existing.city,
            existing.country,
            existing.google_place_id,
        ].filter(Boolean).length;

        const newScore = [
            place.street,
            place.housenumber,
            place.postcode,
            place.city,
            place.country,
            place.google_place_id,
        ].filter(Boolean).length;

        if (newScore > existingScore) {
            unique.set(key, place);
        }
    }

    return Array.from(unique.values());
};

// =========================
// CACHE HELPERS
// =========================

const getCachedResults = (key) => {
    const cached = addressSearchCache.get(key);

    if (!cached) {
        return null;
    }

    if (
        Date.now() - cached.timestamp >
        ADDRESS_CACHE_TTL
    ) {
        addressSearchCache.delete(key);
        return null;
    }

    return cached.results;
};

const setCachedResults = (key, results) => {
    addressSearchCache.set(key, {
        timestamp: Date.now(),
        results,
    });

    /*
     * Prevent unlimited memory
     * growth on a long-running server.
     */

    if (addressSearchCache.size > 500) {
        const firstKey =
            addressSearchCache.keys().next().value;

        if (firstKey) {
            addressSearchCache.delete(firstKey);
        }
    }
};

// =========================
// FREE OPENSTREETMAP SEARCH
// =========================

// Public Nominatim service. Space requests at least one second apart.
let lastNominatimRequestAt = 0;
let nominatimQueue = Promise.resolve();

const waitForNominatimTurn = async () => {
    const queued = nominatimQueue.then(async () => {
        const elapsed =
            Date.now() - lastNominatimRequestAt;

        const waitMs = Math.max(0, 1000 - elapsed);

        if (waitMs > 0) {
            await new Promise((resolve) =>
                setTimeout(resolve, waitMs)
            );
        }

        lastNominatimRequestAt = Date.now();
    });

    nominatimQueue = queued.catch(() => { });

    await queued;
};

const searchOpenStreetMap = async (
    query,
    countryCode
) => {
    const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        addressdetails: "1",
        limit: "8",
        "accept-language": "sv",
    });

    if (countryCode) {
        params.set(
            "countrycodes",
            countryCode.toLowerCase()
        );
    }

    await waitForNominatimTurn();

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
            method: "GET",
            headers: {
                "User-Agent": "Harraga/1.0 (address search)",
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
        }
    );

    if (!response.ok) {
        console.error(
            "OPENSTREETMAP SEARCH FAILED:",
            response.status
        );

        return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item) => {
        const address = item.address || {};

        const street =
            address.road ||
            address.pedestrian ||
            address.residential ||
            address.footway ||
            address.path ||
            "";

        const housenumber =
            address.house_number || "";

        const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            address.city_district ||
            "";

        const postcode = address.postcode || "";
        const country = address.country || "";

        const resultCountryCode = String(
            address.country_code || ""
        ).toLowerCase();

        const formatted =
            item.display_name ||
            [
                street,
                housenumber,
                postcode,
                city,
                country,
            ]
                .filter(Boolean)
                .join(", ");

        return {
            id: String(item.place_id || item.osm_id || ""),
            place_id: String(item.place_id || item.osm_id || ""),
            display_name: formatted,
            formatted,

            address: {
                ...address,
                road: street,
                street,
                house_number: housenumber,
                housenumber,
                postcode,
                city,
                country,
                country_code: resultCountryCode,
            },

            country,
            country_code: resultCountryCode,
            postcode,
            city,
            street,
            housenumber,
            lat: item.lat ? Number(item.lat) : null,
            lon: item.lon ? Number(item.lon) : null,
            result_type: item.type || item.class || null,
            result_class: item.class || null,
            importance: Number(item.importance || 0),
            confidence: Number(item.importance || 0),
            confidence_city_level: city ? 1 : null,
            confidence_building_level: housenumber ? 1 : null,
            match_type: item.type || item.class || null,
            osm_type: item.osm_type || null,
            osm_id: item.osm_id || null,
        };
    });
};

// =========================
// SEARCH ADDRESS
// =========================

export const searchAddress = async (req, res) => {
    try {
        const {
            q = "",
            country = "",
            city = "",
            postalCode = "",
            countryCode: requestedCountryCode = "",
        } = req.query;

        const query = String(q || "").trim();

        if (!query || query.length < 3) {
            return res.status(200).json([]);
        }

        const fallbackCountryCode = getCountryCode(country);

        const resolvedCountryCode = /^[a-z]{2}$/i.test(
            String(requestedCountryCode || "").trim()
        )
            ? String(requestedCountryCode).trim().toLowerCase()
            : fallbackCountryCode;

        const requestedHouseNumber = getHouseNumber(query);

        const requestedStreet = getStreetFromQuery(
            query,
            requestedHouseNumber
        );

        const requestedPostalCode = String(
            postalCode || getPostalCodeFromQuery(query) || ""
        ).trim();

        const requestedCity = String(
            city ||
            getCityAfterPostalCode(query) ||
            getCityFromQuery(query, requestedHouseNumber) ||
            ""
        ).trim();

        // =========================
        // SERVER CACHE
        // =========================

        const cacheKey = [
            normalize(query),
            normalize(country),
            normalize(resolvedCountryCode),
            normalize(requestedCity),
            normalize(requestedPostalCode),
        ].join("|");

        const cachedResults = getCachedResults(cacheKey);

        if (cachedResults) {
            return res.status(200).json(cachedResults);
        }

        const searchQuery = [
            requestedStreet || query,
            requestedHouseNumber,
            requestedPostalCode,
            requestedCity,
        ]
            .filter(Boolean)
            .join(" ");

        console.log("OPENSTREETMAP ADDRESS REQUEST:", {
            query,
            country,
            countryCode: resolvedCountryCode,
            requestedStreet,
            requestedHouseNumber,
            requestedCity,
            requestedPostalCode,
        });

        let results = [];

        try {
            results = await searchOpenStreetMap(
                searchQuery || query,
                resolvedCountryCode
            );
        } catch (error) {
            console.error(
                "OPENSTREETMAP ADDRESS REQUEST ERROR:",
                error
            );

            return res.status(200).json([]);
        }

        results = mergeAddressResults(results);

        // =========================
        // FILTER HOUSE NUMBER
        // =========================

        if (requestedHouseNumber && results.length > 0) {
            const normalizedRequestedHouse =
                normalizeHouseNumber(requestedHouseNumber);

            const houseMatches = results.filter(
                (place) =>
                    normalizeHouseNumber(
                        getResultHouseNumber(place)
                    ) === normalizedRequestedHouse
            );

            if (houseMatches.length > 0) {
                results = houseMatches;
            }
        }

        // =========================
        // FILTER CITY
        // =========================

        if (requestedCity && results.length > 0) {
            const normalizedRequestedCity =
                normalize(requestedCity);

            const cityMatches = results.filter((place) => {
                const resultCity = normalize(
                    place.city ||
                    place.address?.city ||
                    place.address?.town ||
                    place.address?.village ||
                    place.address?.municipality ||
                    place.address?.suburb ||
                    ""
                );

                return resultCity === normalizedRequestedCity;
            });

            if (cityMatches.length > 0) {
                results = cityMatches;
            }
        }

        // =========================
        // FILTER POSTAL CODE
        // =========================

        if (requestedPostalCode && results.length > 0) {
            const normalizedRequestedPostal =
                normalize(requestedPostalCode);

            const postalMatches = results.filter(
                (place) =>
                    normalize(
                        place.postcode ||
                        place.address?.postcode ||
                        ""
                    ) === normalizedRequestedPostal
            );

            if (postalMatches.length > 0) {
                results = postalMatches;
            }
        }

        // =========================
        // SORT RESULTS
        // =========================

        results.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (
                requestedStreet &&
                normalize(a.street) === normalize(requestedStreet)
            ) {
                scoreA += 1000;
            }

            if (
                requestedStreet &&
                normalize(b.street) === normalize(requestedStreet)
            ) {
                scoreB += 1000;
            }

            if (
                requestedHouseNumber &&
                normalizeHouseNumber(getResultHouseNumber(a)) ===
                normalizeHouseNumber(requestedHouseNumber)
            ) {
                scoreA += 10000;
            }

            if (
                requestedHouseNumber &&
                normalizeHouseNumber(getResultHouseNumber(b)) ===
                normalizeHouseNumber(requestedHouseNumber)
            ) {
                scoreB += 10000;
            }

            if (
                requestedCity &&
                normalize(a.city) === normalize(requestedCity)
            ) {
                scoreA += 5000;
            }

            if (
                requestedCity &&
                normalize(b.city) === normalize(requestedCity)
            ) {
                scoreB += 5000;
            }

            if (
                requestedPostalCode &&
                normalize(a.postcode) === normalize(requestedPostalCode)
            ) {
                scoreA += 8000;
            }

            if (
                requestedPostalCode &&
                normalize(b.postcode) === normalize(requestedPostalCode)
            ) {
                scoreB += 8000;
            }

            scoreA += a.street ? 100 : 0;
            scoreA += a.housenumber ? 200 : 0;
            scoreA += a.postcode ? 50 : 0;

            scoreB += b.street ? 100 : 0;
            scoreB += b.housenumber ? 200 : 0;
            scoreB += b.postcode ? 50 : 0;

            return scoreB - scoreA;
        });

        // Maximum 8 suggestions.
        results = results.slice(0, 8);

        setCachedResults(cacheKey, results);

        console.log("OPENSTREETMAP ADDRESS SEARCH:", {
            query,
            countryCode: resolvedCountryCode,
            resultCount: results.length,
        });

        return res.status(200).json(results);
    } catch (error) {
        console.error("SEARCH ADDRESS ERROR:", error);

        return res.status(500).json({
            message: "Failed to search addresses.",
        });
    }
};

// =========================
// ADD ADDRESS
// =========================

export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const {
            fullName,
            email,
            phone,
            street,
            address,
            city,
            postalCode,
            country,
            countryCode,
            isDefault = false,
        } = req.body;

        if (!street && !address) {
            return res.status(400).json({
                message: "Street address is required.",
            });
        }

        if (!city) {
            return res.status(400).json({
                message: "City is required.",
            });
        }

        if (!postalCode) {
            return res.status(400).json({
                message: "Postal code is required.",
            });
        }

        if (!country) {
            return res.status(400).json({
                message: "Country is required.",
            });
        }

        if (
            user.addresses &&
            user.addresses.length >= 5
        ) {
            return res.status(400).json({
                message: "You can save a maximum of 5 addresses.",
            });
        }

        // =========================
        // SET DEFAULT
        // =========================

        if (
            isDefault &&
            Array.isArray(user.addresses)
        ) {
            user.addresses.forEach((savedAddress) => {
                savedAddress.isDefault = false;
            });
        }

        const shouldBeDefault =
            user.addresses.length === 0 ||
            Boolean(isDefault);

        // =========================
        // PUSH ADDRESS
        // =========================

        user.addresses.push({
            fullName:
                fullName ||
                `${user.firstName || ""} ${user.lastName || ""}`
                    .trim(),

            email:
                typeof email === "string"
                    ? email.trim().toLowerCase()
                    : email,

            phone: phone || "",

            street: street || address || "",

            city: String(city).trim(),

            postalCode: String(postalCode).trim(),

            country: String(country).trim(),

            countryCode: countryCode
                ? String(countryCode).trim().toLowerCase()
                : getCountryCode(country),

            isDefault: shouldBeDefault,
        });

        await user.save();

        return res.status(201).json(user.addresses);
    } catch (error) {
        console.error("ADD ADDRESS ERROR:", error);

        return res.status(500).json({
            message: "Failed to add address.",
        });
    }
};

// =========================
// GET ADDRESSES
// =========================

export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        if (!Array.isArray(user.addresses)) {
            user.addresses = [];
        }

        const defaultAddresses = user.addresses.filter(
            (address) => address.isDefault
        );

        const defaultCount = defaultAddresses.length;

        /*
         * Exactly one primary address
         * when addresses exist.
         */

        if (
            user.addresses.length > 0 &&
            defaultCount === 0
        ) {
            user.addresses[0].isDefault = true;

            await user.save();
        } else if (defaultCount > 1) {
            let foundDefault = false;

            user.addresses.forEach((address) => {
                if (address.isDefault && !foundDefault) {
                    foundDefault = true;
                } else {
                    address.isDefault = false;
                }
            });

            await user.save();
        }

        return res.status(200).json(user.addresses);
    } catch (error) {
        console.error("GET ADDRESSES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch addresses.",
        });
    }
};

// =========================
// SET DEFAULT ADDRESS
// =========================

export const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found.",
            });
        }

        user.addresses.forEach((savedAddress) => {
            savedAddress.isDefault =
                String(savedAddress._id) ===
                String(req.params.id);
        });

        await user.save();

        return res.status(200).json(user.addresses);
    } catch (error) {
        console.error("SET DEFAULT ADDRESS ERROR:", error);

        return res.status(500).json({
            message: "Failed to set primary address.",
        });
    }
};

// =========================
// DELETE ADDRESS
// =========================

export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found.",
            });
        }

        const wasDefault = Boolean(address.isDefault);

        address.deleteOne();

        if (
            wasDefault &&
            user.addresses.length > 0
        ) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json(user.addresses);
    } catch (error) {
        console.error("DELETE ADDRESS ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete address.",
        });
    }
};