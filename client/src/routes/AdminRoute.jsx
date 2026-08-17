import { Navigate, useLocation } from "react-router-dom";
import {
    getToken,
    getUser,
} from "../utils/auth";

function AdminRoute({ children }) {
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
                    from: location.pathname,
                }}
            />
        );
    }

    // =========================
    // 👤 NORMAL USER
    // =========================

    if (user.isAdmin !== true) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // =========================
    // 👑 ADMIN
    // =========================

    return children;
}

export default AdminRoute;