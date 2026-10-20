
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/useCart";
import { getAuthState, logout } from "../../utils/auth";
import { toast } from "react-toastify";
import "./Navbar.scss";

export default function Navbar() {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const [auth, setAuth] = useState(() => getAuthState());
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const refreshAuth = () => setAuth(getAuthState());

        window.addEventListener("auth-change", refreshAuth);
        window.addEventListener("storage", refreshAuth);

        return () => {
            window.removeEventListener("auth-change", refreshAuth);
            window.removeEventListener("storage", refreshAuth);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const { loggedIn, admin, user } = auth;

    const cartCount = useMemo(
        () =>
            cartItems.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0
            ),
        [cartItems]
    );

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        setAuth(getAuthState());
        closeMenu();

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
                <Link
                    to="/"
                    className="navbar__brand"
                    onClick={closeMenu}
                    aria-label="Harraga – startsida"
                >
                    HARRAGA<span>.</span>
                </Link>

                <button
                    type="button"
                    className={`navbar__toggle ${menuOpen ? "is-open" : ""}`}
                    aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
                    aria-expanded={menuOpen}
                    aria-controls="navbar-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    id="navbar-menu"
                    className={`navbar__menu ${menuOpen ? "is-open" : ""}`}
                >
                    <div className="navbar__links">
                        <Link to="/" onClick={closeMenu}>Home</Link>
                        <Link to="/products" onClick={closeMenu}>Products</Link>

                        {loggedIn && !admin && (
                            <>
                                <Link to="/profile" onClick={closeMenu}>
                                    My Profile
                                </Link>
                                <Link to="/profile/orders" onClick={closeMenu}>
                                    My Orders
                                </Link>
                                <Link to="/profile/address" onClick={closeMenu}>
                                    Address Book
                                </Link>
                            </>
                        )}

                        {loggedIn && admin && (
                            <Link to="/admin/dashboard" onClick={closeMenu}>
                                Dashboard
                            </Link>
                        )}
                    </div>

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