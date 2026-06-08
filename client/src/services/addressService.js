const API_URL = `${import.meta.env.VITE_API_URL}/api/address`;

export const searchAddress = async (q, country) => {
    const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Address search failed");
    }

    return data;
};