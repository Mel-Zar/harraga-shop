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
// 🔐 GET TOKEN (IMPORTANT)
// =========================
export const getToken = () => {
    const user = getUser();
    return user?.token;
};

// =========================
// 🚪 LOGOUT
// =========================
export const logout = () => {
    localStorage.removeItem("user");
};
