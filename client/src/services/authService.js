
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// =====================================================
// RESPONSE HELPER
// =====================================================

const parseResponse = async (res) => {
    let data = {};

    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        const error = new Error(
            data.message ||
            data.error ||
            `Request failed with status ${res.status}`
        );

        error.status = res.status;
        error.response = {
            status: res.status,
            data,
        };

        throw error;
    }

    return data;
};

// =====================================================
// REQUEST HELPER
// =====================================================

const postJSON = async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
    });

    return parseResponse(res);
};

// =====================================================
// CHECK REGISTRATION AVAILABILITY
// =====================================================

export const checkRegistrationAvailability = async (
    username,
    email
) => {
    if (
        typeof username !== "string" ||
        typeof email !== "string"
    ) {
        throw new Error(
            "Användarnamn och e-postadress måste anges."
        );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail) {
        throw new Error(
            "Användarnamn och e-postadress måste anges."
        );
    }

    return postJSON("/check-availability", {
        username: cleanUsername,
        email: cleanEmail,
    });
};

// =====================================================
// REGISTER
// =====================================================

export const registerUser = async (userData) => {
    if (
        !userData ||
        typeof userData !== "object" ||
        Array.isArray(userData)
    ) {
        throw new Error(
            "Registreringsuppgifterna saknas eller är ogiltiga."
        );
    }

    // CAPTCHA måste vara godkänd innan registrering.
    if (
        typeof userData.captchaToken !== "string" ||
        !userData.captchaToken.trim()
    ) {
        throw new Error(
            "CAPTCHA-verifieringen saknas. Försök igen."
        );
    }

    // Skicka samtliga registreringsfält vidare.
    return postJSON("/register", userData);
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (userData) => {
    const data = await postJSON("/login", userData);

    if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
    }

    if (data?.user) {
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );
    }

    window.dispatchEvent(new Event("auth-change"));

    return data;
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (email) => {
    return postJSON("/forgot-password", {
        email,
    });
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (
    token,
    password,
    confirmPassword
) => {
    return postJSON(
        `/reset-password/${encodeURIComponent(token)}`,
        {
            password,
            confirmPassword,
        }
    );
};

// =====================================================
// RESEND VERIFY EMAIL
// =====================================================

export const resendVerifyEmail = async (email) => {
    return postJSON("/resend-verify-email", {
        email,
    });
};
