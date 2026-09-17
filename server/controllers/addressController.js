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
// NORMALIZE TEXT
// =========================

const normalize = (
    value
) => {
    return String(
        value || ""
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^\p{L}\p{N}]+/gu,
            " "
        )
        .trim();
};

// =========================
// NORMALIZE HOUSE NUMBER
// =========================

const normalizeHouseNumber = (
    value
) => {
    return normalize(value)
        .replace(
            /\s+/g,
            ""
        );
};

// =========================
// DETECT HOUSE NUMBER
// =========================

const getHouseNumber = (
    value
) => {
    const normalized =
        normalize(value);

    const match =
        normalized.match(
            /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)$/
        );

    return match
        ? match[1]
        : "";
};

// =========================
// EXTRACT CITY FROM QUERY
// =========================

const getCityFromQuery = (
    value,
    houseNumber
) => {
    let query =
        String(
            value || ""
        ).trim();

    if (!query) {
        return "";
    }

    if (houseNumber) {
        const normalizedQuery =
            query.toLowerCase();

        const normalizedHouse =
            houseNumber.toLowerCase();

        const houseIndex =
            normalizedQuery.lastIndexOf(
                normalizedHouse
            );

        if (
            houseIndex !== -1
        ) {
            query =
                query.slice(
                    houseIndex +
                    houseNumber.length
                );
        }
    }

    query =
        query
            .replace(
                /^[,\s]+/,
                ""
            )
            .trim();

    if (!query) {
        return "";
    }

    return query;
};

// =========================
// EXTRACT STREET FROM QUERY
// =========================

const getStreetFromQuery = (
    value,
    houseNumber
) => {
    let query =
        String(
            value || ""
        ).trim();

    if (!query) {
        return "";
    }

    if (houseNumber) {
        const originalMatch =
            query.match(
                /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/i
            );

        if (originalMatch) {
            query =
                query
                    .slice(
                        0,
                        originalMatch.index
                    )
                    .trim();
        }
    }

    return query
        .replace(
            /[,\s]+$/,
            ""
        )
        .trim();
};

// =========================
// EXTRACT POSTAL CODE
// =========================

const getPostalCodeFromQuery = (
    value
) => {
    const query =
        String(
            value || ""
        ).trim();

    if (!query) {
        return "";
    }

    const match =
        query.match(
            /\b\d{3}\s?\d{2}\b/
        );

    return match
        ? match[0]
        : "";
};

// =========================
// EXTRACT CITY AFTER POSTAL CODE
// =========================

const getCityAfterPostalCode = (
    value
) => {
    const query =
        String(
            value || ""
        ).trim();

    if (!query) {
        return "";
    }

    const postalMatch =
        query.match(
            /\b\d{3}\s?\d{2}\b/
        );

    if (!postalMatch) {
        return "";
    }

    const afterPostal =
        query
            .slice(
                postalMatch.index +
                postalMatch[0].length
            )
            .replace(
                /^[,\s]+/,
                ""
            )
            .trim();

    if (!afterPostal) {
        return "";
    }

    return afterPostal
        .split(",")[0]
        .trim();
};

// =========================
// COUNTRY CODE
// =========================

const getCountryCode = (
    country
) => {
    return (
        countryCodeMap[
        normalize(country)
        ] || ""
    );
};

// =========================
// GOOGLE REQUEST
// =========================

const requestGoogle = async (
    url,
    options = {},
    timeoutMs = 7000
) => {
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            timeoutMs
        );

    try {
        const response =
            await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal,
                }
            );

        const text =
            await response.text();

        let data = null;

        try {
            data =
                text
                    ? JSON.parse(
                        text
                    )
                    : null;
        } catch {
            data = null;
        }

        return {
            response,
            data,
        };
    } finally {
        clearTimeout(
            timeout
        );
    }
};

// =========================
// GET GOOGLE ADDRESS COMPONENT
// =========================

const getAddressComponent = (
    components,
    type
) => {
    if (
        !Array.isArray(
            components
        )
    ) {
        return "";
    }

    const component =
        components.find(
            (item) =>
                Array.isArray(
                    item.types
                ) &&
                item.types.includes(
                    type
                )
        );

    return (
        component?.longText ||
        component?.shortText ||
        ""
    );
};

// =========================
// CLEAN GOOGLE PLACE
// =========================

const cleanGooglePlace = (
    place,
    fallbackCountry
) => {
    if (!place) {
        return null;
    }

    const components =
        place.addressComponents ||
        [];

    const street =
        getAddressComponent(
            components,
            "route"
        );

    const housenumber =
        getAddressComponent(
            components,
            "street_number"
        );

    const postcode =
        getAddressComponent(
            components,
            "postal_code"
        );

    const city =
        getAddressComponent(
            components,
            "postal_town"
        ) ||
        getAddressComponent(
            components,
            "locality"
        ) ||
        getAddressComponent(
            components,
            "administrative_area_level_2"
        ) ||
        getAddressComponent(
            components,
            "administrative_area_level_1"
        );

    const country =
        getAddressComponent(
            components,
            "country"
        ) ||
        fallbackCountry ||
        "";

    // =========================
    // IMPORTANT:
    // GET ISO COUNTRY CODE
    // FROM GOOGLE shortText
    // =========================

    const countryComponent =
        Array.isArray(
            components
        )
            ? components.find(
                (item) =>
                    Array.isArray(
                        item.types
                    ) &&
                    item.types.includes(
                        "country"
                    )
            )
            : null;

    const countryCode =
        countryComponent?.shortText
            ?.toLowerCase() ||
        "";

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

    const placeId =
        place.id ||
        "";

    return {
        id:
            String(
                placeId
            ),

        place_id:
            String(
                placeId
            ),

        display_name:
            formatted,

        formatted,

        address: {
            road:
                street,

            house_number:
                housenumber,

            street:
                street,

            housenumber:
                housenumber,

            postcode:
                postcode,

            city:
                city,

            country:
                country,

            country_code:
                countryCode,
        },

        country,

        country_code:
            countryCode,

        postcode,

        city,

        street,

        housenumber,

        lat:
            place.location?.latitude ??
            null,

        lon:
            place.location?.longitude ??
            null,

        result_type:
            Array.isArray(
                place.types
            )
                ? place.types[0] ||
                null
                : null,

        result_class:
            null,

        importance:
            1,

        confidence:
            1,

        confidence_city_level:
            city
                ? 1
                : null,

        confidence_building_level:
            housenumber
                ? 1
                : null,

        match_type:
            Array.isArray(
                place.types
            )
                ? place.types[0] ||
                null
                : null,

        google_place_id:
            placeId,

        google_name:
            place.displayName?.text ||
            "",
    };
};

// =========================
// GET GOOGLE PLACE DETAILS
// =========================

const getGooglePlaceDetails =
    async (
        placeId,
        apiKey
    ) => {
        if (
            !placeId ||
            !apiKey
        ) {
            return null;
        }

        const url =
            `https://places.googleapis.com/v1/places/${encodeURIComponent(
                placeId
            )}`;

        const {
            response,
            data,
        } =
            await requestGoogle(
                url,
                {
                    method:
                        "GET",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-Goog-Api-Key":
                            apiKey,

                        "X-Goog-FieldMask":
                            [
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

        if (
            !response.ok
        ) {
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
// SEARCH ADDRESS
// =========================

export const searchAddress = async (
    req,
    res
) => {
    try {
        const {
            q = "",
            country = "",
            city = "",
            postalCode = "",
            countryCode: requestedCountryCode = "",
        } = req.query;

        const apiKey =
            process.env.GOOGLE_MAPS_API_KEY ||
            process.env.GOOGLE_PLACES_API_KEY ||
            "";

        if (!apiKey) {
            return res.status(500).json({
                message:
                    "Google Maps API key is not configured.",
            });
        }

        const query =
            String(q || "").trim();

        if (!query || query.length < 3) {
            return res.status(200).json([]);
        }

        const fallbackCountryCode =
            getCountryCode(country);

        const countryCode =
            /^[a-z]{2}$/i.test(
                String(
                    requestedCountryCode || ""
                ).trim()
            )
                ? String(
                    requestedCountryCode
                )
                    .trim()
                    .toLowerCase()
                : fallbackCountryCode;

        const requestedHouseNumber =
            getHouseNumber(query);

        const requestedStreet =
            getStreetFromQuery(
                query,
                requestedHouseNumber
            );

        const requestedPostalCode =
            String(
                postalCode ||
                getPostalCodeFromQuery(
                    query
                ) ||
                ""
            ).trim();

        const requestedCity =
            String(
                city ||
                getCityAfterPostalCode(
                    query
                ) ||
                getCityFromQuery(
                    query,
                    requestedHouseNumber
                ) ||
                ""
            ).trim();

        // =====================================================
        // GOOGLE PLACES API
        // =====================================================

        const searchUrl =
            "https://places.googleapis.com/v1/places:searchText";

        const requestBody = {
            textQuery: query,

            languageCode:
                "en",

            pageSize:
                10,
        };

        if (countryCode) {
            requestBody.regionCode =
                countryCode.toUpperCase();
        }

        if (requestedCity) {
            requestBody.textQuery =
                `${query}, ${requestedCity}`;
        }

        const {
            response,
            data,
        } =
            await requestGoogle(
                searchUrl,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-Goog-Api-Key":
                            apiKey,

                        "X-Goog-FieldMask":
                            [
                                "places.id",
                                "places.displayName",
                                "places.formattedAddress",
                                "places.addressComponents",
                                "places.location",
                                "places.types",
                            ].join(","),
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        ),
                }
            );

        if (!response.ok) {
            console.error(
                "GOOGLE PLACES SEARCH FAILED:",
                response.status,
                data
            );

            return res.status(502).json({
                message:
                    "Google address search failed.",
            });
        }

        const places =
            Array.isArray(
                data?.places
            )
                ? data.places
                : [];

        // =====================================================
        // CLEAN GOOGLE RESULTS
        // =====================================================

        let results =
            places
                .map(
                    (place) =>
                        cleanGooglePlace(
                            place,
                            country
                        )
                )
                .filter(Boolean);

        // =====================================================
        // FILTER COUNTRY
        // =====================================================

        if (countryCode) {
            results =
                results.filter(
                    (place) => {
                        const resultCountryCode =
                            String(
                                place.country_code ||
                                place.address
                                    ?.country_code ||
                                ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            !resultCountryCode ||
                            resultCountryCode ===
                            countryCode
                        );
                    }
                );
        }

        // =====================================================
        // FILTER HOUSE NUMBER
        // =====================================================

        if (
            requestedHouseNumber
        ) {
            const normalizedRequestedHouse =
                normalizeHouseNumber(
                    requestedHouseNumber
                );

            results =
                results.filter(
                    (place) => {
                        const resultHouse =
                            normalizeHouseNumber(
                                place.housenumber ||
                                place.address
                                    ?.housenumber ||
                                place.address
                                    ?.house_number ||
                                ""
                            );

                        return (
                            resultHouse ===
                            normalizedRequestedHouse
                        );
                    }
                );
        }

        // =====================================================
        // FILTER CITY
        // =====================================================

        if (
            requestedCity &&
            results.length > 0
        ) {
            const normalizedRequestedCity =
                normalize(
                    requestedCity
                );

            const cityMatches =
                results.filter(
                    (place) => {
                        const resultCity =
                            normalize(
                                place.city ||
                                place.address
                                    ?.city ||
                                ""
                            );

                        return (
                            resultCity ===
                            normalizedRequestedCity
                        );
                    }
                );

            if (
                cityMatches.length > 0
            ) {
                results =
                    cityMatches;
            }
        }

        // =====================================================
        // FILTER POSTAL CODE
        // =====================================================

        if (
            requestedPostalCode &&
            results.length > 0
        ) {
            const normalizedRequestedPostal =
                normalize(
                    requestedPostalCode
                );

            const postalMatches =
                results.filter(
                    (place) => {
                        const resultPostal =
                            normalize(
                                place.postcode ||
                                place.address
                                    ?.postcode ||
                                ""
                            );

                        return (
                            resultPostal ===
                            normalizedRequestedPostal
                        );
                    }
                );

            if (
                postalMatches.length > 0
            ) {
                results =
                    postalMatches;
            }
        }

        // =====================================================
        // SORT RESULTS
        // =====================================================

        results.sort(
            (a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                const streetA =
                    normalize(
                        a.street
                    );

                const streetB =
                    normalize(
                        b.street
                    );

                const houseA =
                    normalizeHouseNumber(
                        a.housenumber
                    );

                const houseB =
                    normalizeHouseNumber(
                        b.housenumber
                    );

                const cityA =
                    normalize(
                        a.city
                    );

                const cityB =
                    normalize(
                        b.city
                    );

                const postalA =
                    normalize(
                        a.postcode
                    );

                const postalB =
                    normalize(
                        b.postcode
                    );

                if (
                    requestedStreet &&
                    streetA ===
                    normalize(
                        requestedStreet
                    )
                ) {
                    scoreA += 100;
                }

                if (
                    requestedStreet &&
                    streetB ===
                    normalize(
                        requestedStreet
                    )
                ) {
                    scoreB += 100;
                }

                if (
                    requestedHouseNumber &&
                    houseA ===
                    normalizeHouseNumber(
                        requestedHouseNumber
                    )
                ) {
                    scoreA += 1000;
                }

                if (
                    requestedHouseNumber &&
                    houseB ===
                    normalizeHouseNumber(
                        requestedHouseNumber
                    )
                ) {
                    scoreB += 1000;
                }

                if (
                    requestedCity &&
                    cityA ===
                    normalize(
                        requestedCity
                    )
                ) {
                    scoreA += 500;
                }

                if (
                    requestedCity &&
                    cityB ===
                    normalize(
                        requestedCity
                    )
                ) {
                    scoreB += 500;
                }

                if (
                    requestedPostalCode &&
                    postalA ===
                    normalize(
                        requestedPostalCode
                    )
                ) {
                    scoreA += 800;
                }

                if (
                    requestedPostalCode &&
                    postalB ===
                    normalize(
                        requestedPostalCode
                    )
                ) {
                    scoreB += 800;
                }

                if (
                    a.housenumber
                ) {
                    scoreA += 50;
                }

                if (
                    b.housenumber
                ) {
                    scoreB += 50;
                }

                return (
                    scoreB -
                    scoreA
                );
            }
        );

        return res.status(200).json(
            results
        );

    } catch (error) {
        console.error(
            "SEARCH ADDRESS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to search addresses.",
        });
    }
};

// =========================
// ADD ADDRESS
// =========================

export const addAddress = async (
    req,
    res
) => {
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
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

        if (
            !street &&
            !address
        ) {
            return res.status(400).json({
                message:
                    "Street address is required.",
            });
        }

        if (!city) {
            return res.status(400).json({
                message:
                    "City is required.",
            });
        }

        if (!postalCode) {
            return res.status(400).json({
                message:
                    "Postal code is required.",
            });
        }

        if (!country) {
            return res.status(400).json({
                message:
                    "Country is required.",
            });
        }

        if (
            user.addresses &&
            user.addresses.length >= 5
        ) {
            return res.status(400).json({
                message:
                    "You can save a maximum of 5 addresses.",
            });
        }

        if (
            isDefault &&
            Array.isArray(
                user.addresses
            )
        ) {
            user.addresses.forEach(
                (savedAddress) => {
                    savedAddress.isDefault =
                        false;
                }
            );
        }

        const shouldBeDefault =
            user.addresses.length ===
            0 ||
            Boolean(isDefault);

        user.addresses.push({
            fullName:
                fullName ||
                `${user.firstName || ""} ${user.lastName || ""}`.trim(),

            email:
                typeof email ===
                    "string"
                    ? email
                        .trim()
                        .toLowerCase()
                    : email,

            phone:
                phone || "",

            street:
                street ||
                address ||
                "",

            city:
                city.trim(),

            postalCode:
                postalCode.trim(),

            country:
                country.trim(),

            countryCode:
                countryCode
                    ? String(
                        countryCode
                    )
                        .trim()
                        .toLowerCase()
                    : getCountryCode(
                        country
                    ),

            isDefault:
                shouldBeDefault,
        });

        await user.save();

        return res.status(201).json(
            user.addresses
        );

    } catch (error) {
        console.error(
            "ADD ADDRESS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to add address.",
        });
    }
};

// =========================
// GET ADDRESSES
// =========================

export const getAddresses = async (
    req,
    res
) => {
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }

        if (
            !Array.isArray(
                user.addresses
            )
        ) {
            user.addresses = [];
        }

        let defaultCount =
            user.addresses.filter(
                (address) =>
                    address.isDefault
            ).length;

        if (
            user.addresses.length >
            0 &&
            defaultCount === 0
        ) {
            user.addresses[0].isDefault =
                true;

            await user.save();

        } else if (
            defaultCount > 1
        ) {
            let foundDefault =
                false;

            user.addresses.forEach(
                (address) => {
                    if (
                        address.isDefault &&
                        !foundDefault
                    ) {
                        foundDefault =
                            true;
                    } else {
                        address.isDefault =
                            false;
                    }
                }
            );

            await user.save();
        }

        return res.status(200).json(
            user.addresses
        );

    } catch (error) {
        console.error(
            "GET ADDRESSES ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch addresses.",
        });
    }
};

// =========================
// SET DEFAULT ADDRESS
// =========================

export const setDefaultAddress =
    async (
        req,
        res
    ) => {
        try {
            const user =
                await User.findById(
                    req.user._id
                );

            if (!user) {
                return res.status(404).json({
                    message:
                        "User not found.",
                });
            }

            const address =
                user.addresses.id(
                    req.params.id
                );

            if (!address) {
                return res.status(404).json({
                    message:
                        "Address not found.",
                });
            }

            user.addresses.forEach(
                (
                    savedAddress
                ) => {
                    savedAddress.isDefault =
                        savedAddress._id.toString() ===
                        req.params.id;
                }
            );

            await user.save();

            return res.status(200).json(
                user.addresses
            );

        } catch (error) {
            console.error(
                "SET DEFAULT ADDRESS ERROR:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to set primary address.",
            });
        }
    };

// =========================
// DELETE ADDRESS
// =========================

export const deleteAddress = async (
    req,
    res
) => {
    try {
        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }

        const address =
            user.addresses.id(
                req.params.id
            );

        if (!address) {
            return res.status(404).json({
                message:
                    "Address not found.",
            });
        }

        const wasDefault =
            Boolean(
                address.isDefault
            );

        address.deleteOne();

        if (
            wasDefault &&
            user.addresses.length >
            0
        ) {
            user.addresses[0].isDefault =
                true;
        }

        await user.save();

        return res.status(200).json(
            user.addresses
        );

    } catch (error) {
        console.error(
            "DELETE ADDRESS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete address.",
        });
    }
};