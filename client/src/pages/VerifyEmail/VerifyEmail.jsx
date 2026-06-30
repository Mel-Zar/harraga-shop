import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function VerifyEmail() {
    const { userId, token } = useParams();

    console.log("🟢 VerifyEmail page loaded");
    console.log("USER ID:", userId);
    console.log("TOKEN:", token);
    console.log("API URL:", import.meta.env.VITE_API_URL);

    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const verify = async () => {
            try {
                const url = `${import.meta.env.VITE_API_URL}/api/auth/verify-email/${userId}/${token}`;

                console.log("➡️ Fetching:", url);

                const res = await fetch(url);

                console.log("STATUS:", res.status);

                const data = await res.json();

                console.log("VERIFY RESPONSE:", data);

                if (!res.ok) {
                    setStatus("error");
                    return;
                }

                if (data.message === "Email already verified") {
                    setStatus("already");
                    return;
                }

                if (data.message === "Email verified successfully") {
                    setStatus("success");
                    return;
                }

                setStatus("error");

            } catch (err) {
                console.error("❌ NETWORK ERROR:", err);
                setStatus("error");
            }
        };

        verify();
    }, [userId, token]);

    if (status === "loading") {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>Verifying email...</h2>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>✅ Email verified! You can now login.</h2>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    if (status === "already") {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>✅ Your email is already verified.</h2>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>❌ Verification failed or expired link</h2>
        </div>
    );
}