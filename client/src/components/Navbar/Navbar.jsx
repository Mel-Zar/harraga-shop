import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav
            style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                alignItems: "center",
            }}
        >
            <Link to="/"><h2>Harraga</h2></Link>

            {/* =========================
               🔗 NAV LINKS
            ========================= */}

            <Link to="/">Home</Link>

            <Link to="/products">
                Products
            </Link>

            <Link to="/products/create">
                Create Product
            </Link>

            <Link to="/login">
                Login
            </Link>

            <Link to="/register">
                Register
            </Link>
        </nav>
    );
}