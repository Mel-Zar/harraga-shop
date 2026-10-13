import axios from "axios";

// =========================
// 🌐 API URL
// =========================

const BASE_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5050/api"
).replace(/\/+$/, "");

const API_URL = `${BASE_URL}/products`;

console.log("🚀 PRODUCT API:", API_URL);

// =========================
// 🔐 AUTH CONFIG
// =========================

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        withCredentials: true,
        headers: token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {},
    };
};

// =========================
// 🛠️ ERROR HANDLING
// =========================

const getErrorMessage = (error) => {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Ett oväntat fel uppstod."
    );
};

const handleApiError = (operation, error) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);

    console.error(`❌ ${operation} ERROR:`, {
        status,
        message,
        data: error.response?.data || null,
    });

    // Rensa endast token när servern uttryckligen rapporterar
    // att JWT-token har gått ut. Behåll token vid andra fel.
    const lowerMessage = String(message).toLowerCase();

    if (
        status === 401 &&
        lowerMessage.includes("token") &&
        (
            lowerMessage.includes("expired") ||
            lowerMessage.includes("expir")
        )
    ) {
        localStorage.removeItem("token");

        // Skicka användaren till inloggningen om sidan finns där.
        if (
            typeof window !== "undefined" &&
            !window.location.pathname.toLowerCase().includes("login")
        ) {
            window.location.assign("/login");
        }
    }

    return error;
};

// =========================
// 📦 GET ALL PRODUCTS
// =========================

export const getProducts = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, {
            ...getAuthConfig(),
            params: {
                search: params.search || undefined,
                category: params.category || undefined,
                sort: params.sort || "newest",
            },
        });

        return response.data;
    } catch (error) {
        throw handleApiError("GET PRODUCTS", error);
    }
};

// =========================
// 📂 GET PRODUCT CATEGORIES
// =========================

export const getProductCategories = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/categories`,
            getAuthConfig()
        );

        return response.data;
    } catch (error) {
        throw handleApiError("GET PRODUCT CATEGORIES", error);
    }
};

// =========================
// 📦 GET SINGLE PRODUCT
// =========================

export const getProductById = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/${encodeURIComponent(id)}`,
            getAuthConfig()
        );

        return response.data;
    } catch (error) {
        throw handleApiError("GET PRODUCT", error);
    }
};

// =========================
// ➕ CREATE PRODUCT
// =========================

export const createProduct = async (formData) => {
    try {
        console.log("📤 POSTING TO:", API_URL);

        const config = getAuthConfig();

        const response = await axios.post(API_URL, formData, {
            ...config,
            headers: {
                ...config.headers,
                // Låt Axios/webbläsaren sätta rätt multipart-boundary.
            },
        });

        return response.data;
    } catch (error) {
        throw handleApiError("CREATE PRODUCT", error);
    }
};

// =========================
// ✏️ UPDATE PRODUCT
// =========================

export const updateProduct = async (id, formData) => {
    try {
        console.log("✏️ UPDATING PRODUCT:", id);

        const config = getAuthConfig();
        const token = localStorage.getItem("token");

        console.log(
            "🔐 TOKEN:",
            token ? "FOUND ✅" : "MISSING ❌"
        );

        if (!id) {
            throw new Error("Produktens ID saknas.");
        }

        if (!(formData instanceof FormData)) {
            throw new Error(
                "Produktinformationen måste skickas som FormData."
            );
        }

        const response = await axios.put(
            `${API_URL}/${encodeURIComponent(id)}`,
            formData,
            {
                ...config,
                headers: {
                    ...config.headers,
                    // Sätt inte Content-Type manuellt för FormData.
                    // Webbläsaren måste lägga till multipart-boundary.
                },
            }
        );

        return response.data;
    } catch (error) {
        // Fel som saknar HTTP-svar, till exempel valideringsfel ovan.
        if (!error.response) {
            console.error("❌ UPDATE PRODUCT ERROR:", error.message);
            throw error;
        }

        throw handleApiError("UPDATE PRODUCT", error);
    }
};

// =========================
// ❌ DELETE PRODUCT
// =========================

export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${encodeURIComponent(id)}`,
            getAuthConfig()
        );

        return response.data;
    } catch (error) {
        throw handleApiError("DELETE PRODUCT", error);
    }
};
