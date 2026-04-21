import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔥 NEW: låser sidan efter reset
    const [done, setDone] = useState(false);

    // ✅ redirect after success
    useEffect(() => {
        if (done) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [done, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || done) return;

        setError("");
        setSuccess("");

        if (!password || !confirmPassword) {
            return setError("All fields are required");
        }

        if (password.length < 8) {
            return setError("Password must be at least 8 characters");
        }

        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

        if (!hasNumber || !hasSpecial) {
            return setError("Password must contain at least 1 number and 1 special character");
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);

            const data = await resetPassword(token, password, confirmPassword);

            // 🔥 så ESLint inte klagar 
            console.log("Reset password response:", data);


            setSuccess("Password has changed");

            setPassword("");
            setConfirmPassword("");

            // 🔥 låser sidan så man inte kan ändra igen
            setDone(true);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 om password reset lyckades → visa bara text
    if (done) {
        return (
            <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
                <h2>Reset Password</h2>
                <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
                    ✅ Password has changed <br />
                    Redirecting to login...
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
            <form onSubmit={handleSubmit}>
                <h2>Reset Password</h2>

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc"
                    }}
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? "Resetting..." : "Reset Password"}
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
