import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useCart } from "../../context/useCart";

import {
    getAuthState,
    logout,
} from "../../utils/auth";

export default function Navbar() {

    const { cartItems } = useCart();

    const navigate = useNavigate();

    const [auth, setAuth] = useState(
        () => getAuthState()
    );

    // =====================================================
    // 🔐 REFRESH AUTH STATE
    // =====================================================
    // Auth-state uppdateras när login/logout skickar
    // "auth-change" och när localStorage ändras från
    // en annan tab/window.
    //
    // Vi använder INTE location.pathname här eftersom
    // auth-state inte behöver uppdateras manuellt varje
    // gång användaren byter route.
    // =====================================================

    useEffect(() => {
        const refreshAuth = () => {
            setAuth(getAuthState());
        };

        window.addEventListener(
            "auth-change",
            refreshAuth
        );

        window.addEventListener(
            "storage",
            refreshAuth
        );

        return () => {
            window.removeEventListener(
                "auth-change",
                refreshAuth
            );

            window.removeEventListener(
                "storage",
                refreshAuth
            );
        };
    }, []);

    // =====================================================
    // AUTH STATE
    // =====================================================

    const {
        loggedIn,
        admin,
        user,
    } = auth;

    // =====================================================
    // 🛒 CART COUNT
    // =====================================================

    const cartCount = useMemo(() => {
        return cartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );
    }, [cartItems]);

    // =====================================================
    // 🚪 LOGOUT
    // =====================================================

    const handleLogout = () => {
        logout();

        // Uppdatera navbar direkt även om
        // logout() inte skickar auth-change.
        setAuth(getAuthState());

        navigate("/", {
            replace: true,
        });
    };

    // =====================================================
    // LINK STYLE
    // =====================================================

    const linkStyle = {
        textDecoration: "none",
        color: "#222",
        fontWeight: "500",
        whiteSpace: "nowrap",
    };

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                padding: "16px 24px",
                flexWrap: "wrap",
                borderBottom:
                    "1px solid #e5e5e5",
                background: "#fff",
                boxShadow:
                    "0 2px 10px rgba(0,0,0,0.04)",
                position: "sticky",
                top: 0,
                zIndex: 1000,
            }}
        >

            {/* =================================================
                🏠 BRAND
            ================================================= */}

            <Link
                to="/"
                style={{
                    textDecoration: "none",
                    color: "#111",
                    marginRight: "10px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "22px",
                    }}
                >
                    Harraga
                </h2>
            </Link>

            {/* =================================================
                🌍 PUBLIC
                ALLA
            ================================================= */}

            <Link
                to="/"
                style={linkStyle}
            >
                Home
            </Link>

            <Link
                to="/products"
                style={linkStyle}
            >
                Products
            </Link>

            {/* =================================================
                👤 NORMAL USER ONLY
            ================================================= */}

            {loggedIn && !admin && (
                <>
                    <Link
                        to="/profile"
                        style={linkStyle}
                    >
                        My Profile
                    </Link>

                    <Link
                        to="/profile/orders"
                        style={linkStyle}
                    >
                        My Orders
                    </Link>

                    <Link
                        to="/profile/address"
                        style={linkStyle}
                    >
                        Address Book
                    </Link>
                </>
            )}

            {/* =================================================
                👑 ADMIN ONLY
            ================================================= */}

            {loggedIn && admin && (
                <>
                    <Link
                        to="/admin/dashboard"
                        style={linkStyle}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/admin/users"
                        style={linkStyle}
                    >
                        Users
                    </Link>

                    <Link
                        to="/admin/products"
                        style={linkStyle}
                    >
                        Products
                    </Link>

                    <Link
                        to="/admin/create"
                        style={linkStyle}
                    >
                        Create Product
                    </Link>

                    <Link
                        to="/admin/orders"
                        style={linkStyle}
                    >
                        Orders
                    </Link>
                </>
            )}

            {/* =================================================
                🛒 CART
                ALLA
            ================================================= */}

            <Link
                to="/cart"
                style={{
                    ...linkStyle,
                    position: "relative",
                }}
            >
                Cart

                {cartCount > 0 && (
                    <span
                        style={{
                            marginLeft: "6px",
                            background: "#dc2626",
                            color: "#fff",
                            borderRadius: "999px",
                            padding:
                                "2px 7px",
                            fontSize: "12px",
                            fontWeight: "700",
                        }}
                    >
                        {cartCount}
                    </span>
                )}
            </Link>

            {/* =================================================
                SPACER
            ================================================= */}

            <div
                style={{
                    flex: 1,
                    minWidth: "10px",
                }}
            />

            {/* =================================================
                🔐 GUEST
            ================================================= */}

            {!loggedIn && (
                <>
                    <Link
                        to="/login"
                        style={linkStyle}
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        style={linkStyle}
                    >
                        Register
                    </Link>
                </>
            )}

            {/* =================================================
                👤 LOGGED IN
            ================================================= */}

            {loggedIn && (
                <>
                    <span
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {admin
                            ? "Admin"
                            : user?.username
                                ? `@${user.username}`
                                : "Account"}
                    </span>

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        style={{
                            background:
                                "#111",
                            color:
                                "#fff",
                            border:
                                "none",
                            padding:
                                "9px 16px",
                            cursor:
                                "pointer",
                            borderRadius:
                                "7px",
                            fontWeight:
                                "600",
                        }}
                    >
                        Logout
                    </button>
                </>
            )}

        </nav>
    );
}