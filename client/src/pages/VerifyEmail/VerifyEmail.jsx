import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function VerifyEmail() {
    const { userId, token } =
        useParams();

    console.log(
        "🟢 VerifyEmail page loaded"
    );

    console.log(
        "USER ID:",
        userId
    );

    console.log(
        "TOKEN:",
        token
    );

    console.log(
        "API URL:",
        import.meta.env.VITE_API_URL
    );

    const [status, setStatus] =
        useState("loading");

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {

        const verify = async () => {

            try {

                // =================================================
                // VALIDATE URL PARAMETERS
                // =================================================

                if (
                    !userId ||
                    !token
                ) {
                    console.error(
                        "❌ Missing userId or token"
                    );

                    setErrorMessage(
                        "Verification link is incomplete."
                    );

                    setStatus("error");

                    return;
                }

                // =================================================
                // BUILD VERIFY URL
                // =================================================

                const apiUrl =
                    import.meta.env
                        .VITE_API_URL;

                if (!apiUrl) {

                    console.error(
                        "❌ VITE_API_URL is missing"
                    );

                    setErrorMessage(
                        "Server configuration error."
                    );

                    setStatus("error");

                    return;
                }

                const url =
                    `${apiUrl}/api/auth/verify-email/${encodeURIComponent(
                        userId
                    )}/${encodeURIComponent(
                        token
                    )}`;

                console.log(
                    "➡️ Fetching:",
                    url
                );

                // =================================================
                // VERIFY EMAIL
                // =================================================

                const res =
                    await fetch(url, {
                        method: "GET",
                        headers: {
                            Accept:
                                "application/json",
                        },
                    });

                console.log(
                    "STATUS:",
                    res.status
                );

                // =================================================
                // READ RESPONSE SAFELY
                // =================================================

                let data = {};

                try {

                    data =
                        await res.json();

                } catch (jsonError) {

                    console.error(
                        "❌ Could not parse server response:",
                        jsonError
                    );

                    data = {};
                }

                console.log(
                    "VERIFY RESPONSE:",
                    data
                );

                // =================================================
                // BACKEND ERROR
                // =================================================

                if (!res.ok) {

                    setErrorMessage(
                        data?.message ||
                        "Verification failed or expired link."
                    );

                    setStatus(
                        "error"
                    );

                    return;
                }

                // =================================================
                // ALREADY VERIFIED
                // =================================================

                if (
                    data.message ===
                    "Email already verified"
                ) {

                    setStatus(
                        "already"
                    );

                    return;
                }

                // =================================================
                // SUCCESS
                // =================================================

                if (
                    data.message ===
                    "Email verified successfully"
                ) {

                    setStatus(
                        "success"
                    );

                    return;
                }

                // =================================================
                // UNKNOWN RESPONSE
                // =================================================

                console.error(
                    "❌ Unexpected verification response:",
                    data
                );

                setErrorMessage(
                    "Unexpected server response."
                );

                setStatus(
                    "error"
                );

            } catch (err) {

                console.error(
                    "❌ NETWORK ERROR:",
                    err
                );

                setErrorMessage(
                    "Could not connect to the server."
                );

                setStatus(
                    "error"
                );
            }
        };

        verify();

    }, [
        userId,
        token,
    ]);

    // =====================================================
    // LOADING
    // =====================================================

    if (
        status === "loading"
    ) {

        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                <h2>
                    Verifying email...
                </h2>
            </div>
        );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    if (
        status === "success"
    ) {

        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                <h2>
                    ✅ Email verified!
                </h2>

                <p>
                    You can now login.
                </p>

                <Link to="/login">
                    Go to Login
                </Link>
            </div>
        );
    }

    // =====================================================
    // ALREADY VERIFIED
    // =====================================================

    if (
        status === "already"
    ) {

        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                }}
            >
                <h2>
                    ✅ Your email is already verified.
                </h2>

                <Link to="/login">
                    Go to Login
                </Link>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    return (
        <div
            style={{
                padding: "40px",
                textAlign: "center",
            }}
        >
            <h2>
                ❌ Verification failed
            </h2>

            <p>
                {errorMessage ||
                    "Verification failed or expired link."}
            </p>

            <Link to="/login">
                Go to Login
            </Link>
        </div>
    );
}