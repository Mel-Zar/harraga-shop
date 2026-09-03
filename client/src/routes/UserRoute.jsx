import {
    Navigate,
    useLocation,
} from "react-router-dom";

import {
    getToken,
    getUser,
} from "../utils/auth";

function UserRoute({ children }) {
    const location = useLocation();

    const token = getToken();
    const user = getUser();

    // =========================
    // 🔐 NOT LOGGED IN
    // =========================

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
            />
        );
    }

    // =========================
    // 👑 ADMIN
    // =========================

    if (
        user.isAdmin === true ||
        user.isAdmin === "true"
    ) {
        return (
            <Navigate
                to="/admin/dashboard"
                replace
            />
        );
    }

    // =========================
    // 👤 NORMAL USER
    // =========================

    return children;
}

export default UserRoute;