
import { useEffect, useId, useRef, useState } from "react";

export default function CountrySelect({
    countries = [],
    value = "",
    onChange,
    language = "en"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const generatedId = useId();
    const listboxId = `country-listbox-${generatedId}`;
    const searchInputId = `country-search-${generatedId}`;

    const wrapperRef = useRef(null);
    const searchRef = useRef(null);
    const optionRefs = useRef([]);

    const currentLanguage = String(language).toLowerCase().startsWith("sv")
        ? "sv"
        : "en";

    // =========================
    // COUNTRY NAME TRANSLATION
    // =========================

    const normalizeCountry = (country) => {
        const name = String(country || "").trim().toLowerCase();

        if (["sweden", "sverige", "se"].includes(name)) {
            return "SE";
        }

        return name;
    };

    const formatCountryName = (country) => {
        const name = String(country || "").trim();

        if (!name) return "";

        if (normalizeCountry(name) === "SE") {
            return currentLanguage === "sv" ? "Sverige" : "Sweden";
        }

        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const isSelected = (country) => {
        return normalizeCountry(value) === normalizeCountry(country);
    };

    // =========================
    // FILTER COUNTRIES
    // =========================

    const normalizedSearch = search.trim().toLocaleLowerCase();

    const filteredCountries = countries.filter((country) => {
        const originalName = String(country).toLocaleLowerCase();
        const displayName = formatCountryName(country).toLocaleLowerCase();

        return (
            originalName.includes(normalizedSearch) ||
            displayName.includes(normalizedSearch) ||
            (
                normalizeCountry(country) === "SE" &&
                ["sweden", "sverige", "se"].some((name) =>
                    name.includes(normalizedSearch)
                )
            )
        );
    });

    const safeActiveIndex =
        filteredCountries.length === 0
            ? -1
            : Math.min(activeIndex, filteredCountries.length - 1);

    // =========================
    // CLOSE DROPDOWN
    // =========================

    const closeDropdown = () => {
        setIsOpen(false);
        setSearch("");
        setActiveIndex(0);
    };

    // =========================
    // OUTSIDE CLICK + ESCAPE
    // =========================

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeDropdown();
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
    // FOCUS SEARCH
    // =========================

    useEffect(() => {
        if (!isOpen) return undefined;

        const frameId = requestAnimationFrame(() => {
            searchRef.current?.focus();
        });

        return () => cancelAnimationFrame(frameId);
    }, [isOpen]);

    // =========================
    // SCROLL ACTIVE OPTION
    // =========================

    useEffect(() => {
        if (
            isOpen &&
            safeActiveIndex >= 0 &&
            optionRefs.current[safeActiveIndex]
        ) {
            optionRefs.current[safeActiveIndex].scrollIntoView({
                block: "nearest"
            });
        }
    }, [isOpen, safeActiveIndex]);

    // =========================
    // OPEN / CLOSE
    // =========================

    const openDropdown = () => {
        if (isOpen) {
            closeDropdown();
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

        closeDropdown();
    };

    // =========================
    // SEARCH
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
                event.key === "ArrowDown" ||
                event.key === " "
            ) {
                event.preventDefault();
                openDropdown();
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
            className={`country-select ${isOpen ? "is-open" : ""}`}
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
                aria-controls={listboxId}
                aria-label={
                    currentLanguage === "sv"
                        ? "Välj land"
                        : "Select country"
                }
            >
                <span className={value ? "has-value" : "placeholder"}>
                    {value
                        ? formatCountryName(value)
                        : currentLanguage === "sv"
                            ? "Välj land"
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
                <div
                    className="country-select__dropdown"
                    onKeyDown={handleKeyDown}
                >
                    <div className="country-select__search">
                        <input
                            id={searchInputId}
                            ref={searchRef}
                            type="search"
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                currentLanguage === "sv"
                                    ? "Sök land..."
                                    : "Search country..."
                            }
                            aria-label={
                                currentLanguage === "sv"
                                    ? "Sök land"
                                    : "Search country"
                            }
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    </div>

                    <div
                        id={listboxId}
                        className="country-select__options"
                        role="listbox"
                        aria-label={
                            currentLanguage === "sv"
                                ? "Länder"
                                : "Countries"
                        }
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
                                    aria-selected={isSelected(country)}
                                    className={`country-select__option ${isSelected(country) ? "is-selected" : ""
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

                                    {isSelected(country) && (
                                        <span className="country-select__check">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="country-select__empty">
                                {currentLanguage === "sv"
                                    ? "Inga länder hittades."
                                    : "No countries found."}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
