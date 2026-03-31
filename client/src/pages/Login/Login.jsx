import { useState } from "react";
import { loginUser } from "../../services/authService";
import { saveUser } from "../../utils/auth";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!identifier.trim() || !password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser({ identifier, password });

            saveUser(data);

            setSuccess("Login successful!");

            // senare kan du navigera här
            // navigate("/");

        } catch (err) {
            setError(err.message);
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

                {error && <p className="error" style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
            </form>
        </div>
    );
}
