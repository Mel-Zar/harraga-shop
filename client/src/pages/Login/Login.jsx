import { useState } from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
    loginUser,
    resendVerifyEmail,
} from "../../services/authService";

import {
    saveUser,
} from "../../utils/auth";

export default function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [identifier, setIdentifier] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [verifyMessage, setVerifyMessage] =
        useState("");

    const [resendMessage, setResendMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    // =====================================================
    // 🔐 LOGIN
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            loading ||
            resendLoading
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setVerifyMessage("");
        setResendMessage("");

        if (
            !identifier.trim() ||
            !password.trim()
        ) {
            const message =
                "All fields are required.";

            setError(message);
            toast.error(message);

            return;
        }

        setLoading(true);

        try {
            const data =
                await loginUser({
                    identifier:
                        identifier.trim(),
                    password,
                });

            // =============================================
            // SAVE TOKEN + USER
            // =============================================

            saveUser(data);

            const message =
                "Login successful!";

            setSuccess(message);
            toast.success(message);

            // =============================================
            // REDIRECT
            // =============================================

            const user =
                data?.user;

            const requestedPath =
                location.state?.from;

            setTimeout(() => {

                if (
                    user?.isAdmin === true
                ) {
                    navigate(
                        "/admin/dashboard",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                if (
                    requestedPath &&
                    !requestedPath.startsWith(
                        "/admin"
                    )
                ) {
                    navigate(
                        requestedPath,
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                navigate("/", {
                    replace: true,
                });

            }, 300);

        } catch (err) {

            const message =
                err?.message ||
                "Login failed.";

            if (
                message
                    .toLowerCase()
                    .includes(
                        "verify your email"
                    )
            ) {

                const verifyText =
                    "Your account is not verified. Resend verification email?";

                setVerifyMessage(
                    verifyText
                );

                toast.warning(
                    verifyText
                );

            } else {

                setError(message);
                toast.error(message);
            }

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // 📩 RESEND VERIFICATION
    // =====================================================

    const handleResend = async () => {

        if (
            loading ||
            resendLoading
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setResendMessage("");

        const value =
            identifier.trim();

        if (
            !value ||
            !value.includes("@")
        ) {

            const message =
                "Enter your email in the Email/Username field to resend verification.";

            setError(message);
            toast.error(message);

            return;
        }

        try {

            setResendLoading(true);

            const data =
                await resendVerifyEmail(
                    value
                );

            const message =
                data?.message ||
                "Verification email sent.";

            setResendMessage(message);
            setVerifyMessage("");

            toast.success(message);

        } catch (err) {

            const message =
                err?.message ||
                "Failed to resend verification email.";

            setError(message);

            toast.error(message);

        } finally {
            setResendLoading(false);
        }
    };

    const disabled =
        loading ||
        resendLoading;

    return (
        <div className="login">

            <form
                onSubmit={handleSubmit}
            >

                <h2>
                    Login
                </h2>

                <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => {
                        setIdentifier(
                            e.target.value
                        );

                        setError("");
                        setVerifyMessage("");
                        setResendMessage("");
                    }}
                    disabled={disabled}
                    autoComplete="username"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(
                            e.target.value
                        );

                        setError("");
                    }}
                    disabled={disabled}
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    disabled={disabled}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

                <p
                    style={{
                        marginTop: "10px",
                    }}
                >
                    <Link
                        to="/forgot-password"
                    >
                        Forgot password?
                    </Link>
                </p>

                {/* =================================================
                    VERIFY MESSAGE
                ================================================= */}

                {verifyMessage && (
                    <div
                        style={{
                            marginTop: 15,
                        }}
                    >
                        <p
                            style={{
                                color:
                                    "orange",
                                fontWeight:
                                    "bold",
                            }}
                        >
                            ⚠️{" "}
                            {
                                verifyMessage
                            }
                        </p>

                        <button
                            type="button"
                            onClick={
                                handleResend
                            }
                            disabled={
                                resendLoading
                            }
                            style={{
                                marginTop:
                                    10,
                                background:
                                    "black",
                                color:
                                    "white",
                                padding:
                                    "10px",
                                borderRadius:
                                    "6px",
                                cursor:
                                    "pointer",
                                border:
                                    "none",
                                width:
                                    "100%",
                            }}
                        >
                            {resendLoading
                                ? "Sending..."
                                : "Resend verification email"}
                        </button>
                    </div>
                )}

                {/* =================================================
                    RESEND SUCCESS
                ================================================= */}

                {resendMessage && (
                    <p
                        style={{
                            color:
                                "green",
                            marginTop:
                                10,
                        }}
                    >
                        ✅{" "}
                        {
                            resendMessage
                        }
                    </p>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <p
                        style={{
                            color:
                                "red",
                            marginTop:
                                10,
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* =================================================
                    LOGIN SUCCESS
                ================================================= */}

                {success && (
                    <p
                        style={{
                            color:
                                "green",
                            marginTop:
                                10,
                        }}
                    >
                        ✅{" "}
                        {success}
                    </p>
                )}

            </form>

        </div>
    );
}
