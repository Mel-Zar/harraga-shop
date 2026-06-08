import { useState, useEffect, useRef } from "react";

export default function AddressInput({ form, setForm, loading: formLoading }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const [selected, setSelected] = useState(false);
    const [locked, setLocked] = useState(false);
    const [searchDone, setSearchDone] = useState(false);

    // ✅ NEW: auto-hide fallback message
    const [showFallback, setShowFallback] = useState(false);

    const abortRef = useRef(null);
    const timeoutRef = useRef(null);
    const fallbackTimerRef = useRef(null);
    const wrapperRef = useRef(null);

    const cacheRef = useRef({});
    const lastSelectedRef = useRef("");

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

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {

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
                setShowFallback(false);
                return;
            }

            if (locked) return;

            const cacheKey = `${form.country}_${form.address.toLowerCase()}`;

            setSearchDone(false);
            setShowFallback(false);

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

                const data = await res.json();
                const safeData = Array.isArray(data) ? data : [];

                cacheRef.current[cacheKey] = safeData;

                setResults(safeData);
                setActiveIndex(-1);
                setSearchDone(true);

                // ❗ SHOW FALLBACK ONLY IF EMPTY
                if (safeData.length === 0) {
                    setShowFallback(true);

                    if (fallbackTimerRef.current) {
                        clearTimeout(fallbackTimerRef.current);
                    }

                    fallbackTimerRef.current = setTimeout(() => {
                        setShowFallback(false);
                    }, 3000);
                }

            } catch (err) {
                if (err.name !== "AbortError") {
                    setResults([]);
                    setActiveIndex(-1);
                    setSearchDone(true);
                    setShowFallback(true);

                    fallbackTimerRef.current = setTimeout(() => {
                        setShowFallback(false);
                    }, 3000);
                }
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timeoutRef.current);
    }, [form.address, form.country, locked, formLoading]);

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

    const selectAddress = (place) => {
        const addr = place.address || {};

        const cleanStreet = [addr.road, addr.house_number].filter(Boolean).join(" ").trim();

        setForm((prev) => ({
            ...prev,
            address: cleanStreet,
            city: addr.city || addr.town || addr.village || addr.municipality || "",
            postalCode: addr.postcode || "",
            country: prev.country
        }));

        lastSelectedRef.current = cleanStreet;

        setSelected(true);
        setLocked(true);
        setSearchDone(false);
        setShowFallback(false);

        setResults([]);
        setActiveIndex(-1);
    };

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

    const handleChange = (value) => {
        if (value !== lastSelectedRef.current) {
            setSelected(false);
            setLocked(false);
        }

        setSearchDone(false);
        setShowFallback(false);

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
                <ul style={{
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
                }}>
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

            {/* ✅ AUTO-HIDE FALLBACK */}
            {showFallback &&
                !selected &&
                !locked &&
                form.address.length >= 3 &&
                results.length === 0 && (
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 5 }}>
                        No address found — you can still enter manually
                    </div>
                )}
        </div>
    );
}