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

    const [adminMenuOpen, setAdminMenuOpen] =
        useState(false);

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

        setAdminMenuOpen(false);

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
        fontSize: "15px",
    };

    // =====================================================
    // ADMIN LINK STYLE
    // =====================================================

    const adminLinkStyle = {
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 14px",
        textDecoration: "none",
        color: "#222",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "7px",
    };

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
                👑 ADMIN MENU
            ================================================= */}

            {loggedIn && admin && (
                <div
                    style={{
                        position: "relative",
                    }}
                >

                    <button
                        type="button"
                        onClick={() =>
                            setAdminMenuOpen(
                                (open) => !open
                            )
                        }
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            background:
                                adminMenuOpen
                                    ? "#f3f3f3"
                                    : "transparent",
                            border: "none",
                            borderRadius: "8px",
                            padding:
                                "9px 11px",
                            cursor: "pointer",
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#222",
                        }}
                    >
                        Admin

                        <span
                            style={{
                                fontSize: "11px",
                                transform:
                                    adminMenuOpen
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                transition:
                                    "transform 0.15s ease",
                            }}
                        >
                            ▼
                        </span>
                    </button>

                    {adminMenuOpen && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                top: "calc(100% + 8px)",
                                left: 0,
                                width: "210px",
                                padding: "7px",
                                background: "#fff",
                                border:
                                    "1px solid #e5e5e5",
                                borderRadius:
                                    "11px",
                                boxShadow:
                                    "0 10px 30px rgba(0,0,0,0.10)",
                            }}
                        >

                            <Link
                                to="/admin/dashboard"
                                style={
                                    adminLinkStyle
                                }
                                onClick={() =>
                                    setAdminMenuOpen(
                                        false
                                    )
                                }
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/admin/users"
                                style={
                                    adminLinkStyle
                                }
                                onClick={() =>
                                    setAdminMenuOpen(
                                        false
                                    )
                                }
                            >
                                Users
                            </Link>

                            <Link
                                to="/admin/products"
                                style={
                                    adminLinkStyle
                                }
                                onClick={() =>
                                    setAdminMenuOpen(
                                        false
                                    )
                                }
                            >
                                Products
                            </Link>

                            <Link
                                to="/admin/create"
                                style={
                                    adminLinkStyle
                                }
                                onClick={() =>
                                    setAdminMenuOpen(
                                        false
                                    )
                                }
                            >
                                Create Product
                            </Link>

                            <Link
                                to="/admin/orders"
                                style={
                                    adminLinkStyle
                                }
                                onClick={() =>
                                    setAdminMenuOpen(
                                        false
                                    )
                                }
                            >
                                Orders
                            </Link>

                        </div>
                    )}

                </div>
            )}

            {/* =================================================
                🛒 CART
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