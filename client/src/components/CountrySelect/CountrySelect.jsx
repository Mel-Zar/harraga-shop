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

    // Gör första bokstaven i landets namn till stor bokstav
    const formatCountryName = (country) => {
        const name = String(country).trim();

        if (!name) return "";

        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const filteredCountries = countries.filter((country) =>
        String(country)
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setSearch("");
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

    useEffect(() => {
        if (isOpen) {
            searchRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && filteredCountries.length > 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest"
            });
        }
    }, [activeIndex, isOpen, filteredCountries.length]);

    const openDropdown = () => {
        setIsOpen((previous) => !previous);
        setSearch("");
        setActiveIndex(0);
    };

    const selectCountry = (country) => {
        onChange(country);
        setIsOpen(false);
        setSearch("");
        setActiveIndex(0);
    };

    const handleKeyDown = (event) => {
        if (!isOpen) {
            if (event.key === "Enter" || event.key === "ArrowDown") {
                event.preventDefault();
                setIsOpen(true);
            }

            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            setActiveIndex((current) =>
                Math.min(current + 1, filteredCountries.length - 1)
            );
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            setActiveIndex((current) => Math.max(current - 1, 0));
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (filteredCountries[activeIndex]) {
                selectCountry(filteredCountries[activeIndex]);
            }
        }
    };

    return (
        <div className="country-select" ref={wrapperRef}>
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
                <span className={value ? "has-value" : "placeholder"}>
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
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setActiveIndex(0);
                            }}
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
                                    key={`${country}-${index}`}
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    type="button"
                                    role="option"
                                    aria-selected={value === country}
                                    className={`country-select__option ${value === country ? "is-selected" : ""
                                        } ${activeIndex === index ? "is-active" : ""
                                        }`}
                                    onMouseEnter={() =>
                                        setActiveIndex(index)
                                    }
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