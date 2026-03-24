const API_URL = "http://localhost:5050/api/auth";

// =========================
// 🔐 REGISTER USER
// =========================
export const registerUser = async (userData) => {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 IMPORTANT (for cookies later)
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
};

// =========================
// 🔐 LOGIN USER
// =========================
export const loginUser = async (userData) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 IMPORTANT
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
};
