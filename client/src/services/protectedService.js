import { getToken, logout } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const getProtectedData = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No token found. Please login again.");
    }

    const res = await fetch(`${API_URL}/api/protected`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    const data = await res.json();

    if (res.status === 401 || res.status === 403) {
        logout();
    }

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch protected data");
    }

    return data;
};
