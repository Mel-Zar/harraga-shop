import { useState, useEffect, useRef } from "react";
import { searchAddress } from "../../services/addressService";

export default function AddressInput({ form, setForm, loading: formLoading }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const [selected, setSelected] = useState(false);
    const [locked, setLocked] = useState(false);
    const [_searchDone, setSearchDone] = useState(false);

    const [showFallback, setShowFallback] = useState(false);

    const abortRef = useRef(null);
    const timeoutRef = useRef(null);
    const fallbackTimerRef = useRef(null);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);

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

    const rankResults = (items, query) => {
        const q = query.toLowerCase();

        return [...items].sort((a, b) => {
            const aLabel = (a.display_name || "").toLowerCase();
            const bLabel = (b.display_name || "").toLowerCase();

            const aScore =
                (aLabel.startsWith(q) ? 2 : 0) +
                (aLabel.includes(q) ? 1 : 0);

            const bScore =
                (bLabel.startsWith(q) ? 2 : 0) +
                (bLabel.includes(q) ? 1 : 0);

            return bScore - aScore;
        });
    };

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            const query = form.address?.trim() || "";
            const country = form.country;

            setShowFallback(false);

            if (formLoading) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                setSearchDone(false);
                return;
            }

            if (!query || query.length < 3 || !country) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);
                setSearchDone(false);
                return;
            }

            if (locked) return;

            const cacheKey = `${country}_${query.toLowerCase()}`;

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

                const data = await searchAddress(
                    query,
                    country
                );

                const safeData = Array.isArray(data) ? data : [];
                const ranked = rankResults(safeData, query);

                cacheRef.current[cacheKey] = ranked;

                setResults(ranked);
                setActiveIndex(-1);
                setSearchDone(true);

                if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

                if (ranked.length === 0) {
                    fallbackTimerRef.current = setTimeout(() => {
                        setShowFallback(true);
                    }, 500);
                }
            } catch {
                setResults([]);
                setActiveIndex(-1);

                if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

                fallbackTimerRef.current = setTimeout(() => {
                    setShowFallback(true);
                }, 500);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timeoutRef.current);
    }, [form.address, form.country, locked, formLoading]);

    const highlight = (text, query) => {
        if (!query) return text;

        const i = text.toLowerCase().indexOf(query.toLowerCase());
        if (i === -1) return text;

        return (
            <>
                {text.slice(0, i)}
                <mark>{text.slice(i, i + query.length)}</mark>
                {text.slice(i + query.length)}
            </>
        );
    };

    const getLabel = (place) => {
        const addr = place.address || {};

        const street = [addr.road, addr.house_number]
            .filter(Boolean)
            .join(" ")
            .trim();

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

        const cleanStreet = [addr.road, addr.house_number]
            .filter(Boolean)
            .join(" ")
            .trim();

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
            setActiveIndex((p) => Math.min(p + 1, results.length - 1));
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((p) => Math.max(p - 1, 0));
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

    useEffect(() => {
        if (!listRef.current || activeIndex < 0) return;

        const el = listRef.current.children[activeIndex];
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

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
        <div ref={wrapperRef}>
            <input
                name="address"
                value={form.address}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Street address"
                autoComplete="off"
                disabled={formLoading}
            />

            {loading && <div>Searching...</div>}

            {results.length > 0 && (
                <ul ref={listRef}>
                    {results.map((place, i) => (
                        <li key={i} onMouseDown={() => selectAddress(place)}>
                            {highlight(
                                getLabel(place) || place.display_name,
                                form.address
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showFallback &&
                !selected &&
                !locked &&
                form.address.length >= 3 &&
                results.length === 0 && (
                    <div>No address found — you can still enter manually</div>
                )}
        </div>
    );
}