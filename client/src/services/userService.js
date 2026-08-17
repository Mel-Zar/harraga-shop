import axios from "axios";

// =====================================================
// 🔗 API URL
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL;

// =====================================================
// 🔐 AUTH HEADERS
// =====================================================

const authHeaders = (
    token
) => {

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
            Authorization:
                `Bearer ${token}`,

            "Content-Type":
                "application/json",
        },

        withCredentials: true,
    };
};

// =====================================================
// ❌ AXIOS ERROR HELPER
// =====================================================

const getErrorMessage = (
    error,
    fallback
) => {

    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

// =====================================================
// 👑 ADMIN - GET ALL USERS
// =====================================================

export const getUsers = async (
    token
) => {

    try {

        const res =
            await axios.get(
                `${API_URL}/api/users`,
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

export const getUserById = async (
    token,
    id
) => {

    if (!id) {
        throw new Error(
            "User ID is required."
        );
    }

    try {

        const res =
            await axios.get(
                `${API_URL}/api/users/${id}`,
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

export const updateUser = async (
    token,
    id,
    data
) => {

    if (!id) {
        throw new Error(
            "User ID is required."
        );
    }

    try {

        const res =
            await axios.put(
                `${API_URL}/api/users/${id}`,
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

export const deleteUser = async (
    token,
    id
) => {

    if (!id) {
        throw new Error(
            "User ID is required."
        );
    }

    try {

        const res =
            await axios.delete(
                `${API_URL}/api/users/${id}`,
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

export const getProfile = async (
    token
) => {

    try {

        const res =
            await axios.get(
                `${API_URL}/api/users/me`,
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

export const updateProfile = async (
    token,
    data
) => {

    try {

        const res =
            await axios.put(
                `${API_URL}/api/users/me`,
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
// 📍 GET ADDRESSES
// =====================================================

export const getAddresses = async (
    token
) => {

    try {

        const res =
            await axios.get(
                `${API_URL}/api/users/me/addresses`,
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

export const addAddress = async (
    token,
    data
) => {

    try {

        const res =
            await axios.post(
                `${API_URL}/api/users/me/addresses`,
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
// 📍 DELETE ADDRESS
// =====================================================

export const deleteAddress = async (
    token,
    id
) => {

    if (!id) {
        throw new Error(
            "Address ID is required."
        );
    }

    try {

        const res =
            await axios.delete(
                `${API_URL}/api/users/me/addresses/${id}`,
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