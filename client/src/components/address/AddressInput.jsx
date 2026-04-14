import { useState, useEffect, useRef } from "react";

export default function AddressInput({ form, setForm, loading: formLoading }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // ✅ track if address was selected from dropdown
    const [selected, setSelected] = useState(false);

    // ✅ lock search after selecting address
    const [locked, setLocked] = useState(false);

    // ✅ NEW: only show "No address found" AFTER a real finished search
    const [searchDone, setSearchDone] = useState(false);

    const abortRef = useRef(null);
    const timeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    // 🧠 CACHE
    const cacheRef = useRef({});

    // 🧠 store last selected value
    const lastSelectedRef = useRef("");

    // 🧠 CLOSE DROPDOWN ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setResults([]);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔥 SEARCH EFFECT (DEBOUNCE + ABORT + CACHE)
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {

            // 🔥 if form is submitting, stop search
            if (formLoading) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                setSearchDone(false);
                return;
            }

            if (!form.address || form.address.length < 3 || !form.country) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                setSearchDone(false);
                return;
            }

            // ✅ if locked, do NOT search again
            if (locked) {
                return;
            }

            const cacheKey = `${form.country}_${form.address.toLowerCase()}`;

            // 🔥 reset "done" when new search begins
            setSearchDone(false);

            // ✅ CACHE HIT
            if (cacheRef.current[cacheKey]) {
                setResults(cacheRef.current[cacheKey]);
                setActiveIndex(-1);
                setSearchDone(true);
                return;
            }

            try {
                setLoading(true);

                if (abortRef.current) abortRef.current.abort();
                abortRef.current = new AbortController();

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/address/search?q=${encodeURIComponent(
                        form.address
                    )}&country=${encodeURIComponent(form.country)}`,
                    { signal: abortRef.current.signal }
                );

                if (!res.ok) {
                    setResults([]);
                    setActiveIndex(-1);
                    setSearchDone(true);
                    return;
                }

                const data = await res.json();
                const safeData = Array.isArray(data) ? data : [];

                cacheRef.current[cacheKey] = safeData;

                setResults(safeData);
                setActiveIndex(-1);
                setSearchDone(true);

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.log("Address error:", err);
                    setResults([]);
                    setActiveIndex(-1);
                    setSearchDone(true);
                }
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timeoutRef.current);
    }, [form.address, form.country, locked, formLoading]);

    // 🧠 CLEAN DISPLAY LABEL
    const getLabel = (place) => {
        const addr = place.address || {};

        const street = [addr.road, addr.house_number].filter(Boolean).join(" ").trim();

        const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            "";

        const postcode = addr.postcode || "";

        return `${street}${postcode ? `, ${postcode}` : ""}${city ? ` ${city}` : ""}`.trim();
    };

    // 🧠 SELECT ADDRESS (LOCK SEARCH AFTER SELECT)
    const selectAddress = (place) => {
        const addr = place.address || {};

        const cleanStreet = [addr.road, addr.house_number].filter(Boolean).join(" ").trim();

        setForm((prev) => ({
            ...prev,

            address: cleanStreet,

            city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                "",

            postalCode: addr.postcode || "",

            country: prev.country
        }));

        lastSelectedRef.current = cleanStreet;

        setSelected(true);
        setLocked(true);

        // ✅ IMPORTANT: selection = valid, so no fallback
        setSearchDone(false);

        setResults([]);
        setActiveIndex(-1);
    };

    // ⌨️ KEYBOARD NAVIGATION
    const handleKeyDown = (e) => {
        if (!results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) selectAddress(results[activeIndex]);
        }

        if (e.key === "Escape") {
            setResults([]);
            setActiveIndex(-1);
        }
    };

    // 🧠 MANUAL INPUT HANDLING
    const handleChange = (value) => {
        // ✅ unlock search when user types new input
        if (value !== lastSelectedRef.current) {
            setSelected(false);
            setLocked(false);
        }

        // ✅ reset fallback until search is done again
        setSearchDone(false);

        setForm((prev) => ({
            ...prev,
            address: value,

            ...(value.length === 0 && {
                city: "",
                postalCode: ""
            })
        }));
    };

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <input
                name="address"
                value={form.address}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Street address"
                autoComplete="off"
                disabled={formLoading}
            />

            {loading && (
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    Searching address...
                </div>
            )}

            {results.length > 0 && (
                <ul
                    style={{
                        border: "1px solid #ddd",
                        marginTop: 5,
                        padding: 0,
                        listStyle: "none",
                        position: "absolute",
                        background: "white",
                        width: "100%",
                        zIndex: 9999,
                        maxHeight: 250,
                        overflowY: "auto",
                        borderRadius: 6
                    }}
                >
                    {results.map((place, i) => (
                        <li
                            key={i}
                            onMouseDown={() => selectAddress(place)}
                            style={{
                                cursor: "pointer",
                                padding: "10px",
                                borderBottom: "1px solid #eee",
                                background: i === activeIndex ? "#f2f2f2" : "white"
                            }}
                        >
                            {getLabel(place) || place.display_name}
                        </li>
                    ))}
                </ul>
            )}

            {/* ✅ FALLBACK (PRO: only after a REAL finished search) */}
            {!loading &&
                searchDone &&
                !selected &&
                !locked &&
                form.address.length >= 3 &&
                results.length === 0 && (
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 5 }}>
                        No address found — you can still enter manually
                    </div>
                )
            }
        </div>
    );
}
