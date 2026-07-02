import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    loginUser,
    resendVerifyEmail,
} from "../../services/authService";
import { saveUser } from "../../utils/auth";

export default function Login() {
    const navigate = useNavigate();

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

        if (!identifier.trim() || !password.trim()) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            const data = await loginUser({
                identifier,
                password,
            });

            // Sparar token + user
            saveUser(data);

            setSuccess("Login successful!");

            // Vänta lite så användaren ser meddelandet
            setTimeout(() => {
                navigate("/");
            }, 500);

        } catch (err) {
            if (
                err.message
                    .toLowerCase()
                    .includes("verify your email")
            ) {
                setVerifyMessage(
                    "Your account is not verified. Resend verification email?"
                );
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading || resendLoading) return;

        setError("");
        setSuccess("");
        setResendMessage("");

        if (
            !identifier.trim() ||
            !identifier.includes("@")
        ) {
            setError(
                "Enter your email in the Email/Username field to resend verification."
            );
            return;
        }

        try {
            setResendLoading(true);

            const data =
                await resendVerifyEmail(identifier);

            setResendMessage(data.message);
            setVerifyMessage("");
        } catch (err) {
            setError(err.message);
        } finally {
            setResendLoading(false);
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
                    onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError("");
                        setVerifyMessage("");
                        setResendMessage("");
                    }}
                    disabled={
                        loading || resendLoading
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                    disabled={
                        loading || resendLoading
                    }
                />

                <button
                    type="submit"
                    disabled={
                        loading || resendLoading
                    }
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

                <p style={{ marginTop: "10px" }}>
                    <Link to="/forgot-password">
                        Forgot password?
                    </Link>
                </p>

                {verifyMessage && (
                    <div style={{ marginTop: 15 }}>
                        <p
                            style={{
                                color: "orange",
                                fontWeight: "bold",
                            }}
                        >
                            ⚠️ {verifyMessage}
                        </p>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={
                                resendLoading
                            }
                            style={{
                                marginTop: 10,
                                background:
                                    "black",
                                color: "white",
                                padding: "10px",
                                borderRadius:
                                    "6px",
                                cursor: "pointer",
                                border: "none",
                                width: "100%",
                            }}
                        >
                            {resendLoading
                                ? "Sending..."
                                : "Resend verification email"}
                        </button>
                    </div>
                )}

                {resendMessage && (
                    <p
                        style={{
                            color: "green",
                            marginTop: 10,
                        }}
                    >
                        ✅ {resendMessage}
                    </p>
                )}

                {error && (
                    <p
                        style={{
                            color: "red",
                            marginTop: 10,
                        }}
                    >
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        style={{
                            color: "green",
                            marginTop: 10,
                        }}
                    >
                        ✅ {success}
                    </p>
                )}
            </form>
        </div>
    );
}