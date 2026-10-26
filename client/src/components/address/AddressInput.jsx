import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import {
    searchAddress,
} from "../../services/addressService";

export default function AddressInput({
    form,
    setForm,
    loading: formLoading,
}) {
    const [results, setResults] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [activeIndex, setActiveIndex] =
        useState(-1);

    const [selected, setSelected] =
        useState(false);

    const [locked, setLocked] =
        useState(false);

    const [showFallback, setShowFallback] =
        useState(false);

    const abortRef =
        useRef(null);

    const timeoutRef =
        useRef(null);

    const fallbackTimerRef =
        useRef(null);

    const wrapperRef =
        useRef(null);

    const listRef =
        useRef(null);

    const cacheRef =
        useRef({});

    const lastSelectedRef =
        useRef("");

    const lastRequestKeyRef =
        useRef("");

    const requestIdRef =
        useRef(0);

    // =========================
    // SEARCH CONFIG
    // =========================

    const SEARCH_DELAY = 600;

    const MIN_SEARCH_LENGTH = 3;

    const MAX_RESULTS = 8;

    // =========================
    // NORMALIZE TEXT
    // =========================

    const normalizeText =
        useCallback((value) => {
            return String(value || "")
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
        }, []);

    // =========================
    // GET COUNTRY CODE
    // =========================

    const getCountryCode =
        useCallback(
            (country) => {
                if (
                    typeof form.countryCode ===
                    "string" &&
                    form.countryCode.trim()
                ) {
                    return form.countryCode
                        .trim()
                        .toLowerCase();
                }

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

                return (
                    countryCodeMap[
                    normalizeText(
                        country
                    )
                    ] || ""
                );
            },
            [
                form.countryCode,
                normalizeText,
            ]
        );

    // =========================
    // GET HOUSE NUMBER
    // =========================

    const getHouseNumber =
        useCallback(
            (value) => {
                const normalized =
                    normalizeText(value);

                /*
                 * Supports:
                 *
                 * 14
                 * 14A
                 * 14-16
                 * 14A-16B
                 * 14/16
                 */

                const match =
                    normalized.match(
                        /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
                    );

                return match
                    ? match[1]
                    : "";
            },
            [normalizeText]
        );

    // =========================
    // GET RESULT HOUSE NUMBER
    // =========================

    const getResultHouseNumber =
        useCallback(
            (place) => {
                /*
                 * Google/provider can expose the
                 * house number under different fields.
                 */

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

                if (
                    explicitHouseNumber
                ) {
                    return String(
                        explicitHouseNumber
                    ).trim();
                }

                /*
                 * Google can sometimes return:
                 *
                 * Sibeliusgången 14,
                 * 164 73 Kista
                 *
                 * while street_number is not
                 * present in the returned object.
                 */

                const formatted =
                    place?.formatted ||
                    place?.formattedAddress ||
                    place?.display_name ||
                    place?.displayName?.text ||
                    "";

                const normalized =
                    normalizeText(
                        formatted
                    );

                /*
                 * First try the address part before
                 * the comma.
                 */

                const firstSegment =
                    normalized
                        .split(",")[0]
                        .trim();

                const firstSegmentMatch =
                    firstSegment.match(
                        /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
                    );

                if (
                    firstSegmentMatch
                ) {
                    return firstSegmentMatch[1];
                }

                /*
                 * Also support a number immediately
                 * before a comma/end of address.
                 */

                const match =
                    normalized.match(
                        /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)(?=\s*(?:,|$))/
                    );

                if (match) {
                    return match[1];
                }

                /*
                 * Fallback:
                 * find the first house number.
                 */

                const fallback =
                    normalized.match(
                        /\b(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\b/
                    );

                return fallback
                    ? fallback[1]
                    : "";
            },
            [normalizeText]
        );

    // =========================
    // GET RESULT STREET
    // =========================

    const getResultStreet =
        useCallback(
            (place) => {
                return (
                    place?.street ||
                    place?.address?.street ||
                    place?.address?.road ||
                    ""
                );
            },
            []
        );

    // =========================
    // GET RESULT CITY
    // =========================

    const getResultCity =
        useCallback(
            (place) => {
                return (
                    place?.city ||
                    place?.address?.city ||
                    place?.address?.town ||
                    place?.address?.village ||
                    place?.address?.municipality ||
                    ""
                );
            },
            []
        );

    // =========================
    // GET RESULT POSTAL CODE
    // =========================

    const getResultPostalCode =
        useCallback(
            (place) => {
                return (
                    place?.postcode ||
                    place?.postalCode ||
                    place?.postal_code ||
                    place?.address?.postcode ||
                    place?.address?.postalCode ||
                    place?.address?.postal_code ||
                    ""
                );
            },
            []
        );

    // =========================
    // GET RESULT COUNTRY
    // =========================

    const getResultCountry =
        useCallback(
            (place) => {
                return (
                    place?.country ||
                    place?.address?.country ||
                    ""
                );
            },
            []
        );

    // =========================
    // GET RESULT COUNTRY CODE
    // =========================

    const getResultCountryCode =
        useCallback(
            (place) => {
                return (
                    place?.country_code ||
                    place?.countryCode ||
                    place?.address?.country_code ||
                    place?.address?.countryCode ||
                    ""
                );
            },
            []
        );

    // =========================
    // CLICK OUTSIDE
    // =========================

    useEffect(() => {
        const handleClickOutside =
            (event) => {
                if (
                    wrapperRef.current &&
                    !wrapperRef.current.contains(
                        event.target
                    )
                ) {
                    setResults([]);
                    setActiveIndex(-1);
                }
            };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // =========================
    // CLEANUP
    // =========================

    useEffect(() => {
        return () => {
            if (
                timeoutRef.current
            ) {
                clearTimeout(
                    timeoutRef.current
                );
            }

            if (
                fallbackTimerRef.current
            ) {
                clearTimeout(
                    fallbackTimerRef.current
                );
            }

            if (
                abortRef.current
            ) {
                abortRef.current.abort();
            }

            requestIdRef.current += 1;
        };
    }, []);

    // =========================
    // RANK RESULTS
    // =========================

    const rankResults =
        useCallback(
            (
                items,
                query
            ) => {
                const normalizedQuery =
                    normalizeText(
                        query
                    );

                const requestedHouseNumber =
                    getHouseNumber(
                        query
                    );

                const requestedCity =
                    normalizeText(
                        form.city
                    );

                const requestedPostalCode =
                    normalizeText(
                        form.postalCode
                    );

                return [...items]
                    .sort(
                        (a, b) => {
                            let scoreA = 0;
                            let scoreB = 0;

                            const labelA =
                                normalizeText(
                                    a.formatted ||
                                    a.display_name ||
                                    a.formattedAddress ||
                                    ""
                                );

                            const labelB =
                                normalizeText(
                                    b.formatted ||
                                    b.display_name ||
                                    b.formattedAddress ||
                                    ""
                                );

                            const streetA =
                                normalizeText(
                                    getResultStreet(
                                        a
                                    )
                                );

                            const streetB =
                                normalizeText(
                                    getResultStreet(
                                        b
                                    )
                                );

                            const houseA =
                                normalizeText(
                                    getResultHouseNumber(
                                        a
                                    )
                                );

                            const houseB =
                                normalizeText(
                                    getResultHouseNumber(
                                        b
                                    )
                                );

                            const postcodeA =
                                normalizeText(
                                    getResultPostalCode(
                                        a
                                    )
                                );

                            const postcodeB =
                                normalizeText(
                                    getResultPostalCode(
                                        b
                                    )
                                );

                            const cityA =
                                normalizeText(
                                    getResultCity(
                                        a
                                    )
                                );

                            const cityB =
                                normalizeText(
                                    getResultCity(
                                        b
                                    )
                                );

                            // =========================
                            // QUERY
                            // =========================

                            if (
                                normalizedQuery &&
                                labelA.includes(
                                    normalizedQuery
                                )
                            ) {
                                scoreA += 20;
                            }

                            if (
                                normalizedQuery &&
                                labelB.includes(
                                    normalizedQuery
                                )
                            ) {
                                scoreB += 20;
                            }

                            // =========================
                            // CITY
                            // =========================

                            if (
                                requestedCity &&
                                cityA ===
                                requestedCity
                            ) {
                                scoreA += 50000;
                            }

                            if (
                                requestedCity &&
                                cityB ===
                                requestedCity
                            ) {
                                scoreB += 50000;
                            }

                            // =========================
                            // POSTCODE
                            // =========================

                            if (
                                requestedPostalCode &&
                                postcodeA ===
                                requestedPostalCode
                            ) {
                                scoreA += 80000;
                            }

                            if (
                                requestedPostalCode &&
                                postcodeB ===
                                requestedPostalCode
                            ) {
                                scoreB += 80000;
                            }

                            // =========================
                            // HOUSE NUMBER
                            // =========================

                            if (
                                requestedHouseNumber &&
                                houseA ===
                                normalizeText(
                                    requestedHouseNumber
                                )
                            ) {
                                scoreA += 100000;
                            }

                            if (
                                requestedHouseNumber &&
                                houseB ===
                                normalizeText(
                                    requestedHouseNumber
                                )
                            ) {
                                scoreB += 100000;
                            }

                            // =========================
                            // STREET
                            // =========================

                            if (
                                streetA
                            ) {
                                scoreA += 100;
                            }

                            if (
                                streetB
                            ) {
                                scoreB += 100;
                            }

                            // =========================
                            // POSTCODE EXISTS
                            // =========================

                            if (
                                postcodeA
                            ) {
                                scoreA += 50;
                            }

                            if (
                                postcodeB
                            ) {
                                scoreB += 50;
                            }

                            // =========================
                            // BUILDING / STREET ADDRESS
                            // =========================

                            const typeA =
                                String(
                                    a.result_type ||
                                    a.match_type ||
                                    ""
                                ).toLowerCase();

                            const typeB =
                                String(
                                    b.result_type ||
                                    b.match_type ||
                                    ""
                                ).toLowerCase();

                            if (
                                typeA ===
                                "building" ||
                                typeA ===
                                "street_address" ||
                                typeA ===
                                "premise" ||
                                typeA ===
                                "subpremise"
                            ) {
                                scoreA += 100;
                            }

                            if (
                                typeB ===
                                "building" ||
                                typeB ===
                                "street_address" ||
                                typeB ===
                                "premise" ||
                                typeB ===
                                "subpremise"
                            ) {
                                scoreB += 100;
                            }

                            return (
                                scoreB -
                                scoreA
                            );
                        }
                    )
                    .slice(
                        0,
                        MAX_RESULTS
                    );
            },
            [
                normalizeText,
                getHouseNumber,
                getResultHouseNumber,
                getResultStreet,
                getResultCity,
                getResultPostalCode,
                form.city,
                form.postalCode,
            ]
        );

    // =========================
    // SEARCH ADDRESS
    // =========================

    useEffect(() => {
        if (
            timeoutRef.current
        ) {
            clearTimeout(
                timeoutRef.current
            );
        }

        /*
         * Abort the previous request immediately
         * when the input changes.
         *
         * This prevents old Google responses from
         * competing with newer searches.
         */

        if (
            abortRef.current
        ) {
            abortRef.current.abort();
            abortRef.current = null;
        }

        /*
         * Increment request id.
         *
         * Every search gets its own id.
         * An old request is never allowed to
         * update the UI after a newer request
         * has started.
         */

        requestIdRef.current += 1;

        const currentRequestId =
            requestIdRef.current;

        timeoutRef.current =
            setTimeout(
                async () => {
                    const query =
                        form.address?.trim() ||
                        "";

                    const country =
                        form.country;

                    const countryCode =
                        getCountryCode(
                            country
                        );

                    const city =
                        form.city?.trim() ||
                        "";

                    const postalCode =
                        form.postalCode?.trim() ||
                        "";

                    setShowFallback(
                        false
                    );

                    if (
                        formLoading
                    ) {
                        setResults([]);
                        setActiveIndex(-1);
                        setLoading(false);
                        return;
                    }

                    if (
                        locked
                    ) {
                        setResults([]);
                        setActiveIndex(-1);
                        setLoading(false);
                        return;
                    }

                    /*
                     * Do not call Google for fewer than
                     * three characters.
                     */

                    if (
                        !query ||
                        query.length <
                        MIN_SEARCH_LENGTH ||
                        !country
                    ) {
                        setResults([]);
                        setActiveIndex(-1);
                        setLoading(false);
                        return;
                    }

                    /*
                     * Build one stable key for this exact
                     * search context.
                     *
                     * Same query + same country/city/postal
                     * code = same search.
                     */

                    const cacheKey =
                        [
                            countryCode,
                            normalizeText(
                                city
                            ),
                            normalizeText(
                                postalCode
                            ),
                            normalizeText(
                                query
                            ),
                        ].join("|");

                    /*
                     * Never send the exact same request
                     * twice in a row.
                     */

                    if (
                        lastRequestKeyRef.current ===
                        cacheKey
                    ) {
                        return;
                    }

                    /*
                     * Return cached results without
                     * calling Google again.
                     */

                    if (
                        Object.prototype.hasOwnProperty.call(
                            cacheRef.current,
                            cacheKey
                        )
                    ) {
                        const cachedResults =
                            cacheRef.current[
                            cacheKey
                            ];

                        setResults(
                            cachedResults
                        );

                        setActiveIndex(
                            -1
                        );

                        setLoading(
                            false
                        );

                        if (
                            cachedResults.length ===
                            0
                        ) {
                            if (
                                fallbackTimerRef.current
                            ) {
                                clearTimeout(
                                    fallbackTimerRef.current
                                );
                            }

                            fallbackTimerRef.current =
                                setTimeout(
                                    () => {
                                        setShowFallback(
                                            true
                                        );
                                    },
                                    500
                                );
                        }

                        return;
                    }

                    lastRequestKeyRef.current =
                        cacheKey;

                    const controller =
                        new AbortController();

                    abortRef.current =
                        controller;

                    try {
                        setLoading(
                            true
                        );

                        console.log(
                            "ADDRESS INPUT SEARCH:",
                            {
                                query,
                                country,
                                countryCode,
                                city,
                                postalCode,
                                houseNumber:
                                    getHouseNumber(
                                        query
                                    ),
                            }
                        );

                        const data =
                            await searchAddress(
                                query,
                                country,
                                city,
                                postalCode,
                                controller.signal,
                                countryCode
                            );

                        /*
                         * If this request is no longer
                         * the latest request, ignore it.
                         */

                        if (
                            currentRequestId !==
                            requestIdRef.current
                        ) {
                            return;
                        }

                        const safeData =
                            Array.isArray(
                                data
                            )
                                ? data
                                : [];

                        console.log(
                            "ADDRESS INPUT RESULTS:",
                            safeData
                        );

                        const ranked =
                            rankResults(
                                safeData,
                                query
                            );

                        const requestedHouseNumber =
                            getHouseNumber(
                                query
                            );

                        let finalResults =
                            ranked;

                        // =========================
                        // EXACT HOUSE NUMBER
                        // =========================

                        if (
                            requestedHouseNumber
                        ) {
                            const normalizedHouse =
                                normalizeText(
                                    requestedHouseNumber
                                );

                            const houseMatches =
                                ranked.filter(
                                    (
                                        item
                                    ) => {
                                        const resultHouse =
                                            normalizeText(
                                                getResultHouseNumber(
                                                    item
                                                )
                                            );

                                        return (
                                            resultHouse ===
                                            normalizedHouse
                                        );
                                    }
                                );

                            /*
                             * If Google exposes the exact
                             * house number, prefer those
                             * results.
                             *
                             * If Google does not expose
                             * enough house-number data,
                             * keep the ranked results.
                             */

                            if (
                                houseMatches.length >
                                0
                            ) {
                                finalResults =
                                    houseMatches.slice(
                                        0,
                                        MAX_RESULTS
                                    );
                            } else {
                                finalResults =
                                    ranked;
                            }
                        }

                        /*
                         * City and postal code are NOT
                         * filtered out here.
                         *
                         * They are used for ranking only.
                         *
                         * This allows Google to show
                         * multiple possible addresses
                         * when city has not been selected.
                         */

                        if (
                            requestedHouseNumber &&
                            finalResults.length ===
                            0
                        ) {
                            console.log(
                                "ADDRESS INPUT: No exact house number match."
                            );
                        }

                        // =========================
                        // SAVE CACHE
                        // =========================

                        cacheRef.current[
                            cacheKey
                        ] = finalResults;

                        setResults(
                            finalResults
                        );

                        setActiveIndex(
                            -1
                        );

                        if (
                            fallbackTimerRef.current
                        ) {
                            clearTimeout(
                                fallbackTimerRef.current
                            );
                        }

                        if (
                            finalResults.length ===
                            0
                        ) {
                            fallbackTimerRef.current =
                                setTimeout(
                                    () => {
                                        if (
                                            currentRequestId ===
                                            requestIdRef.current
                                        ) {
                                            setShowFallback(
                                                true
                                            );
                                        }
                                    },
                                    500
                                );
                        }
                    } catch (error) {
                        if (
                            error?.name ===
                            "AbortError"
                        ) {
                            return;
                        }

                        /*
                         * Ignore errors from old requests.
                         */

                        if (
                            currentRequestId !==
                            requestIdRef.current
                        ) {
                            return;
                        }

                        console.error(
                            "ADDRESS SEARCH ERROR:",
                            error
                        );

                        setResults([]);
                        setActiveIndex(
                            -1
                        );

                        /*
                         * Do not repeatedly show fallback
                         * while the user is typing.
                         */

                        if (
                            fallbackTimerRef.current
                        ) {
                            clearTimeout(
                                fallbackTimerRef.current
                            );
                        }

                        fallbackTimerRef.current =
                            setTimeout(
                                () => {
                                    if (
                                        currentRequestId ===
                                        requestIdRef.current
                                    ) {
                                        setShowFallback(
                                            true
                                        );
                                    }
                                },
                                500
                            );
                    } finally {
                        /*
                         * Only the latest request is
                         * allowed to change loading state.
                         */

                        if (
                            currentRequestId ===
                            requestIdRef.current
                        ) {
                            setLoading(
                                false
                            );
                        }

                        if (
                            abortRef.current ===
                            controller
                        ) {
                            abortRef.current =
                                null;
                        }
                    }
                },
                SEARCH_DELAY
            );

        return () => {
            if (
                timeoutRef.current
            ) {
                clearTimeout(
                    timeoutRef.current
                );
            }
        };
    }, [
        form.address,
        form.country,
        form.city,
        form.postalCode,
        locked,
        formLoading,
        rankResults,
        getHouseNumber,
        normalizeText,
        getCountryCode,
        getResultHouseNumber,
    ]);

    // =========================
    // HIGHLIGHT
    // =========================

    const highlight = (
        text,
        query
    ) => {
        if (!query) {
            return text;
        }

        const safeText =
            String(text || "");

        const index =
            safeText
                .toLowerCase()
                .indexOf(
                    query.toLowerCase()
                );

        if (
            index === -1
        ) {
            return safeText;
        }

        return (
            <>
                {safeText.slice(
                    0,
                    index
                )}

                <mark>
                    {safeText.slice(
                        index,
                        index +
                        query.length
                    )}
                </mark>

                {safeText.slice(
                    index +
                    query.length
                )}
            </>
        );
    };

    // =========================
    // GET LABEL
    // =========================

    const getLabel = (
        place
    ) => {
        return (
            place.formatted ||
            place.display_name ||
            place.formattedAddress ||
            [
                getResultStreet(
                    place
                ),
                getResultHouseNumber(
                    place
                ),
                getResultPostalCode(
                    place
                ),
                getResultCity(
                    place
                ),
                getResultCountry(
                    place
                ),
            ]
                .filter(Boolean)
                .join(", ")
        );
    };

    // =========================
    // SELECT ADDRESS
    // =========================


    const selectAddress = (
        place
    ) => {
        const street =
            getResultStreet(
                place
            );

        const houseNumber =
            getResultHouseNumber(
                place
            );

        const city =
            getResultCity(
                place
            );

        const postalCode =
            getResultPostalCode(
                place
            );

        const country =
            getResultCountry(
                place
            ) ||
            form.country ||
            "";

        const googleCountryCode =
            getResultCountryCode(
                place
            );

        const fallbackCountryCode =
            getCountryCode(
                country
            );

        const countryCode =
            String(
                googleCountryCode ||
                fallbackCountryCode ||
                ""
            )
                .trim()
                .toLowerCase();

        const requestedHouseNumber =
            getHouseNumber(
                form.address
            );

        const requestedCity =
            form.city?.trim() ||
            "";

        const requestedPostalCode =
            form.postalCode?.trim() ||
            "";

        // =========================
        // REQUIRE STREET
        // =========================

        if (
            !street
        ) {
            console.warn(
                "ADDRESS REJECTED - MISSING STREET:",
                place
            );

            return;
        }

        // =========================
        // HOUSE NUMBER VALIDATION
        // =========================

        if (
            requestedHouseNumber
        ) {
            const normalizedRequestedHouse =
                normalizeText(
                    requestedHouseNumber
                );

            const normalizedResultHouse =
                normalizeText(
                    houseNumber
                );

            /*
             * If Google gives us the house number,
             * it must match.
             */

            if (
                normalizedResultHouse &&
                normalizedResultHouse !==
                normalizedRequestedHouse
            ) {
                console.warn(
                    "ADDRESS REJECTED - WRONG HOUSE NUMBER:",
                    {
                        requested:
                            requestedHouseNumber,

                        received:
                            houseNumber,

                        place,
                    }
                );

                return;
            }

            /*
             * If Google does not expose the house
             * number separately, check the formatted
             * address before accepting it.
             */

            if (
                !normalizedResultHouse
            ) {
                const formattedLabel =
                    getLabel(
                        place
                    );

                const formattedHouse =
                    getHouseNumber(
                        formattedLabel
                    );

                if (
                    formattedHouse &&
                    normalizeText(
                        formattedHouse
                    ) !==
                    normalizedRequestedHouse
                ) {
                    console.warn(
                        "ADDRESS REJECTED - WRONG HOUSE NUMBER FROM FORMATTED ADDRESS:",
                        {
                            requested:
                                requestedHouseNumber,

                            received:
                                formattedHouse,

                            place,
                        }
                    );

                    return;
                }
            }
        }

        // =========================
        // CITY VALIDATION
        // =========================

        /*
         * Only reject if BOTH values exist
         * and are definitely different.
         *
         * If Google does not return a city,
         * do not reject the address.
         */

        if (
            requestedCity &&
            city &&
            normalizeText(
                city
            ) !==
            normalizeText(
                requestedCity
            )
        ) {
            console.warn(
                "ADDRESS REJECTED - WRONG CITY:",
                {
                    requested:
                        requestedCity,

                    received:
                        city,

                    place,
                }
            );

            return;
        }

        // =========================
        // POSTAL CODE VALIDATION
        // =========================

        /*
         * Only reject if BOTH values exist
         * and are definitely different.
         */

        if (
            requestedPostalCode &&
            postalCode &&
            normalizeText(
                postalCode
            ) !==
            normalizeText(
                requestedPostalCode
            )
        ) {
            console.warn(
                "ADDRESS REJECTED - WRONG POSTAL CODE:",
                {
                    requested:
                        requestedPostalCode,

                    received:
                        postalCode,

                    place,
                }
            );

            return;
        }

        // =========================
        // REQUIRE COUNTRY CODE
        // =========================

        if (
            !countryCode
        ) {
            console.warn(
                "ADDRESS REJECTED - MISSING COUNTRY CODE:",
                place
            );

            return;
        }

        // =========================
        // BUILD CLEAN STREET
        // =========================

        let cleanStreet =
            street.trim();

        /*
         * If Google did not expose the house number
         * separately but the formatted address contains
         * the requested number, preserve the user's
         * house number in the final street field.
         */

        if (
            requestedHouseNumber &&
            !houseNumber
        ) {
            const formattedLabel =
                getLabel(
                    place
                );

            const formattedHouse =
                getHouseNumber(
                    formattedLabel
                );

            if (
                formattedHouse &&
                normalizeText(
                    formattedHouse
                ) ===
                normalizeText(
                    requestedHouseNumber
                )
            ) {
                cleanStreet =
                    `${cleanStreet} ${formattedHouse}`
                        .trim();
            } else if (
                !getHouseNumber(
                    cleanStreet
                )
            ) {
                cleanStreet =
                    `${cleanStreet} ${requestedHouseNumber}`
                        .trim();
            }
        } else if (
            houseNumber &&
            !getHouseNumber(
                cleanStreet
            )
        ) {
            cleanStreet =
                `${cleanStreet} ${houseNumber}`
                    .trim();
        }

        // =========================
        // FINAL VALIDATION
        // =========================

        if (
            !cleanStreet
        ) {
            console.warn(
                "ADDRESS REJECTED - EMPTY STREET AFTER NORMALIZATION:",
                place
            );

            return;
        }

        console.log(
            "ADDRESS SELECTED:",
            {
                address:
                    cleanStreet,

                city,

                postalCode,

                country,

                countryCode,
            }
        );

        // =========================
        // UPDATE FORM
        // =========================

        // Remember the exact selected street first.
        lastSelectedRef.current =
            cleanStreet;

        console.log(
            "ADDRESS VERIFICATION SET TO TRUE",
            {
                address: cleanStreet,
                addressVerified: true,
            }
        );

        setForm(
            (previous) => {
                const updatedForm = {
                    ...previous,

                    address:
                        cleanStreet,

                    city:
                        city ||
                        previous.city,

                    postalCode:
                        postalCode ||
                        previous.postalCode,

                    country:
                        country ||
                        previous.country,

                    countryCode:
                        countryCode,

                    addressVerified:
                        true,
                };

                console.log(
                    "ADDRESS FORM UPDATED:",
                    {
                        address: updatedForm.address,
                        addressVerified:
                            updatedForm.addressVerified,
                        city: updatedForm.city,
                        postalCode:
                            updatedForm.postalCode,
                        country:
                            updatedForm.country,
                    }
                );

                return updatedForm;
            }
        );

        setSelected(true);
        setLocked(true);
        setShowFallback(false);
        setResults([]);
        setActiveIndex(-1);

        if (
            abortRef.current
        ) {
            abortRef.current.abort();
            abortRef.current =
                null;
        }

        lastRequestKeyRef.current =
            "";
    };


    // =========================
    // KEYBOARD
    // =========================

    const handleKeyDown = (event) => {
        if (!results.length) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            setActiveIndex((previous) =>
                Math.min(previous + 1, results.length - 1)
            );

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            setActiveIndex((previous) =>
                previous <= 0
                    ? 0
                    : previous - 1
            );

            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (
                activeIndex >= 0 &&
                activeIndex < results.length
            ) {
                const selectedPlace = results[activeIndex];

                console.log(
                    "ADDRESS SELECTED BY KEYBOARD:",
                    selectedPlace
                );

                selectAddress(selectedPlace);
            }

            return;
        }

        if (event.key === "Escape") {
            setResults([]);
            setActiveIndex(-1);
        }
    };

    // =========================
    // SCROLL ACTIVE RESULT
    // =========================

    useEffect(() => {
        if (
            !listRef.current ||
            activeIndex < 0
        ) {
            return;
        }

        const element =
            listRef.current
                .children[
            activeIndex
            ];

        if (
            element
        ) {
            element.scrollIntoView({
                block:
                    "nearest",
            });
        }
    }, [
        activeIndex,
    ]);

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (
        value
    ) => {
        if (
            value !==
            lastSelectedRef.current
        ) {
            setSelected(false);
            setLocked(false);

            /*
             * A manually changed address is no
             * longer the address that was verified.
             */

            lastSelectedRef.current =
                "";
        }

        setShowFallback(false);
        setActiveIndex(-1);

        /*
         * Clear fallback timer so an old
         * "No verified address found" message
         * cannot appear for the new query.
         */

        if (
            fallbackTimerRef.current
        ) {
            clearTimeout(
                fallbackTimerRef.current
            );

            fallbackTimerRef.current =
                null;
        }

        /*
         * Clear old search results immediately
         * while the user is typing.
         */

        setResults([]);

        /*
         * When the user manually edits the
         * address after selecting a Google result,
         * the address is no longer verified.
         *
         * We deliberately keep city and postal
         * code because they can help Google
         * disambiguate addresses.
         */

        setForm(
            (previous) => ({
                ...previous,

                address:
                    value,

                addressVerified:
                    false,

                countryCode:
                    previous.countryCode ||
                    getCountryCode(
                        previous.country
                    ),

                ...(value.length ===
                    0 && {
                    city: "",
                    postalCode: "",
                }),
            })
        );
    };

    return (
        <div
            ref={
                wrapperRef
            }
        >
            <input
                name="address"
                value={
                    form.address
                }
                onChange={(event) =>
                    handleChange(
                        event.target.value
                    )
                }
                onKeyDown={
                    handleKeyDown
                }
                placeholder="Street address"
                autoComplete="off"
                disabled={
                    formLoading
                }
            />

            {loading && (
                <div>
                    Searching...
                </div>
            )}

            {results.length > 0 && (
                <ul
                    ref={
                        listRef
                    }
                >
                    {results.map(
                        (
                            place,
                            index
                        ) => (
                            <li
                                key={
                                    place.place_id ||
                                    place.id ||
                                    place.google_place_id ||
                                    index
                                }
                                onMouseDown={() =>
                                    selectAddress(
                                        place
                                    )
                                }
                                onMouseEnter={() =>
                                    setActiveIndex(
                                        index
                                    )
                                }
                                aria-selected={
                                    activeIndex ===
                                    index
                                }
                            >
                                {highlight(
                                    getLabel(
                                        place
                                    ),
                                    form.address
                                )}
                            </li>
                        )
                    )}
                </ul>
            )}

            {showFallback &&
                !selected &&
                !locked &&
                form.address.length >=
                MIN_SEARCH_LENGTH &&
                results.length ===
                0 && (
                    <div>
                        No verified address found.
                    </div>
                )}
        </div>
    );
}