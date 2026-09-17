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
                    normalizeText(country)
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
                    normalizeText(
                        value
                    );

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

                return [...items].sort(
                    (a, b) => {
                        let scoreA = 0;
                        let scoreB = 0;

                        const labelA =
                            normalizeText(
                                a.formatted ||
                                a.display_name ||
                                ""
                            );

                        const labelB =
                            normalizeText(
                                b.formatted ||
                                b.display_name ||
                                ""
                            );

                        const streetA =
                            normalizeText(
                                a.street ||
                                a.address?.street ||
                                a.address?.road ||
                                ""
                            );

                        const streetB =
                            normalizeText(
                                b.street ||
                                b.address?.street ||
                                b.address?.road ||
                                ""
                            );

                        const houseA =
                            normalizeText(
                                a.housenumber ||
                                a.address?.housenumber ||
                                a.address?.house_number ||
                                ""
                            );

                        const houseB =
                            normalizeText(
                                b.housenumber ||
                                b.address?.housenumber ||
                                b.address?.house_number ||
                                ""
                            );

                        const postcodeA =
                            normalizeText(
                                a.postcode ||
                                a.address?.postcode ||
                                ""
                            );

                        const postcodeB =
                            normalizeText(
                                b.postcode ||
                                b.address?.postcode ||
                                ""
                            );

                        const cityA =
                            normalizeText(
                                a.city ||
                                a.address?.city ||
                                a.address?.town ||
                                a.address?.village ||
                                ""
                            );

                        const cityB =
                            normalizeText(
                                b.city ||
                                b.address?.city ||
                                b.address?.town ||
                                b.address?.village ||
                                ""
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
                );
            },
            [
                normalizeText,
                getHouseNumber,
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
                        !query ||
                        query.length < 3 ||
                        !country
                    ) {
                        setResults([]);
                        setActiveIndex(-1);
                        setLoading(false);
                        return;
                    }

                    if (locked) {
                        return;
                    }

                    const cacheKey =
                        [
                            country,
                            countryCode,
                            city,
                            postalCode,
                            query.toLowerCase(),
                        ].join("_");

                    if (
                        cacheRef.current[
                        cacheKey
                        ]
                    ) {
                        setResults(
                            cacheRef.current[
                            cacheKey
                            ]
                        );

                        setActiveIndex(-1);

                        return;
                    }

                    try {
                        setLoading(true);

                        if (
                            abortRef.current
                        ) {
                            abortRef.current.abort();
                        }

                        abortRef.current =
                            new AbortController();

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
                                abortRef.current
                                    .signal,
                                countryCode
                            );

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

                            finalResults =
                                ranked.filter(
                                    (item) => {
                                        const resultHouse =
                                            normalizeText(
                                                item.housenumber ||
                                                item.address?.housenumber ||
                                                item.address?.house_number ||
                                                ""
                                            );

                                        return (
                                            resultHouse ===
                                            normalizedHouse
                                        );
                                    }
                                );
                        }

                        // =========================
                        // CITY
                        // =========================

                        if (
                            city &&
                            finalResults.length >
                            0
                        ) {
                            const normalizedCity =
                                normalizeText(
                                    city
                                );

                            const cityMatches =
                                finalResults.filter(
                                    (item) => {
                                        const resultCity =
                                            normalizeText(
                                                item.city ||
                                                item.address?.city ||
                                                item.address?.town ||
                                                item.address?.village ||
                                                ""
                                            );

                                        return (
                                            resultCity ===
                                            normalizedCity
                                        );
                                    }
                                );

                            finalResults =
                                cityMatches;
                        }

                        // =========================
                        // POSTAL CODE
                        // =========================

                        if (
                            postalCode &&
                            finalResults.length >
                            0
                        ) {
                            const normalizedPostalCode =
                                normalizeText(
                                    postalCode
                                );

                            const postalMatches =
                                finalResults.filter(
                                    (item) => {
                                        const resultPostalCode =
                                            normalizeText(
                                                item.postcode ||
                                                item.address?.postcode ||
                                                ""
                                            );

                                        return (
                                            resultPostalCode ===
                                            normalizedPostalCode
                                        );
                                    }
                                );

                            finalResults =
                                postalMatches;
                        }

                        // =========================
                        // NEVER RETURN WRONG HOUSE
                        // =========================

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

                        setActiveIndex(-1);

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
                                        setShowFallback(
                                            true
                                        );
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

                        console.error(
                            "ADDRESS SEARCH ERROR:",
                            error
                        );

                        setResults([]);
                        setActiveIndex(-1);

                        fallbackTimerRef.current =
                            setTimeout(
                                () => {
                                    setShowFallback(
                                        true
                                    );
                                },
                                500
                            );
                    } finally {
                        setLoading(false);
                    }
                },
                300
            );

        return () =>
            clearTimeout(
                timeoutRef.current
            );
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

        const index =
            text
                .toLowerCase()
                .indexOf(
                    query.toLowerCase()
                );

        if (
            index === -1
        ) {
            return text;
        }

        return (
            <>
                {text.slice(
                    0,
                    index
                )}

                <mark>
                    {text.slice(
                        index,
                        index +
                        query.length
                    )}
                </mark>

                {text.slice(
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
            [
                place.street,
                place.housenumber,
                place.postcode,
                place.city,
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
            place.street ||
            place.address?.street ||
            place.address?.road ||
            "";

        const houseNumber =
            place.housenumber ||
            place.address?.housenumber ||
            place.address?.house_number ||
            "";

        const city =
            place.city ||
            place.address?.city ||
            place.address?.town ||
            place.address?.village ||
            "";

        const postalCode =
            place.postcode ||
            place.address?.postcode ||
            "";

        const country =
            place.country ||
            place.address?.country ||
            form.country ||
            "";

        const googleCountryCode =
            place.country_code ||
            place.address?.country_code ||
            "";

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
        // NEVER ACCEPT WRONG HOUSE
        // =========================

        if (
            requestedHouseNumber &&
            normalizeText(
                houseNumber
            ) !==
            normalizeText(
                requestedHouseNumber
            )
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

        // =========================
        // CITY VALIDATION
        // =========================

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
        // REQUIRE ADDRESS DATA
        // =========================

        if (
            requestedHouseNumber &&
            (
                !street ||
                !houseNumber
            )
        ) {
            console.warn(
                "ADDRESS REJECTED - INCOMPLETE ADDRESS:",
                place
            );

            return;
        }

        const cleanStreet =
            [
                street,
                houseNumber,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();

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

        setForm(
            (prev) => ({
                ...prev,

                address:
                    cleanStreet,

                city:
                    city ||
                    prev.city,

                postalCode:
                    postalCode ||
                    prev.postalCode,

                country:
                    country ||
                    prev.country,

                countryCode:
                    countryCode,

                addressVerified:
                    true,
            })
        );

        lastSelectedRef.current =
            cleanStreet;

        setSelected(true);
        setLocked(true);
        setShowFallback(false);
        setResults([]);
        setActiveIndex(-1);
    };

    // =========================
    // KEYBOARD
    // =========================

    const handleKeyDown = (
        event
    ) => {
        if (
            !results.length
        ) {
            return;
        }

        if (
            event.key ===
            "ArrowDown"
        ) {
            event.preventDefault();

            setActiveIndex(
                (previous) =>
                    Math.min(
                        previous + 1,
                        results.length -
                        1
                    )
            );
        }

        if (
            event.key ===
            "ArrowUp"
        ) {
            event.preventDefault();

            setActiveIndex(
                (previous) =>
                    Math.max(
                        previous - 1,
                        0
                    )
            );
        }

        if (
            event.key ===
            "Enter"
        ) {
            event.preventDefault();

            if (
                activeIndex >= 0
            ) {
                selectAddress(
                    results[
                    activeIndex
                    ]
                );
            }
        }

        if (
            event.key ===
            "Escape"
        ) {
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

        if (element) {
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
        }

        setShowFallback(false);

        setForm(
            (previous) => ({
                ...previous,

                address:
                    value,

                addressVerified:
                    false,

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
                3 &&
                results.length ===
                0 && (
                    <div>
                        No verified address found.
                    </div>
                )}
        </div>
    );
}