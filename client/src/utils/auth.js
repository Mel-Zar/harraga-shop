// =========================
// 💾 SAVE USER + TOKEN
// =========================
export const saveUser = (data) => {
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
};

// =========================
// 📦 GET USER
// =========================
export const getUser = () => {
    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);
};

// =========================
// 🔐 GET TOKEN
// =========================
export const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// 👑 IS ADMIN
// =========================
export const isAdmin = () => {
    const user = getUser();

    return user?.isAdmin === true;
};

// =========================
// ✅ IS LOGGED IN
// =========================
export const isLoggedIn = () => {
    return !!getToken();
};

// =========================
// 🚪 LOGOUT
// =========================
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};