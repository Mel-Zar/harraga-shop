// =========================
// 💾 SAVE USER + TOKEN
// =========================

export const saveUser = (data) => {
    if (data?.accessToken) {
        localStorage.setItem(
            "token",
            data.accessToken
        );
    }

    if (data?.user) {
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );
    }

    // Informera resten av appen om att auth ändrats
    window.dispatchEvent(
        new Event("auth-change")
    );
};

// =========================
// 📦 GET USER
// =========================

export const getUser = () => {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(user);

        if (!parsedUser || typeof parsedUser !== "object") {
            localStorage.removeItem("user");
            return null;
        }

        return parsedUser;
    } catch (error) {
        console.error(
            "GET USER ERROR:",
            error
        );

        localStorage.removeItem("user");

        return null;
    }
};

// =========================
// 🔐 GET TOKEN
// =========================

export const getToken = () => {
    const token =
        localStorage.getItem("token");

    if (
        !token ||
        token === "null" ||
        token === "undefined"
    ) {
        return null;
    }

    return token;
};

// =========================
// 👑 CHECK ADMIN VALUE
// =========================

const checkAdminValue = (value) => {
    return (
        value === true ||
        value === "true" ||
        value === 1 ||
        value === "1"
    );
};

// =========================
// 👑 IS ADMIN
// =========================

export const isAdmin = () => {
    const user = getUser();

    return (
        Boolean(user) &&
        checkAdminValue(user.isAdmin)
    );
};

// =========================
// ✅ IS LOGGED IN
// =========================

export const isLoggedIn = () => {
    const token = getToken();
    const user = getUser();

    return Boolean(
        token &&
        user
    );
};

// =========================
// 👤 IS NORMAL USER
// =========================

export const isUser = () => {
    return (
        isLoggedIn() &&
        !isAdmin()
    );
};

// =========================
// 🔐 GET AUTH STATE
// =========================

export const getAuthState = () => {
    const token = getToken();
    const user = getUser();
    const admin = checkAdminValue(
        user?.isAdmin
    );

    return {
        token,
        user,
        loggedIn: Boolean(
            token &&
            user
        ),
        admin,
        normalUser:
            Boolean(
                token &&
                user &&
                !admin
            ),
    };
};

// =========================
// 🔄 UPDATE STORED USER
// =========================

export const updateStoredUser = (
    user
) => {
    if (!user) {
        return;
    }

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    window.dispatchEvent(
        new Event("auth-change")
    );
};

// =========================
// 🚪 LOGOUT
// =========================

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
        new Event("auth-change")
    );
};