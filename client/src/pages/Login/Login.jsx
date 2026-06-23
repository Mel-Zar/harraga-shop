import { useState } from "react";
import { loginUser, resendVerifyEmail } from "../../services/authService";
import { saveUser } from "../../utils/auth";
import { Link } from "react-router-dom";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || resendLoading) return;

        setError("");
        setSuccess("");
        setVerifyMessage("");
        setResendMessage("");
        setLoading(true);

        if (!identifier.trim() || !password) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser({ identifier, password });

            saveUser(data);

            // 🔥 FIX: extra säkerhet (viktig!)
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            setSuccess("Login successful!");

        } catch (err) {
            if (err.message.toLowerCase().includes("verify your email")) {
                setVerifyMessage("Your account is not verified. Resend verification email?");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendLoading || loading) return;

        setError("");
        setSuccess("");
        setResendMessage("");

        if (!identifier.trim() || !identifier.includes("@")) {
            setError("Enter your email in the Email/Username field to resend verification.");
            return;
        }

        try {
            setResendLoading(true);

            const data = await resendVerifyEmail(identifier);

            setResendMessage(data.message);
            setVerifyMessage("");

        } catch (err) {
            setError(err.message);
        } finally {
            setResendLoading(false);
        }
    };

    const handleIdentifierChange = (e) => {
        setIdentifier(e.target.value);
        setVerifyMessage("");
        setResendMessage("");
        setError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError("");
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    disabled={loading || resendLoading}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading || resendLoading}
                />

                <button type="submit" disabled={loading || resendLoading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p style={{ marginTop: "10px" }}>
                    <Link to="/forgot-password">Forgot password?</Link>
                </p>

                {verifyMessage && (
                    <div style={{ marginTop: 15 }}>
                        <p style={{ color: "orange", fontWeight: "bold" }}>
                            ⚠️ {verifyMessage}
                        </p>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            style={{
                                marginTop: 10,
                                background: "black",
                                color: "white",
                                padding: "10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border: "none",
                                width: "100%"
                            }}
                        >
                            {resendLoading ? "Sending..." : "Resend verification email"}
                        </button>
                    </div>
                )}

                {resendMessage && (
                    <p style={{ color: "green", marginTop: 10 }}>
                        ✅ {resendMessage}
                    </p>
                )}

                {error && (
                    <p style={{ color: "red", marginTop: 10 }}>
                        {error}
                    </p>
                )}

                {success && (
                    <p style={{ color: "green", marginTop: 10 }}>
                        {success}
                    </p>
                )}
            </form>
        </div>
    );
}