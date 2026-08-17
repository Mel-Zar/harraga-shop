const API_URL =
    `${import.meta.env.VITE_API_URL}/api/auth`;

// =====================================================
// 🔧 RESPONSE HELPER
// =====================================================

const parseResponse = async (res) => {
    let data = {};

    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        throw new Error(
            data.message ||
            `Request failed with status ${res.status}`
        );
    }

    return data;
};

// =====================================================
// 🟢 REGISTER
// =====================================================

export const registerUser = async (
    userData
) => {

    const res = await fetch(
        `${API_URL}/register`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            body: JSON.stringify(
                userData
            ),
        }
    );

    return parseResponse(res);
};

// =====================================================
// 🔵 LOGIN
// =====================================================

export const loginUser = async (
    userData
) => {

    const res = await fetch(
        `${API_URL}/login`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            body: JSON.stringify(
                userData
            ),
        }
    );

    const data =
        await parseResponse(res);

    // =================================================
    // SAVE TOKEN + USER
    // =================================================

    if (data?.accessToken) {
        localStorage.setItem(
            "token",
            data.accessToken
        );
    }

    if (data?.user) {
        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user
            )
        );
    }

    window.dispatchEvent(
        new Event("auth-change")
    );

    return data;
};

// =====================================================
// 🟠 FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (
    email
) => {

    const res = await fetch(
        `${API_URL}/forgot-password`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
                email,
            }),
        }
    );

    return parseResponse(res);
};

// =====================================================
// 🔴 RESET PASSWORD
// =====================================================

export const resetPassword = async (
    token,
    password,
    confirmPassword
) => {

    const res = await fetch(
        `${API_URL}/reset-password/${token}`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
                password,
                confirmPassword,
            }),
        }
    );

    return parseResponse(res);
};

// =====================================================
// 📩 RESEND VERIFY EMAIL
// =====================================================

export const resendVerifyEmail = async (
    email
) => {

    const res = await fetch(
        `${API_URL}/resend-verify-email`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
                email,
            }),
        }
    );

    return parseResponse(res);
};