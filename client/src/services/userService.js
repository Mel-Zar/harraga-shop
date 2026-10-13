import axios from "axios";

// =====================================================
// 🔗 API URL
// =====================================================

const BASE_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5050/api"
).replace(/\/+$/, "");

// Backendens user-routes ligger under /api/users
const USERS_API_URL = `${BASE_URL}/users`;

console.log("👤 USERS API:", USERS_API_URL);

// =====================================================
// 🔐 AUTH HEADERS
// =====================================================

const authHeaders = (token) => {
    if (
        !token ||
        token === "null" ||
        token === "undefined"
    ) {
        throw new Error(
            "No authentication token found."
        );
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    };
};

// =====================================================
// ❌ AXIOS ERROR HELPER
// =====================================================

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

// =====================================================
// 👑 ADMIN - GET ALL USERS
// =====================================================

export const getUsers = async (token) => {
    try {
        const res = await axios.get(
            USERS_API_URL,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to fetch users."
            )
        );
    }
};

// =====================================================
// 👑 ADMIN - GET SINGLE USER
// =====================================================

export const getUserById = async (token, id) => {
    if (!id) {
        throw new Error("User ID is required.");
    }

    try {
        const res = await axios.get(
            `${USERS_API_URL}/${encodeURIComponent(id)}`,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to fetch user."
            )
        );
    }
};

// =====================================================
// 👑 ADMIN - UPDATE USER
// =====================================================

export const updateUser = async (token, id, data) => {
    if (!id) {
        throw new Error("User ID is required.");
    }

    try {
        const res = await axios.put(
            `${USERS_API_URL}/${encodeURIComponent(id)}`,
            data,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to update user."
            )
        );
    }
};

// =====================================================
// 👑 ADMIN - DELETE USER
// =====================================================

export const deleteUser = async (token, id) => {
    if (!id) {
        throw new Error("User ID is required.");
    }

    try {
        const res = await axios.delete(
            `${USERS_API_URL}/${encodeURIComponent(id)}`,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to delete user."
            )
        );
    }
};

// =====================================================
// 👤 GET PROFILE
// =====================================================

export const getProfile = async (token) => {
    try {
        const res = await axios.get(
            `${USERS_API_URL}/me`,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to fetch profile."
            )
        );
    }
};

// =====================================================
// 👤 UPDATE PROFILE
// =====================================================

export const updateProfile = async (token, data) => {
    try {
        const res = await axios.put(
            `${USERS_API_URL}/me`,
            data,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to update profile."
            )
        );
    }
};

// =====================================================
// 🔐 CHANGE PASSWORD
// =====================================================

export const changePassword = async (token, data) => {
    try {
        const res = await axios.put(
            `${USERS_API_URL}/change-password`,
            data,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to change password."
            )
        );
    }
};

// =====================================================
// 📍 GET ADDRESSES
// =====================================================

export const getAddresses = async (token) => {
    try {
        const res = await axios.get(
            `${USERS_API_URL}/me/addresses`,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to fetch addresses."
            )
        );
    }
};

// =====================================================
// 📍 ADD ADDRESS
// =====================================================

export const addAddress = async (token, data) => {
    try {
        const res = await axios.post(
            `${USERS_API_URL}/me/addresses`,
            data,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to add address."
            )
        );
    }
};

// =====================================================
// ⭐ SET PRIMARY / DEFAULT ADDRESS
// =====================================================

export const setDefaultAddress = async (token, id) => {
    if (!id) {
        throw new Error("Address ID is required.");
    }

    try {
        const res = await axios.put(
            `${USERS_API_URL}/me/addresses/${encodeURIComponent(id)}/default`,
            {},
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to set primary address."
            )
        );
    }
};

// =====================================================
// 📍 DELETE ADDRESS
// =====================================================

export const deleteAddress = async (token, id) => {
    if (!id) {
        throw new Error("Address ID is required.");
    }

    try {
        const res = await axios.delete(
            `${USERS_API_URL}/me/addresses/${encodeURIComponent(id)}`,
            authHeaders(token)
        );

        return res.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(
                error,
                "Failed to delete address."
            )
        );
    }
};
