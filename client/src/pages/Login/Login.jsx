import { useState } from "react";
import { loginUser } from "../../services/authService";
import { saveUser } from "../../utils/auth";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================
    // 🔐 HANDLE LOGIN
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // reset states
        setError("");
        setLoading(true);

        // =========================
        // ⚠️ BASIC VALIDATION
        // =========================
        if (!identifier || !password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser({ identifier, password });

            console.log("LOGIN SUCCESS:", data);

            // 🔥 save token + user
            saveUser(data);

            // optional redirect later
            // navigate("/dashboard");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* =========================
                   ❌ ERROR UI (PRO)
                ========================= */}
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}
