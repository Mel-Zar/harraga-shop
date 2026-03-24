import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
            <h2>Harraga</h2>

            {/* =========================
               🔗 NAV LINKS
            ========================= */}
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </nav>
    );
}