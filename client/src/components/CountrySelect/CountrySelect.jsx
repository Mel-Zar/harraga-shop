
import { useEffect, useRef, useState } from "react";

export default function CountrySelect({
    countries = [],
    value = "",
    onChange
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const wrapperRef = useRef(null);
    const searchRef = useRef(null);
    const optionRefs = useRef([]);

    // =========================
    // FORMAT COUNTRY NAME
    // =========================

    const formatCountryName = (country) => {
        const name = String(country || "").trim();

        if (!name) return "";

        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // =========================
    // FILTER COUNTRIES
    // =========================

    const normalizedSearch = search.trim().toLocaleLowerCase();

    const filteredCountries = countries.filter((country) =>
        String(country)
            .toLocaleLowerCase()
            .includes(normalizedSearch)
    );

    // Säkerställ att aktivt index alltid ligger inom resultatlistan.
    const safeActiveIndex =
        filteredCountries.length === 0
            ? -1
            : Math.min(activeIndex, filteredCountries.length - 1);

    // =========================
    // OUTSIDE CLICK + ESCAPE
    // =========================

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
                setActiveIndex(0);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setSearch("");
                setActiveIndex(0);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    // =========================
    // FOCUS SEARCH INPUT
    // =========================

    useEffect(() => {
        if (isOpen) {
            searchRef.current?.focus();
        }
    }, [isOpen]);

    // =========================
    // SCROLL ACTIVE OPTION
    // =========================

    useEffect(() => {
        if (
            isOpen &&
            safeActiveIndex >= 0 &&
            safeActiveIndex < filteredCountries.length
        ) {
            optionRefs.current[safeActiveIndex]?.scrollIntoView({
                block: "nearest"
            });
        }
    }, [safeActiveIndex, isOpen, filteredCountries.length]);

    // =========================
    // OPEN / CLOSE DROPDOWN
    // =========================

    const openDropdown = () => {
        if (isOpen) {
            setIsOpen(false);
            setSearch("");
            setActiveIndex(0);
            return;
        }

        setSearch("");
        setActiveIndex(0);
        setIsOpen(true);
    };

    // =========================
    // SELECT COUNTRY
    // =========================

    const selectCountry = (country) => {
        if (typeof onChange === "function") {
            onChange(country);
        }

        setIsOpen(false);
        setSearch("");
        setActiveIndex(0);
    };

    // =========================
    // SEARCH CHANGE
    // =========================

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setActiveIndex(0);
    };

    // =========================
    // KEYBOARD NAVIGATION
    // =========================

    const handleKeyDown = (event) => {
        if (!isOpen) {
            if (
                event.key === "Enter" ||
                event.key === "ArrowDown"
            ) {
                event.preventDefault();

                setSearch("");
                setActiveIndex(0);
                setIsOpen(true);
            }

            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (filteredCountries.length > 0) {
                setActiveIndex((current) =>
                    Math.min(current + 1, filteredCountries.length - 1)
                );
            }
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (filteredCountries.length > 0) {
                setActiveIndex((current) =>
                    Math.max(current - 1, 0)
                );
            }
        }

        if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
        }

        if (event.key === "End") {
            event.preventDefault();

            if (filteredCountries.length > 0) {
                setActiveIndex(filteredCountries.length - 1);
            }
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (safeActiveIndex >= 0) {
                selectCountry(filteredCountries[safeActiveIndex]);
            }
        }
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div
            className="country-select"
            ref={wrapperRef}
        >
            <button
                type="button"
                className={`country-select__trigger ${isOpen ? "is-open" : ""
                    }`}
                onClick={openDropdown}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select country"
            >
                <span
                    className={
                        value ? "has-value" : "placeholder"
                    }
                >
                    {value
                        ? formatCountryName(value)
                        : "Select country"}
                </span>

                <svg
                    className="country-select__arrow"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div className="country-select__dropdown">
                    <div className="country-select__search">
                        <input
                            ref={searchRef}
                            type="search"
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search country..."
                            aria-label="Search country"
                            autoComplete="off"
                        />
                    </div>

                    <div
                        className="country-select__options"
                        role="listbox"
                        aria-label="Countries"
                    >
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country, index) => (
                                <button
                                    key={country}
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    type="button"
                                    role="option"
                                    aria-selected={value === country}
                                    className={`country-select__option ${value === country ? "is-selected" : ""
                                        } ${safeActiveIndex === index
                                            ? "is-active"
                                            : ""
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => selectCountry(country)}
                                >
                                    <span>
                                        {formatCountryName(country)}
                                    </span>

                                    {value === country && (
                                        <span className="country-select__check">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="country-select__empty">
                                No countries found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
