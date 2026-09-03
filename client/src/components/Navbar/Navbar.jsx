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

import { toast } from "react-toastify";

export default function Navbar() {

    const { cartItems } = useCart();

    const navigate = useNavigate();

    const [auth, setAuth] = useState(
        () => getAuthState()
    );

    // =====================================================
    // 🔐 REFRESH AUTH STATE
    // =====================================================

    useEffect(() => {
        const refreshAuth = () => {
            setAuth(getAuthState());
        };

        refreshAuth();

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

        setAuth(getAuthState());

        toast.success(
            "👋 You have been logged out successfully.",
            {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            }
        );

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
        fontSize: "15px",
    };

    // =====================================================
    // NAVBAR
    // =====================================================

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                padding: "14px 24px",
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
                    marginRight: "8px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "700",
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
                👑 ADMIN
                ONLY DASHBOARD IN NAVBAR
            ================================================= */}

            {loggedIn && admin && (
                <Link
                    to="/admin/dashboard"
                    style={linkStyle}
                >
                    Dashboard
                </Link>
            )}

            {/* =================================================
                🛒 CART
                ALLA
            ================================================= */}

            <Link
                to="/cart"
                style={{
                    ...linkStyle,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                Cart

                {cartCount > 0 && (
                    <span
                        style={{
                            marginLeft: "6px",
                            background:
                                "#dc2626",
                            color: "#fff",
                            borderRadius:
                                "999px",
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
                            whiteSpace:
                                "nowrap",
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

