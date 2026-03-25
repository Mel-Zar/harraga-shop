import { useState, useEffect } from "react";

export default function AddressInput({ form, setForm }) {
    const [results, setResults] = useState([]);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (form.address.length < 3 || !form.country) {
                setResults([]);
                return;
            }

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/address/search?q=${encodeURIComponent(
                        form.address
                    )}&country=${form.country}`
                );

                const data = await res.json();
                setResults(data);

            } catch (err) {
                console.log("Address error:", err);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [form.address, form.country]);

    const selectAddress = (place) => {
        setForm((prev) => ({
            ...prev,

            // 🧠 CLEAN ADDRESS (inte display_name)
            address: [
                place.address?.road,
                place.address?.house_number
            ]
                .filter(Boolean)
                .join(" ")
                .trim(),

            // 📍 CITY FIX (fallback chain)
            city:
                place.address?.city ||
                place.address?.town ||
                place.address?.village ||
                "",

            // 📮 POSTAL CODE
            postalCode: place.address?.postcode || "",
        }));

        setResults([]);
    };

    return (
        <div>
            <input
                name="address"
                value={form.address}
                onChange={(e) =>
                    setForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                    }))
                }
                placeholder="Address"
            />

            {results.length > 0 && (
                <ul style={{ border: "1px solid #ccc", padding: 0 }}>
                    {results.map((place, i) => (
                        <li
                            key={i}
                            onClick={() => selectAddress(place)}
                            style={{ cursor: "pointer", padding: "5px" }}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
