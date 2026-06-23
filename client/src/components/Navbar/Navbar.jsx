import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";

export default function Navbar() {
    const { cartItems } = useCart();

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

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

            <Link to="/products/create">
                Create Product
            </Link>

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

            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
        </nav>
    );
}