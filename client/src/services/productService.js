import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

// =========================
// 📦 GET ALL PRODUCTS
// =========================
export const getProducts = async () => {
    const response = await axios.get(API_URL, {
        withCredentials: true,
    });

    return response.data;
};

// =========================
// 📦 GET SINGLE PRODUCT
// =========================
export const getProductById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

// =========================
// ➕ CREATE PRODUCT
// =========================
export const createProduct = async (
    formData
) => {
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
};

// =========================
// ✏️ UPDATE PRODUCT
// =========================
export const updateProduct = async (
    id,
    formData
) => {
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
};

// =========================
// ❌ DELETE PRODUCT
// =========================
export const deleteProduct = async (
    id
) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};