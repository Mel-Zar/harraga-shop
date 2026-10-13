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
import "./Navbar.scss";

export default function Navbar() {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const [auth, setAuth] = useState(() => getAuthState());
    const [menuOpen, setMenuOpen] = useState(false);

    // Uppdatera autentiseringsstatus när den ändras.
    useEffect(() => {
        const refreshAuth = () => {
            setAuth(getAuthState());
        };

        window.addEventListener("auth-change", refreshAuth);
        window.addEventListener("storage", refreshAuth);

        return () => {
            window.removeEventListener("auth-change", refreshAuth);
            window.removeEventListener("storage", refreshAuth);
        };
    }, []);

    // Stäng mobilmenyn med Escape.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const { loggedIn, admin, user } = auth;

    // Räkna ihop antalet produkter i kundvagnen.
    const cartCount = useMemo(() => {
        return cartItems.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );
    }, [cartItems]);

    // Stäng menyn när användaren klickar på en länk.
    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Logga ut användaren.
    const handleLogout = () => {
        logout();
        setAuth(getAuthState());
        setMenuOpen(false);

        toast.success("👋 You have been logged out successfully.", {
            position: "top-right",
            autoClose: 2500,
            theme: "colored",
        });

        navigate("/", { replace: true });
    };

    return (
        <nav className="navbar" aria-label="Huvudmeny">
            <div className="navbar__inner">

                {/* Logotyp */}
                <Link
                    to="/"
                    className="navbar__brand"
                    onClick={closeMenu}
                    aria-label="Harraga – startsida"
                >
                    HARRAGA<span>.</span>
                </Link>

                {/* Hamburgerknapp för mobil */}
                <button
                    type="button"
                    className={`navbar__toggle ${menuOpen ? "is-open" : ""
                        }`}
                    aria-label={
                        menuOpen ? "Stäng meny" : "Öppna meny"
                    }
                    aria-expanded={menuOpen}
                    aria-controls="navbar-menu"
                    onClick={() => {
                        setMenuOpen((open) => !open);
                    }}
                >
                    <span />
                    <span />
                    <span />
                </button>

                {/* Navigation */}
                <div
                    id="navbar-menu"
                    className={`navbar__menu ${menuOpen ? "is-open" : ""
                        }`}
                >
                    <div className="navbar__links">
                        <Link to="/" onClick={closeMenu}>
                            Home
                        </Link>

                        <Link to="/products" onClick={closeMenu}>
                            Products
                        </Link>

                        <Link to="/kundservice" onClick={closeMenu}>
                            Kundservice
                        </Link>

                        {/* Länkar för vanliga inloggade användare */}
                        {loggedIn && !admin && (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={closeMenu}
                                >
                                    My Profile
                                </Link>

                                <Link
                                    to="/profile/orders"
                                    onClick={closeMenu}
                                >
                                    My Orders
                                </Link>

                                <Link
                                    to="/profile/address"
                                    onClick={closeMenu}
                                >
                                    Address Book
                                </Link>
                            </>
                        )}

                        {/* Länk för administratörer */}
                        {loggedIn && admin && (
                            <Link
                                to="/admin/dashboard"
                                onClick={closeMenu}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Kundvagn och konto */}
                    <div className="navbar__account">
                        <Link
                            to="/cart"
                            className="navbar__cart"
                            onClick={closeMenu}
                            aria-label={`Cart, ${cartCount} produkter`}
                        >
                            Cart

                            {cartCount > 0 && (
                                <span className="navbar__cart-count">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Gäst: logga in eller registrera dig */}
                        {!loggedIn && (
                            <>
                                <Link
                                    to="/login"
                                    className="navbar__login"
                                    onClick={closeMenu}
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="navbar__register"
                                    onClick={closeMenu}
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Inloggad användare */}
                        {loggedIn && (
                            <>
                                <span
                                    className="navbar__username"
                                    title={
                                        admin
                                            ? "Administratör"
                                            : user?.username || "Konto"
                                    }
                                >
                                    {admin
                                        ? "Admin"
                                        : user?.username
                                            ? `@${user.username}`
                                            : "Account"}
                                </span>

                                <button
                                    type="button"
                                    className="navbar__logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
