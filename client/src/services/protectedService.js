import { getToken } from "../utils/auth";

// =========================
// 🌐 BASE API URL (FROM ENV)
// =========================
// Use environment variable instead of hardcoded URL
const API_URL = import.meta.env.VITE_API_URL;

// =========================
// 🔐 FETCH PROTECTED DATA
// =========================
// This function calls a protected backend route that requires authentication
export const getProtectedData = async () => {

    // =========================
    // 🎟️ GET JWT TOKEN
    // =========================
    // Retrieve token from localStorage (saved during login)
    const token = getToken();

    // =========================
    // 🌐 SEND REQUEST TO BACKEND
    // =========================
    // Call protected API endpoint using env URL
    const res = await fetch(`${API_URL}/api/protected`, {
        headers: {
            // =========================
            // 🔑 AUTHORIZATION HEADER
            // =========================
            // Send token in "Bearer TOKEN" format (required by backend middleware)
            Authorization: `Bearer ${token}`, // 🔥 MATCH BACKEND
        },
        credentials: "include", // 🔥 allow cookies if used
    });

    // =========================
    // 📦 PARSE RESPONSE
    // =========================
    // Convert response to JSON
    const data = await res.json();

    // =========================
    // ⚠️ ERROR HANDLING (IMPORTANT)
    // =========================
    // If request fails (401, 403, etc), throw error
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch protected data");
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    // Return protected data (user info, message, etc)
    return data;
};
