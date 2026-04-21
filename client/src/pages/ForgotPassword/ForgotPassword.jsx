import { useState } from "react";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        if (!email.trim()) {
            return setError("Email is required");
        }

        try {
            setLoading(true);

            const data = await forgotPassword(email);

            setSuccess(data.message);
            setEmail("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
            <form onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc"
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "15px",
                        background: "black",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                {error && (
                    <p style={{ color: "red", marginTop: "10px" }}>
                        {error}
                    </p>
                )}

                {success && (
                    <p style={{ color: "green", marginTop: "10px" }}>
                        ✅ {success}
                    </p>
                )}
            </form>
        </div>
    );
}
