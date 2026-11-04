
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
    verifyTwoFactorLogin,
    setupTwoFactorEnrollment,
    enableTwoFactorEnrollment,
} from "../../services/authService";

import { saveUser } from "../../utils/auth";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // =====================================================
    // STATE
    // =====================================================

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [verifyMessage, setVerifyMessage] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    // TWO-FACTOR AUTHENTICATION

    const [twoFactorMode, setTwoFactorMode] = useState("");
    const [challengeToken, setChallengeToken] = useState("");

    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");

    const [qrCode, setQrCode] = useState("");
    const [manualSecret, setManualSecret] = useState("");

    const [recoveryCodes, setRecoveryCodes] = useState([]);

    const disabled = loading || resendLoading;

    // =====================================================
    // HELPERS
    // =====================================================

    const clearMessages = () => {
        setError("");
        setSuccess("");
        setVerifyMessage("");
        setResendMessage("");
    };

    const completeLogin = (data) => {
        if (!data?.accessToken || !data?.user) {
            throw new Error("Invalid login response.");
        }

        saveUser(data);

        toast.success("Login successful!");

        const user = data.user;
        const requestedPath = location.state?.from;

        if (user?.isAdmin === true) {
            navigate("/admin/dashboard", {
                replace: true,
            });
            return;
        }

        if (
            requestedPath &&
            typeof requestedPath === "string" &&
            requestedPath.startsWith("/") &&
            !requestedPath.startsWith("/admin")
        ) {
            navigate(requestedPath, {
                replace: true,
            });
            return;
        }

        navigate("/", {
            replace: true,
        });
    };

    // =====================================================
    // NORMAL LOGIN
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (disabled) return;

        clearMessages();

        if (!identifier.trim() || !password) {
            const message = "All fields are required.";

            setError(message);
            toast.error(message);
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser({
                identifier: identifier.trim(),
                password,
            });

            console.log("LOGIN RESPONSE:", data);

            // ADMIN: MANDATORY 2FA ENROLLMENT

            if (data?.twoFactorSetupRequired) {
                if (!data.challengeToken) {
                    throw new Error(
                        "Missing 2FA challenge token."
                    );
                }

                const setup = await setupTwoFactorEnrollment(
                    data.challengeToken
                );

                if (!setup?.qrCode || !setup?.manualSecret) {
                    throw new Error(
                        "Could not create the authenticator setup."
                    );
                }

                setChallengeToken(data.challengeToken);
                setQrCode(setup.qrCode);
                setManualSecret(setup.manualSecret);
                setTwoFactorMode("enroll");
                setPassword("");

                return;
            }

            // CUSTOMER OR ADMIN: 2FA REQUIRED

            if (data?.twoFactorRequired) {
                if (!data.challengeToken) {
                    throw new Error(
                        "Missing 2FA challenge token."
                    );
                }

                setChallengeToken(data.challengeToken);
                setTwoFactorMode("login");
                setPassword("");

                return;
            }

            // NORMAL LOGIN

            completeLogin(data);

        } catch (err) {
            const message =
                err?.message || "Login failed.";

            if (
                message.toLowerCase().includes(
                    "verify your email"
                )
            ) {
                const verifyText =
                    "Your account is not verified. Resend verification email?";

                setVerifyMessage(verifyText);
                toast.warning(verifyText);
            } else {
                setError(message);
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // TWO-FACTOR VERIFICATION
    // =====================================================

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();

        if (disabled) return;

        setError("");

        if (
            twoFactorMode === "login" &&
            !twoFactorCode.trim() &&
            !recoveryCode.trim()
        ) {
            setError(
                "Enter your authenticator code or recovery code."
            );
            return;
        }

        if (
            twoFactorMode === "enroll" &&
            !/^\d{6}$/.test(twoFactorCode)
        ) {
            setError(
                "Enter a valid 6-digit authenticator code."
            );
            return;
        }

        setLoading(true);

        try {
            // EXISTING ACCOUNT: VERIFY LOGIN

            if (twoFactorMode === "login") {
                const data = await verifyTwoFactorLogin(
                    challengeToken,
                    twoFactorCode,
                    recoveryCode
                );

                completeLogin(data);
                return;
            }

            // ADMIN: ACTIVATE 2FA

            if (twoFactorMode === "enroll") {
                const data = await enableTwoFactorEnrollment(
                    challengeToken,
                    twoFactorCode
                );

                if (
                    !Array.isArray(data?.recoveryCodes) ||
                    data.recoveryCodes.length === 0
                ) {
                    throw new Error(
                        "Two-factor authentication was activated, but recovery codes were not returned. Contact support before leaving this page."
                    );
                }

                setRecoveryCodes(data.recoveryCodes);
                setTwoFactorMode("recovery");

                setTwoFactorCode("");
                setRecoveryCode("");

                toast.success(
                    "Two-factor authentication activated!"
                );
            }
        } catch (err) {
            const message =
                err?.message ||
                "Two-factor verification failed.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESEND EMAIL VERIFICATION
    // =====================================================

    const handleResend = async () => {
        if (disabled) return;

        setError("");
        setSuccess("");
        setResendMessage("");

        const value = identifier.trim();

        if (!value || !value.includes("@")) {
            const message =
                "Enter your email in the Email/Username field to resend verification.";

            setError(message);
            toast.error(message);
            return;
        }

        try {
            setResendLoading(true);

            const data = await resendVerifyEmail(value);

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

    // =====================================================
    // COPY RECOVERY CODES
    // =====================================================

    const handleCopyRecoveryCodes = async () => {
        try {
            await navigator.clipboard.writeText(
                recoveryCodes.join("\n")
            );

            toast.success("Recovery codes copied!");
        } catch {
            toast.error(
                "Could not copy recovery codes. Please copy them manually."
            );
        }
    };

    // =====================================================
    // RETURN TO LOGIN
    // =====================================================

    const returnToLogin = () => {
        setTwoFactorMode("");
        setChallengeToken("");

        setTwoFactorCode("");
        setRecoveryCode("");

        setQrCode("");
        setManualSecret("");
        setRecoveryCodes([]);

        setPassword("");

        clearMessages();
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="login">

            <form
                onSubmit={
                    twoFactorMode === "login" ||
                        twoFactorMode === "enroll"
                        ? handleTwoFactorSubmit
                        : handleSubmit
                }
            >

                {/* =========================================
                    NORMAL LOGIN
                ========================================= */}

                {!twoFactorMode && (
                    <>
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
                            disabled={disabled}
                            autoComplete="username"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
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

                        <p style={{ marginTop: "10px" }}>
                            <Link to="/forgot-password">
                                Forgot password?
                            </Link>
                        </p>

                        {/* EMAIL VERIFICATION */}

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
                                    disabled={disabled}
                                    style={{
                                        marginTop: 10,
                                        width: "100%",
                                    }}
                                >
                                    {resendLoading
                                        ? "Sending..."
                                        : "Resend verification email"}
                                </button>
                            </div>
                        )}

                        {/* RESEND SUCCESS */}

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

                        {/* LOGIN SUCCESS */}

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
                    </>
                )}

                {/* =========================================
                    TWO-FACTOR LOGIN
                ========================================= */}

                {twoFactorMode === "login" && (
                    <>
                        <h2>Two-Factor Authentication</h2>

                        <p>
                            Enter your 6-digit authenticator code
                            or use a recovery code.
                        </p>

                        <input
                            type="text"
                            placeholder="6-digit authenticator code"
                            value={twoFactorCode}
                            onChange={(e) => {
                                setTwoFactorCode(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6)
                                );

                                setRecoveryCode("");
                                setError("");
                            }}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            disabled={disabled}
                        />

                        <p>Or enter a recovery code:</p>

                        <input
                            type="text"
                            placeholder="Recovery code"
                            value={recoveryCode}
                            onChange={(e) => {
                                setRecoveryCode(
                                    e.target.value.toUpperCase()
                                );

                                setTwoFactorCode("");
                                setError("");
                            }}
                            autoComplete="off"
                            disabled={disabled}
                        />

                        <button
                            type="submit"
                            disabled={disabled}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify and login"}
                        </button>

                        <button
                            type="button"
                            onClick={returnToLogin}
                            disabled={disabled}
                            style={{ marginTop: 10 }}
                        >
                            Back to login
                        </button>
                    </>
                )}

                {/* =========================================
                    TWO-FACTOR ENROLLMENT
                ========================================= */}

                {twoFactorMode === "enroll" && (
                    <>
                        <h2>Set Up Two-Factor Authentication</h2>

                        <p>
                            Scan this QR code using Google
                            Authenticator or Microsoft Authenticator.
                        </p>

                        {qrCode && (
                            <img
                                src={qrCode}
                                alt="Two-factor authentication QR code"
                                style={{
                                    display: "block",
                                    maxWidth: "220px",
                                    width: "100%",
                                    height: "auto",
                                    margin: "20px auto",
                                }}
                            />
                        )}

                        <p>
                            Or enter this secret manually:
                        </p>

                        <p
                            style={{
                                wordBreak: "break-all",
                                fontWeight: "bold",
                                padding: 10,
                            }}
                        >
                            {manualSecret}
                        </p>

                        <input
                            type="text"
                            placeholder="6-digit authenticator code"
                            value={twoFactorCode}
                            onChange={(e) => {
                                setTwoFactorCode(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6)
                                );

                                setError("");
                            }}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            disabled={disabled}
                        />

                        <button
                            type="submit"
                            disabled={disabled}
                        >
                            {loading
                                ? "Activating..."
                                : "Activate Two-Factor Authentication"}
                        </button>
                    </>
                )}

                {/* =========================================
                    RECOVERY CODES
                ========================================= */}

                {twoFactorMode === "recovery" && (
                    <>
                        <h2>Save Your Recovery Codes</h2>

                        <p>
                            Store these codes somewhere safe.
                            Each code can only be used once.
                        </p>

                        <div
                            style={{
                                margin: "20px 0",
                                padding: 15,
                                border: "1px solid #ccc",
                                borderRadius: 8,
                                wordBreak: "break-all",
                            }}
                        >
                            {recoveryCodes.map((code, index) => (
                                <p key={`${index}-${code}`}>
                                    {code}
                                </p>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyRecoveryCodes}
                        >
                            Copy recovery codes
                        </button>

                        <p
                            style={{
                                marginTop: 10,
                                color: "orange",
                            }}
                        >
                            These codes will not be shown again.
                            Save them before continuing.
                        </p>

                        <button
                            type="button"
                            onClick={returnToLogin}
                            style={{ marginTop: 10 }}
                        >
                            Continue to login
                        </button>
                    </>
                )}

                {/* =========================================
                    ERROR MESSAGE
                ========================================= */}

                {error && (
                    <p
                        role="alert"
                        style={{
                            color: "red",
                            marginTop: 10,
                        }}
                    >
                        {error}
                    </p>
                )}

            </form>
        </div>
    );
}
