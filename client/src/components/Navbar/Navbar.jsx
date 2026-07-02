import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/useCart";
import {
    isAdmin,
    isLoggedIn,
    logout,
} from "../../utils/auth";

export default function Navbar() {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav
            style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                alignItems: "center",
            }}
        >
            <Link to="/">
                <h2>Harraga</h2>
            </Link>

            <Link to="/">Home</Link>

            <Link to="/products">Products</Link>

            {/* 🔥 VISAS FÖR ALLA INLOGGADE */}
            {isLoggedIn() && (
                <Link to="/profile">
                    My Profile
                </Link>
            )}

            {/* 🔥 VISAS ENDAST FÖR ADMIN */}
            {isAdmin() && (
                <>
                    <Link to="/admin/create">
                        Create Product
                    </Link>

                    <Link to="/admin/orders">
                        Orders
                    </Link>
                </>
            )}

            {/* 🔥 CART MED COUNT */}
            <Link
                to="/cart"
                style={{
                    position: "relative",
                }}
            >
                Cart{" "}
                {cartCount > 0 && (
                    <span
                        style={{
                            marginLeft: "6px",
                            background: "red",
                            color: "white",
                            borderRadius: "50%",
                            padding: "2px 8px",
                            fontSize: "12px",
                        }}
                    >
                        {cartCount}
                    </span>
                )}
            </Link>

            {!isLoggedIn() ? (
                <>
                    <Link to="/login">Login</Link>

                    <Link to="/register">Register</Link>
                </>
            ) : (
                <button
                    onClick={handleLogout}
                    style={{
                        background: "black",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        cursor: "pointer",
                        borderRadius: "6px",
                    }}
                >
                    Logout
                </button>
            )}
        </nav>
    );
}