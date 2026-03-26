import { useState, useEffect, useRef } from "react";

export default function AddressInput({ form, setForm }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // ✅ NEW: track if user selected from dropdown
    const [selected, setSelected] = useState(false);

    const abortRef = useRef(null);
    const timeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    // 🧠 CACHE (PRO: prevent spam + faster UX)
    const cacheRef = useRef({});

    // ✅ NEW: store last selected address so it doesn't reset selected=false
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
            if (!form.address || form.address.length < 3 || !form.country) {
                setResults([]);
                setActiveIndex(-1);
                return;
            }

            // ✅ IMPORTANT: if user already selected, don't show fallback search spam
            if (selected && form.address === lastSelectedRef.current) {
                return;
            }

            const cacheKey = `${form.country}_${form.address.toLowerCase()}`;

            // ✅ CACHE HIT
            if (cacheRef.current[cacheKey]) {
                setResults(cacheRef.current[cacheKey]);
                setActiveIndex(-1);
                return;
            }

            try {
                setLoading(true);

                // abort previous request
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
                    return;
                }

                const data = await res.json();
                const safeData = Array.isArray(data) ? data : [];

                // save to cache
                cacheRef.current[cacheKey] = safeData;

                setResults(safeData);
                setActiveIndex(-1);

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.log("Address error:", err);
                }
                setResults([]);
                setActiveIndex(-1);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timeoutRef.current);
    }, [form.address, form.country, selected]);

    // 🧠 CLEAN DISPLAY LABEL (PRO UX)
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

    // 🧠 SELECT ADDRESS (SYNC FIELDS)
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

            // keep selected country stable
            country: prev.country
        }));

        // ✅ IMPORTANT FIX
        setSelected(true);

        // ✅ save selected address so it doesn't reset
        lastSelectedRef.current = cleanStreet;

        setResults([]);
        setActiveIndex(-1);
    };

    // ⌨️ KEYBOARD NAVIGATION (PRO)
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

    // 🧠 MANUAL INPUT HANDLING (RESET DEPENDENT FIELDS)
    const handleChange = (value) => {
        // ✅ only reset selected if user is actually changing away from selected value
        if (value !== lastSelectedRef.current) {
            setSelected(false);
        }

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

            {/* ✅ FALLBACK (ONLY SHOW IF USER HAS NOT SELECTED) */}
            {!loading &&
                !selected &&
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
