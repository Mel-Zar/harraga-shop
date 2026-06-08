// =========================
// 💾 SAVE USER + TOKEN
// =========================
export const saveUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
};

// =========================
// 📦 GET USER
// =========================
export const getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

// =========================
// 🔐 GET TOKEN
// =========================
export const getToken = () => {
    const user = getUser();

    // ✅ Backend returns accessToken
    // fallback if token exists in future
    return user?.accessToken || user?.token;
};

// =========================
// ✅ IS LOGGED IN
// =========================
export const isLoggedIn = () => {
    const token = getToken();
    return !!token;
};

// =========================
// 🚪 LOGOUT
// =========================
export const logout = () => {
    localStorage.removeItem("user");
};

