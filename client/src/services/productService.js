import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

console.log("🚀 PRODUCT API:", API_URL);

// =========================
// 📦 GET ALL PRODUCTS
// =========================
export const getProducts = async () => {
    try {
        const response = await axios.get(
            API_URL,
            {
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "❌ GET PRODUCTS ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};

// =========================
// 📦 GET SINGLE PRODUCT
// =========================
export const getProductById = async (
    id
) => {
    try {
        const response = await axios.get(
            `${API_URL}/${id}`,
            {
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "❌ GET PRODUCT ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};

// =========================
// ➕ CREATE PRODUCT
// =========================
export const createProduct = async (
    formData
) => {
    try {
        console.log(
            "📤 POSTING TO:",
            API_URL
        );

        const response = await axios.post(
            API_URL,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "❌ CREATE PRODUCT ERROR:",
            error.response?.status,
            error.response?.data
        );

        throw error;
    }
};

// =========================
// ✏️ UPDATE PRODUCT
// =========================
export const updateProduct = async (
    id,
    formData
) => {
    try {
        const response = await axios.put(
            `${API_URL}/${id}`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "❌ UPDATE PRODUCT ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};

// =========================
// ❌ DELETE PRODUCT
// =========================
export const deleteProduct = async (
    id
) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            {
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "❌ DELETE PRODUCT ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};