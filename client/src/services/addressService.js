// =========================
// ADDRESS API
// =========================

const API_BASE_URL =
    String(
        import.meta.env.VITE_API_URL || ""
    ).replace(
        /\/+$/,
        ""
    );

const API_URL =
    `${API_BASE_URL}/api/address`;

// =========================
// SEARCH ADDRESS
// =========================

export const searchAddress = async (
    q,
    country,
    city,
    postalCode,
    signal,
    countryCode
) => {
    if (!API_BASE_URL) {
        throw new Error(
            "VITE_API_URL is not configured."
        );
    }

    const params =
        new URLSearchParams();

    params.set(
        "q",
        q || ""
    );

    params.set(
        "country",
        country || ""
    );

    params.set(
        "countryCode",
        countryCode || ""
    );

    params.set(
        "city",
        city || ""
    );

    params.set(
        "postalCode",
        postalCode || ""
    );

    const res =
        await fetch(
            `${API_URL}/search?${params.toString()}`,
            {
                method:
                    "GET",

                credentials:
                    "include",

                signal,
            }
        );

    const data =
        await res
            .json()
            .catch(
                () => []
            );

    if (!res.ok) {
        throw new Error(
            data?.message ||
            "Address search failed"
        );
    }

    return data;
};