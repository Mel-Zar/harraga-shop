
const API_BASE_URL =
    String(
        import.meta.env.VITE_API_URL || ""
    ).replace(
        /\/+$/,
        ""
    );

const API_URL =
    `${API_BASE_URL}/address`;

// =========================
// GET API ERROR MESSAGE
// =========================

const getErrorMessage = (
    data,
    fallbackMessage
) => {
    if (
        typeof data === "string" &&
        data.trim()
    ) {
        return data.trim();
    }

    if (
        data &&
        typeof data.message === "string" &&
        data.message.trim()
    ) {
        return data.message.trim();
    }

    if (
        data &&
        typeof data.error === "string" &&
        data.error.trim()
    ) {
        return data.error.trim();
    }

    if (
        data &&
        data.googleError
    ) {
        if (
            typeof data.googleError === "string"
        ) {
            return data.googleError;
        }

        if (
            typeof data.googleError.message === "string"
        ) {
            return data.googleError.message;
        }
    }

    return fallbackMessage;
};

// =========================
// PARSE RESPONSE
// =========================

const parseResponse = async (
    response
) => {
    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (
        contentType
            .toLowerCase()
            .includes(
                "application/json"
            )
    ) {
        return response
            .json()
            .catch(() => null);
    }

    return response
        .text()
        .catch(() => "");
};

// =========================
// VALIDATE API CONFIG
// =========================

const ensureApiConfigured = () => {
    if (!API_BASE_URL) {
        throw new Error(
            "VITE_API_URL is not configured."
        );
    }
};

// =========================
// BUILD SEARCH PARAMS
// =========================

const buildSearchParams = ({
    q,
    country,
    city,
    postalCode,
    countryCode,
}) => {
    const params =
        new URLSearchParams();

    const cleanQuery =
        String(q || "").trim();

    const cleanCountry =
        String(
            country || ""
        ).trim();

    const cleanCity =
        String(
            city || ""
        ).trim();

    const cleanPostalCode =
        String(
            postalCode || ""
        ).trim();

    const cleanCountryCode =
        String(
            countryCode || ""
        )
            .trim()
            .toLowerCase();

    params.set(
        "q",
        cleanQuery
    );

    params.set(
        "country",
        cleanCountry
    );

    params.set(
        "countryCode",
        cleanCountryCode
    );

    params.set(
        "city",
        cleanCity
    );

    params.set(
        "postalCode",
        cleanPostalCode
    );

    return params;
};

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
    ensureApiConfigured();

    const params =
        buildSearchParams({
            q,
            country,
            city,
            postalCode,
            countryCode,
        });

    const url =
        `${API_URL}/search?${params.toString()}`;

    let response;

    try {
        response =
            await fetch(
                url,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        Accept: "application/json",
                    },

                    signal,
                }
            );
    } catch (error) {
        /*
         * AbortError är normalt.
         *
         * AddressInput avbryter äldre
         * requests när användaren
         * fortsätter skriva.
         */

        if (
            error?.name === "AbortError"
        ) {
            throw error;
        }

        console.error(
            "ADDRESS SEARCH FETCH ERROR:",
            {
                url,
                error,
            }
        );

        throw new Error(
            error?.message ||
            "Unable to connect to the address service."
        );
    }

    const data =
        await parseResponse(
            response
        );

    if (
        !response.ok
    ) {
        console.error(
            "ADDRESS SEARCH BACKEND ERROR:",
            {
                url,
                status: response.status,
                statusText: response.statusText,
                data,
            }
        );

        throw new Error(
            getErrorMessage(
                data,
                `Address search failed (${response.status}).`
            )
        );
    }

    /*
     * Backend returnerar normalt
     * en array.
     */

    if (
        !Array.isArray(data)
    ) {
        console.warn(
            "ADDRESS SEARCH RETURNED NON-ARRAY:",
            data
        );

        return [];
    }

    return data;
};
