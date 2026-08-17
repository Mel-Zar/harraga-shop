import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL;

// =====================================================
// AXIOS HELPER
// =====================================================

const authHeaders = (token) => {
    if (!token) {
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
// ADMIN - GET ALL USERS
// =====================================================

export const getUsers = async (token) => {
    const res = await axios.get(
        `${API_URL}/api/users`,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// ADMIN - GET SINGLE USER
// =====================================================

export const getUserById = async (
    token,
    id
) => {
    const res = await axios.get(
        `${API_URL}/api/users/${id}`,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// ADMIN - UPDATE USER
// =====================================================

export const updateUser = async (
    token,
    id,
    data
) => {
    const res = await axios.put(
        `${API_URL}/api/users/${id}`,
        data,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// ADMIN - DELETE USER
// =====================================================

export const deleteUser = async (
    token,
    id
) => {
    const res = await axios.delete(
        `${API_URL}/api/users/${id}`,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (
    token
) => {
    const res = await axios.get(
        `${API_URL}/api/users/me`,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = async (
    token,
    data
) => {
    const res = await axios.put(
        `${API_URL}/api/users/me`,
        data,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// GET ADDRESSES
// =====================================================

export const getAddresses = async (
    token
) => {
    const res = await axios.get(
        `${API_URL}/api/users/me/addresses`,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// ADD ADDRESS
// =====================================================

export const addAddress = async (
    token,
    data
) => {
    const res = await axios.post(
        `${API_URL}/api/users/me/addresses`,
        data,
        authHeaders(token)
    );

    return res.data;
};

// =====================================================
// DELETE ADDRESS
// =====================================================

export const deleteAddress = async (
    token,
    id
) => {
    const res = await axios.delete(
        `${API_URL}/api/users/me/addresses/${id}`,
        authHeaders(token)
    );

    return res.data;
};