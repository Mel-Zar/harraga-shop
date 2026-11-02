
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
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selected, setSelected] = useState(false);
    const [locked, setLocked] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const abortRef = useRef(null);
    const timeoutRef = useRef(null);
    const fallbackTimerRef = useRef(null);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);
    const cacheRef = useRef({});
    const lastSelectedRef = useRef("");
    const lastRequestKeyRef = useRef("");
    const requestIdRef = useRef(0);

    // =========================
    // SEARCH CONFIG
    // =========================

    const SEARCH_DELAY = 600;
    const MIN_SEARCH_LENGTH = 3;
    const MAX_RESULTS = 8;

    // =========================
    // NORMALIZE TEXT
    // =========================

    const normalizeText = useCallback((value) => {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}]+/gu, " ")
            .trim();
    }, []);

    // =========================
    // CAPITALIZE FIRST LETTER
    // =========================

    const capitalizeFirstLetter = useCallback((value) => {
        const text = String(value || "").trim();

        if (!text) return "";

        return text.charAt(0).toLocaleUpperCase() + text.slice(1);
    }, []);

    // =========================
    // GET COUNTRY CODE
    // =========================

    const getCountryCode = useCallback(
        (country) => {
            if (
                typeof form.countryCode === "string" &&
                form.countryCode.trim()
            ) {
                return form.countryCode.trim().toLowerCase();
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
                countryCodeMap[normalizeText(country)] || ""
            );
        },
        [form.countryCode, normalizeText]
    );

    // =========================
    // GET HOUSE NUMBER
    // =========================

    const getHouseNumber = useCallback(
        (value) => {
            const normalized = normalizeText(value);

            const match = normalized.match(
                /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
            );

            return match ? match[1] : "";
        },
        [normalizeText]
    );

    // =========================
    // GET RESULT HOUSE NUMBER
    // =========================

    const getResultHouseNumber = useCallback(
        (place) => {
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

            const formatted =
                place?.formatted ||
                place?.formattedAddress ||
                place?.display_name ||
                place?.displayName?.text ||
                "";

            const normalized = normalizeText(formatted);

            const firstSegment = normalized.split(",")[0].trim();

            const firstSegmentMatch = firstSegment.match(
                /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\s*$/
            );

            if (firstSegmentMatch) {
                return firstSegmentMatch[1];
            }

            const match = normalized.match(
                /(?:^|\s)(\d+[a-z]?(?:[-/]\d+[a-z]?)?)(?=\s*(?:,|$))/
            );

            if (match) {
                return match[1];
            }

            const fallback = normalized.match(
                /\b(\d+[a-z]?(?:[-/]\d+[a-z]?)?)\b/
            );

            return fallback ? fallback[1] : "";
        },
        [normalizeText]
    );

    // =========================
    // GET RESULT STREET
    // =========================

    const getResultStreet = useCallback((place) => {
        return (
            place?.street ||
            place?.address?.street ||
            place?.address?.road ||
            ""
        );
    }, []);

    // =========================
    // GET RESULT CITY
    // =========================

    const getResultCity = useCallback((place) => {
        return (
            place?.city ||
            place?.address?.city ||
            place?.address?.town ||
            place?.address?.village ||
            place?.address?.municipality ||
            ""
        );
    }, []);

    // =========================
    // GET RESULT POSTAL CODE
    // =========================

    const getResultPostalCode = useCallback((place) => {
        return (
            place?.postcode ||
            place?.postalCode ||
            place?.postal_code ||
            place?.address?.postcode ||
            place?.address?.postalCode ||
            place?.address?.postal_code ||
            ""
        );
    }, []);

    // =========================
    // GET RESULT COUNTRY
    // =========================

    const getResultCountry = useCallback((place) => {
        return (
            place?.country ||
            place?.address?.country ||
            ""
        );
    }, []);

    // =========================
    // GET RESULT COUNTRY CODE
    // =========================

    const getResultCountryCode = useCallback((place) => {
        return (
            place?.country_code ||
            place?.countryCode ||
            place?.address?.country_code ||
            place?.address?.countryCode ||
            ""
        );
    }, []);

    // =========================
    // CLICK OUTSIDE
    // =========================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setResults([]);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

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
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            if (fallbackTimerRef.current) {
                clearTimeout(fallbackTimerRef.current);
            }

            if (abortRef.current) {
                abortRef.current.abort();
            }

            requestIdRef.current += 1;
        };
    }, []);

    // =========================
    // RANK RESULTS
    // =========================

    const rankResults = useCallback(
        (items, query) => {
            const normalizedQuery = normalizeText(query);
            const requestedHouseNumber = getHouseNumber(query);
            const requestedCity = normalizeText(form.city);
            const requestedPostalCode = normalizeText(form.postalCode);

            return [...items]
                .sort((a, b) => {
                    let scoreA = 0;
                    let scoreB = 0;

                    const labelA = normalizeText(
                        a.formatted ||
                        a.display_name ||
                        a.formattedAddress ||
                        ""
                    );

                    const labelB = normalizeText(
                        b.formatted ||
                        b.display_name ||
                        b.formattedAddress ||
                        ""
                    );

                    const streetA = normalizeText(getResultStreet(a));
                    const streetB = normalizeText(getResultStreet(b));

                    const houseA = normalizeText(getResultHouseNumber(a));
                    const houseB = normalizeText(getResultHouseNumber(b));

                    const postcodeA = normalizeText(getResultPostalCode(a));
                    const postcodeB = normalizeText(getResultPostalCode(b));

                    const cityA = normalizeText(getResultCity(a));
                    const cityB = normalizeText(getResultCity(b));

                    if (normalizedQuery && labelA.includes(normalizedQuery)) {
                        scoreA += 20;
                    }

                    if (normalizedQuery && labelB.includes(normalizedQuery)) {
                        scoreB += 20;
                    }

                    if (requestedCity && cityA === requestedCity) {
                        scoreA += 50000;
                    }

                    if (requestedCity && cityB === requestedCity) {
                        scoreB += 50000;
                    }

                    if (requestedPostalCode && postcodeA === requestedPostalCode) {
                        scoreA += 80000;
                    }

                    if (requestedPostalCode && postcodeB === requestedPostalCode) {
                        scoreB += 80000;
                    }

                    if (
                        requestedHouseNumber &&
                        houseA === normalizeText(requestedHouseNumber)
                    ) {
                        scoreA += 100000;
                    }

                    if (
                        requestedHouseNumber &&
                        houseB === normalizeText(requestedHouseNumber)
                    ) {
                        scoreB += 100000;
                    }

                    if (streetA) scoreA += 100;
                    if (streetB) scoreB += 100;

                    if (postcodeA) scoreA += 50;
                    if (postcodeB) scoreB += 50;

                    const typeA = String(
                        a.result_type || a.match_type || ""
                    ).toLowerCase();

                    const typeB = String(
                        b.result_type || b.match_type || ""
                    ).toLowerCase();

                    if (
                        ["building", "street_address", "premise", "subpremise"]
                            .includes(typeA)
                    ) {
                        scoreA += 100;
                    }

                    if (
                        ["building", "street_address", "premise", "subpremise"]
                            .includes(typeB)
                    ) {
                        scoreB += 100;
                    }

                    return scoreB - scoreA;
                })
                .slice(0, MAX_RESULTS);
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
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }

        requestIdRef.current += 1;

        const currentRequestId = requestIdRef.current;

        timeoutRef.current = setTimeout(async () => {
            const query = form.address?.trim() || "";
            const country = form.country;
            const countryCode = getCountryCode(country);
            const city = form.city?.trim() || "";
            const postalCode = form.postalCode?.trim() || "";

            setShowFallback(false);

            if (formLoading || locked) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                return;
            }

            if (
                !query ||
                query.length < MIN_SEARCH_LENGTH ||
                !country
            ) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                return;
            }

            const cacheKey = [
                countryCode,
                normalizeText(city),
                normalizeText(postalCode),
                normalizeText(query),
            ].join("|");

            if (lastRequestKeyRef.current === cacheKey) {
                return;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    cacheRef.current,
                    cacheKey
                )
            ) {
                const cachedResults = cacheRef.current[cacheKey];

                setResults(cachedResults);
                setActiveIndex(-1);
                setLoading(false);

                if (cachedResults.length === 0) {
                    if (fallbackTimerRef.current) {
                        clearTimeout(fallbackTimerRef.current);
                    }

                    fallbackTimerRef.current = setTimeout(() => {
                        setShowFallback(true);
                    }, 500);
                }

                return;
            }

            lastRequestKeyRef.current = cacheKey;

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                setLoading(true);

                console.log("ADDRESS INPUT SEARCH:", {
                    query,
                    country,
                    countryCode,
                    city,
                    postalCode,
                    houseNumber: getHouseNumber(query),
                });

                const data = await searchAddress(
                    query,
                    country,
                    city,
                    postalCode,
                    controller.signal,
                    countryCode
                );

                if (currentRequestId !== requestIdRef.current) {
                    return;
                }

                const safeData = Array.isArray(data) ? data : [];

                console.log("ADDRESS INPUT RESULTS:", safeData);

                const ranked = rankResults(safeData, query);

                const requestedHouseNumber = getHouseNumber(query);
                let finalResults = ranked;

                if (requestedHouseNumber) {
                    const normalizedHouse = normalizeText(
                        requestedHouseNumber
                    );

                    const houseMatches = ranked.filter((item) => {
                        const resultHouse = normalizeText(
                            getResultHouseNumber(item)
                        );

                        return resultHouse === normalizedHouse;
                    });

                    if (houseMatches.length > 0) {
                        finalResults = houseMatches.slice(0, MAX_RESULTS);
                    } else {
                        finalResults = ranked;
                    }
                }

                cacheRef.current[cacheKey] = finalResults;

                setResults(finalResults);
                setActiveIndex(-1);

                if (fallbackTimerRef.current) {
                    clearTimeout(fallbackTimerRef.current);
                }

                if (finalResults.length === 0) {
                    fallbackTimerRef.current = setTimeout(() => {
                        if (currentRequestId === requestIdRef.current) {
                            setShowFallback(true);
                        }
                    }, 500);
                }
            } catch (error) {
                if (error?.name === "AbortError") {
                    return;
                }

                if (currentRequestId !== requestIdRef.current) {
                    return;
                }

                console.error("ADDRESS SEARCH ERROR:", error);

                setResults([]);
                setActiveIndex(-1);

                if (fallbackTimerRef.current) {
                    clearTimeout(fallbackTimerRef.current);
                }

                fallbackTimerRef.current = setTimeout(() => {
                    if (currentRequestId === requestIdRef.current) {
                        setShowFallback(true);
                    }
                }, 500);
            } finally {
                if (currentRequestId === requestIdRef.current) {
                    setLoading(false);
                }

                if (abortRef.current === controller) {
                    abortRef.current = null;
                }
            }
        }, SEARCH_DELAY);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
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

    const highlight = (text, query) => {
        if (!query) {
            return text;
        }

        const safeText = String(text || "");

        const index = safeText
            .toLowerCase()
            .indexOf(query.toLowerCase());

        if (index === -1) {
            return safeText;
        }

        return (
            <>
                {safeText.slice(0, index)}
                <mark>
                    {safeText.slice(index, index + query.length)}
                </mark>
                {safeText.slice(index + query.length)}
            </>
        );
    };

    // =========================
    // GET LABEL
    // =========================

    const getLabel = (place) => {
        return (
            place.formatted ||
            place.display_name ||
            place.formattedAddress ||
            [
                getResultStreet(place),
                getResultHouseNumber(place),
                getResultPostalCode(place),
                getResultCity(place),
                getResultCountry(place),
            ]
                .filter(Boolean)
                .join(", ")
        );
    };

    // =========================
    // SELECT ADDRESS
    // =========================

    const selectAddress = (place) => {
        const street = getResultStreet(place);
        const houseNumber = getResultHouseNumber(place);
        const city = getResultCity(place);
        const postalCode = getResultPostalCode(place);

        const country =
            getResultCountry(place) ||
            form.country ||
            "";

        const googleCountryCode = getResultCountryCode(place);

        const fallbackCountryCode = getCountryCode(country);

        const countryCode = String(
            googleCountryCode || fallbackCountryCode || ""
        )
            .trim()
            .toLowerCase();

        const requestedHouseNumber = getHouseNumber(form.address);
        const requestedCity = form.city?.trim() || "";
        const requestedPostalCode = form.postalCode?.trim() || "";

        if (!street) {
            console.warn("ADDRESS REJECTED - MISSING STREET:", place);
            return;
        }

        if (requestedHouseNumber) {
            const normalizedRequestedHouse = normalizeText(
                requestedHouseNumber
            );

            const normalizedResultHouse = normalizeText(houseNumber);

            if (
                normalizedResultHouse &&
                normalizedResultHouse !== normalizedRequestedHouse
            ) {
                console.warn("ADDRESS REJECTED - WRONG HOUSE NUMBER:", {
                    requested: requestedHouseNumber,
                    received: houseNumber,
                    place,
                });

                return;
            }

            if (!normalizedResultHouse) {
                const formattedLabel = getLabel(place);
                const formattedHouse = getHouseNumber(formattedLabel);

                if (
                    formattedHouse &&
                    normalizeText(formattedHouse) !== normalizedRequestedHouse
                ) {
                    console.warn(
                        "ADDRESS REJECTED - WRONG HOUSE NUMBER FROM FORMATTED ADDRESS:",
                        {
                            requested: requestedHouseNumber,
                            received: formattedHouse,
                            place,
                        }
                    );

                    return;
                }
            }
        }

        if (
            requestedCity &&
            city &&
            normalizeText(city) !== normalizeText(requestedCity)
        ) {
            console.warn("ADDRESS REJECTED - WRONG CITY:", {
                requested: requestedCity,
                received: city,
                place,
            });

            return;
        }

        if (
            requestedPostalCode &&
            postalCode &&
            normalizeText(postalCode) !== normalizeText(requestedPostalCode)
        ) {
            console.warn("ADDRESS REJECTED - WRONG POSTAL CODE:", {
                requested: requestedPostalCode,
                received: postalCode,
                place,
            });

            return;
        }

        if (!countryCode) {
            console.warn("ADDRESS REJECTED - MISSING COUNTRY CODE:", place);
            return;
        }

        let cleanStreet = street.trim();

        if (requestedHouseNumber && !houseNumber) {
            const formattedLabel = getLabel(place);
            const formattedHouse = getHouseNumber(formattedLabel);

            if (
                formattedHouse &&
                normalizeText(formattedHouse) ===
                normalizeText(requestedHouseNumber)
            ) {
                cleanStreet = `${cleanStreet} ${formattedHouse}`.trim();
            } else if (!getHouseNumber(cleanStreet)) {
                cleanStreet = `${cleanStreet} ${requestedHouseNumber}`.trim();
            }
        } else if (houseNumber && !getHouseNumber(cleanStreet)) {
            cleanStreet = `${cleanStreet} ${houseNumber}`.trim();
        }

        if (!cleanStreet) {
            console.warn(
                "ADDRESS REJECTED - EMPTY STREET AFTER NORMALIZATION:",
                place
            );

            return;
        }

        // Capitalize address and city for display.
        cleanStreet = capitalizeFirstLetter(cleanStreet);

        const formattedCity = city
            ? capitalizeFirstLetter(city)
            : "";

        console.log("ADDRESS SELECTED:", {
            address: cleanStreet,
            city: formattedCity,
            postalCode,
            country,
            countryCode,
        });

        lastSelectedRef.current = cleanStreet;

        setForm((previous) => {
            const updatedForm = {
                ...previous,
                address: cleanStreet,
                city: formattedCity || previous.city,
                postalCode: postalCode || previous.postalCode,
                country: country || previous.country,
                countryCode,
                addressVerified: true,
            };

            console.log("ADDRESS FORM UPDATED:", {
                address: updatedForm.address,
                addressVerified: updatedForm.addressVerified,
                city: updatedForm.city,
                postalCode: updatedForm.postalCode,
                country: updatedForm.country,
            });

            return updatedForm;
        });

        setSelected(true);
        setLocked(true);
        setShowFallback(false);
        setResults([]);
        setActiveIndex(-1);

        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }

        lastRequestKeyRef.current = "";
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
                previous <= 0 ? 0 : previous - 1
            );

            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (
                activeIndex >= 0 &&
                activeIndex < results.length
            ) {
                selectAddress(results[activeIndex]);
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
        if (!listRef.current || activeIndex < 0) {
            return;
        }

        const element = listRef.current.children[activeIndex];

        if (element) {
            element.scrollIntoView({
                block: "nearest",
            });
        }
    }, [activeIndex]);

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (value) => {
        if (value !== lastSelectedRef.current) {
            setSelected(false);
            setLocked(false);
            lastSelectedRef.current = "";
        }

        setShowFallback(false);
        setActiveIndex(-1);

        if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
        }

        setResults([]);

        setForm((previous) => ({
            ...previous,
            address: value,
            addressVerified: false,
            countryCode:
                previous.countryCode ||
                getCountryCode(previous.country),
            ...(value.length === 0 && {
                city: "",
                postalCode: "",
            }),
        }));
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div
            ref={wrapperRef}
            className="address-input"
        >
            <input
                className="address-input__field"
                name="address"
                value={form.address}
                onChange={(event) =>
                    handleChange(event.target.value)
                }
                onBlur={() => {
                    setForm((previous) => ({
                        ...previous,
                        address: capitalizeFirstLetter(previous.address)
                    }));
                }}
                onKeyDown={handleKeyDown}
                placeholder="Street address"
                autoComplete="off"
                disabled={formLoading}
                aria-label="Street address"
                aria-autocomplete="list"
                aria-expanded={results.length > 0}
                aria-controls="address-suggestions"
            />

            {loading && (
                <div className="address-input__loading">
                    <span className="address-input__spinner" />
                    Searching addresses...
                </div>
            )}

            {results.length > 0 && (
                <ul
                    id="address-suggestions"
                    ref={listRef}
                    className="address-input__suggestions"
                    role="listbox"
                >
                    {results.map((place, index) => (
                        <li
                            key={
                                place.place_id ||
                                place.id ||
                                place.google_place_id ||
                                index
                            }
                            className={`address-input__suggestion ${activeIndex === index ? "is-active" : ""
                                }`}
                            role="option"
                            aria-selected={activeIndex === index}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                selectAddress(place);
                            }}
                            onMouseEnter={() =>
                                setActiveIndex(index)
                            }
                        >
                            <span className="address-input__suggestion-icon">
                                ⌖
                            </span>

                            <span className="address-input__suggestion-text">
                                {highlight(
                                    getLabel(place),
                                    form.address
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {showFallback &&
                !selected &&
                !locked &&
                form.address.length >= MIN_SEARCH_LENGTH &&
                results.length === 0 && (
                    <div className="address-input__fallback">
                        No verified address found.
                    </div>
                )}

            {selected && form.addressVerified && (
                <div className="address-input__verified">
                    <span>✓</span>
                    Address verified
                </div>
            )}
        </div>
    );
}
