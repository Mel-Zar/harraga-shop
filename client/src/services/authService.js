const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

// =========================
// 🟢 REGISTER
// =========================
export const registerUser = async (userData) => {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Register failed");
    }

    return data;
};

// =========================
// 🔵 LOGIN
// =========================
export const loginUser = async (userData) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

// =========================
// 🟠 FORGOT PASSWORD
// =========================
export const forgotPassword = async (email) => {
    const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to send reset email");
    }

    return data;
};

// =========================
// 🔴 RESET PASSWORD
// =========================
export const resetPassword = async (token, password, confirmPassword) => {
    const res = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
    }

    return data;
};

// =========================
// 📩 RESEND VERIFY EMAIL
// =========================
export const resendVerifyEmail = async (email) => {
    const res = await fetch(`${API_URL}/resend-verification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification email");
    }

    return data;
};
